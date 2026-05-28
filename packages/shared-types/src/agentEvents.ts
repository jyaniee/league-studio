import type { DragonType, TeamSide } from "./gameState";

export type AgentObjectiveType =
  | "dragon"
  | "baron"
  | "herald"
  | "voidgrub";

export type AgentObjectiveRawEventName =
  | "DragonKill"
  | "BaronKill"
  | "HeraldKill"
  | "HordeKill";

export type AgentObjectiveEvent = {
  eventId: number;
  eventTime: number;
  objective: AgentObjectiveType;
  rawEventName: AgentObjectiveRawEventName;
  team: TeamSide | "unknown";
  killerName?: string;
  dragonType?: DragonType;
  rawDragonType?: string;
  stolen?: boolean;
};

export type AgentObjectiveEventPayload = {
  matchId: string;
  agentId: string;
  sentAt: string;
  event: AgentObjectiveEvent;
};