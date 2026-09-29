import type {
  DragonType,
  GameState,
  PlayerItem,
  PlayerPosition,
  PlayerState,
  TeamSide,
} from "@league-studio/shared-types";
import type { LiveClientRawData } from "../data-sources/liveClientTypes";
import { calculateObjectives } from "../calculators/objectiveTimers";

type LiveClientEvent = LiveClientRawData["eventData"]["Events"][number];
type LiveClientPlayer = LiveClientRawData["players"][number];
type LiveClientItem = NonNullable<LiveClientPlayer["items"]>[number];

const CHAMPION_KEY_PREFIX = "game_character_displayname_";
const TRINKET_SLOT = 6;
const POSITION_ORDER: PlayerPosition[] = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
];

function countTeamObjective(
  events: LiveClientEvent[],
  team: "ORDER" | "CHAOS",
  eventName: string,
): number {
  return events.filter(
    (event) => event.EventName === eventName && event.KillerTeam === team,
  ).length;
}

function addKillerTeamToEvents(
  events: LiveClientEvent[],
  players: LiveClientPlayer[],
): LiveClientEvent[] {
  return events.map((event) => {
    if (!event.KillerName) {
      return event;
    }

    const killer = players.find(
      (player) => player.summonerName === event.KillerName,
    );

    return {
      ...event,
      KillerTeam: killer?.team,
    };
  });
}

function sumTeamKills(players: LiveClientPlayer[], team: "ORDER" | "CHAOS") {
  return players
    .filter((player) => player.team === team)
    .reduce((sum, player) => sum + (player.scores?.kills ?? 0), 0);
}

function countTeamVoidgrubs(
  events: LiveClientEvent[],
  team: "ORDER" | "CHAOS",
): number {
  return events.filter(
    (event) => event.EventName === "HordeKill" && event.KillerTeam === team,
  ).length;
}

function mapDragonType(dragonType?: string): DragonType {
  const map: Record<string, DragonType> = {
    Cloud: "cloud",
    Infernal: "infernal",
    Mountain: "mountain",
    Ocean: "ocean",
    Hextech: "hextech",
    Chemtech: "chemtech",
    Elder: "elder",
  };
  return map[dragonType ?? ""] ?? "hextech";
}

function getTeamDragons(
  events: LiveClientEvent[],
  team: "ORDER" | "CHAOS",
): DragonType[] {
  return events
    .filter(
      (event) =>
        event.EventName === "DragonKill" &&
        event.KillerTeam === team &&
        event.DragonType !== "Elder",
    )
    .sort((a, b) => a.EventTime - b.EventTime)
    .map((event) => mapDragonType(event.DragonType));
}

function countTeamTowers(
  events: LiveClientEvent[],
  team: "ORDER" | "CHAOS",
): number {
  return events.filter(
    (event) => event.EventName === "TurretKilled" && event.KillerTeam === team,
  ).length;
}

function toTeamSide(team: "ORDER" | "CHAOS"): TeamSide {
  return team === "ORDER" ? "blue" : "red";
}

function toPlayerPosition(position?: string): PlayerPosition | undefined {
  return POSITION_ORDER.find((candidate) => candidate === position);
}

function toChampionKey(rawChampionName?: string): string {
  if (!rawChampionName?.startsWith(CHAMPION_KEY_PREFIX)) {
    return "";
  }

  return rawChampionName.slice(CHAMPION_KEY_PREFIX.length);
}

function mapPlayerItems(items: LiveClientItem[] | undefined): {
  items: PlayerItem[];
  trinketItemId?: number;
} {
  const inventory: PlayerItem[] = [];
  let trinketItemId: number | undefined;

  for (const item of items ?? []) {
    if (item.slot === TRINKET_SLOT) {
      trinketItemId = item.itemID;
      continue;
    }

    if (item.slot >= 0 && item.slot <= 5) {
      inventory.push({
        itemId: item.itemID,
        slot: item.slot,
      });
    }
  }

  inventory.sort((a, b) => a.slot - b.slot);

  return { items: inventory, trinketItemId };
}

function comparePlayers(a: PlayerState, b: PlayerState): number {
  if (a.side !== b.side) {
    return a.side === "blue" ? -1 : 1;
  }

  return POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position);
}

function mapPlayers(players: LiveClientPlayer[]): PlayerState[] {
  return players
    .flatMap((player) => {
      const position = toPlayerPosition(player.position);

      if (!position) {
        return [];
      }

      const { items, trinketItemId } = mapPlayerItems(player.items);

      return [
        {
          side: toTeamSide(player.team),
          position,
          championKey: toChampionKey(player.rawChampionName),
          kills: player.scores?.kills ?? 0,
          deaths: player.scores?.deaths ?? 0,
          assists: player.scores?.assists ?? 0,
          creepScore: player.scores?.creepScore ?? 0,
          items,
          trinketItemId,
        },
      ];
    })
    .sort(comparePlayers);
}

export function mapLiveClientToGameState(raw: LiveClientRawData): GameState {
  const gameTime = raw.gameStats.gameTime;
  const events = addKillerTeamToEvents(raw.eventData.Events ?? [], raw.players);

  return {
    phase: "in-game",
    gameTime: Math.floor(gameTime),
    blueTeam: {
      side: "blue",
      name: "BLUE",
      logoUrl: undefined,
      kills: sumTeamKills(raw.players, "ORDER"),
      globalGold: undefined,
      towers: countTeamTowers(events, "ORDER"),
      dragons: getTeamDragons(events, "ORDER"),
      voidgrubs: countTeamVoidgrubs(events, "ORDER"),
      heralds: countTeamObjective(events, "ORDER", "HeraldKill"),
      barons: countTeamObjective(events, "ORDER", "BaronKill"),
    },
    redTeam: {
      side: "red",
      name: "RED",
      logoUrl: undefined,
      kills: sumTeamKills(raw.players, "CHAOS"),
      globalGold: undefined,
      towers: countTeamTowers(events, "CHAOS"),
      dragons: getTeamDragons(events, "CHAOS"),
      voidgrubs: countTeamVoidgrubs(events, "CHAOS"),
      heralds: countTeamObjective(events, "CHAOS", "HeraldKill"),
      barons: countTeamObjective(events, "CHAOS", "BaronKill"),
    },
    players: mapPlayers(raw.players),
    objectives: calculateObjectives(gameTime, events),
    source: "live-client-api",
    updatedAt: new Date().toISOString(),
  };
}
