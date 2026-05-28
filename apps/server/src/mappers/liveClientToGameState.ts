import type { DragonType, GameState } from "@league-studio/shared-types";
import type { LiveClientRawData } from "../data-sources/liveClientTypes";
import { calculateObjectives } from "../calculators/objectiveTimers";

type LiveClientEvent = LiveClientRawData["eventData"]["Events"][number];
type LiveClientPlayer = LiveClientRawData["players"][number];

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
    },
    objectives: calculateObjectives(gameTime, events),
    source: "live-client-api",
    updatedAt: new Date().toISOString(),
  };
}
