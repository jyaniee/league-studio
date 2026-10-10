import type {
  DragonType,
  GameObjectives,
  GameState,
  ItemSlot,
  PlayerPosition,
  PlayerState,
  TeamSide,
  WardType,
} from "@league-studio/shared-types";
import type { LiveClientRawData } from "../data-sources/liveClientTypes";
import { calculateObjectives } from "../calculators/objectiveTimers";

type LiveClientEvent = LiveClientRawData["eventData"]["Events"][number];
type LiveClientPlayer = LiveClientRawData["players"][number];
type LiveClientItem = NonNullable<LiveClientPlayer["items"]>[number];

const CHAMPION_KEY_PREFIX = "game_character_displayname_";
const TRINKET_SLOT = 6;
const ITEM_SLOT_COUNT = 6;
const POSITION_ORDER: PlayerPosition[] = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
];

const WARD_BY_ITEM_ID: Record<number, WardType> = {
  3340: "stealth",
  3364: "oracle",
  3363: "farsight",
  3330: "effigy",
};

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

function emptyItemSlots(): ItemSlot[] {
  return Array.from({ length: ITEM_SLOT_COUNT }, () => null);
}

function toWard(itemId: number | undefined): WardType | null {
  if (itemId === undefined) {
    return null;
  }

  return WARD_BY_ITEM_ID[itemId] ?? null;
}

function mapPlayerLoadout(items: LiveClientItem[] | undefined): {
  items: ItemSlot[];
  ward: WardType | null;
} {
  const inventory = emptyItemSlots();
  let trinketItemId: number | undefined;

  for (const item of items ?? []) {
    if (item.slot === TRINKET_SLOT) {
      trinketItemId = item.itemID;
      continue;
    }

    if (item.slot >= 0 && item.slot < ITEM_SLOT_COUNT) {
      inventory[item.slot] = item.itemID;
    }
  }

  return { items: inventory, ward: toWard(trinketItemId) };
}

type RankedPlayer = {
  side: TeamSide;
  player: PlayerState;
};

function mapRankedPlayers(players: LiveClientPlayer[]): RankedPlayer[] {
  return players.flatMap((player) => {
    const position = toPlayerPosition(player.position);

    if (!position) {
      return [];
    }

    const { items, ward } = mapPlayerLoadout(player.items);

    return [
      {
        side: toTeamSide(player.team),
        player: {
          position,
          championName: toChampionKey(player.rawChampionName),
          kills: player.scores?.kills ?? 0,
          deaths: player.scores?.deaths ?? 0,
          assists: player.scores?.assists ?? 0,
          cs: player.scores?.creepScore ?? 0,
          items,
          ward,
        },
      },
    ];
  });
}

function playersForSide(players: RankedPlayer[], side: TeamSide): PlayerState[] {
  return players
    .filter((entry) => entry.side === side)
    .sort(
      (a, b) =>
        POSITION_ORDER.indexOf(a.player.position) -
        POSITION_ORDER.indexOf(b.player.position),
    )
    .map((entry) => entry.player);
}

export function mapLiveClientToGameState(raw: LiveClientRawData): GameState {
  const gameTime = raw.gameStats.gameTime;
  const events = addKillerTeamToEvents(raw.eventData.Events ?? [], raw.players);

  const hasGameStarted = events.some(
    (event) => event.EventName === "GameStart",
  );

  const rankedPlayers = mapRankedPlayers(raw.players);

  return {
    phase: hasGameStarted ? "in-game" : "pre-game",
    gameTime: hasGameStarted ? Math.floor(gameTime) : 0,
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
      players: playersForSide(rankedPlayers, "blue"),
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
      players: playersForSide(rankedPlayers, "red"),
    },
    objectives: hasGameStarted ? calculateObjectives(gameTime, events) : createPreGameObjectives(),
    source: "live-client-api",
    updatedAt: new Date().toISOString(),
  };
}

function createPreGameObjectives(): GameObjectives {
  return {
    dragon: {
      status: "inactive",
      isAlive: false,
      canRespawn: true,
    },
    elder: {
      status: "inactive",
      isAlive: false,
      canRespawn: true,
    },
    baron: {
      status: "inactive",
      isAlive: false,
      canRespawn: true,
    },
    herald: {
      status: "inactive",
      isAlive: false,
      canRespawn: true,
    },
    voidgrubs: {
      status: "inactive",
      isAlive: false,
      canRespawn: false,
    },
  };
}