export interface LiveClientGameStats {
  gameTime: number;
}

export interface LiveClientEvent {
  EventID: number;
  EventName: string;
  EventTime: number;
  KillerName?: string;
  VictimName?: string;
  KillerTeam?: "ORDER" | "CHAOS";
  DragonType?: string;
}

export interface LiveClientEventData {
  Events: LiveClientEvent[];
}

export interface LiveClientPlayer {
  summonerName: string;
  championName: string;
  team: "ORDER" | "CHAOS";
  scores?: {
    kills?: number;
    deaths?: number;
    assists?: number;
    creepScore?: number;
  };
}

export interface LiveClientRawData {
  gameStats: LiveClientGameStats;
  eventData: LiveClientEventData;
  players: LiveClientPlayer[];
}
