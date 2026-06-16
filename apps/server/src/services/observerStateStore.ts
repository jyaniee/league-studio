import type {
    GameState,
    NormalDragonType,
    ObserverMatchInfoPayload,
    ObserverStatePatchPayload,
    ObserverTeamInfo,
    TeamSide,
} from "@league-studio/shared-types";
import { stat } from "fs";

const MIN_CONFIDENCE = 0.85;

type StoredObserverTeamState = Partial<ObserverTeamInfo> & {
    globalGold?: number;
};

type StoredObserverState = {
    matchId: string | null;
    observerId: string | null;
    tournamentName?: string;
    setNumber?: number;
    teams: Record<TeamSide, StoredObserverTeamState>;
    objectives: {
        nextDragonType?: NormalDragonType;
    };
    updatedAt?: string;
};

type ObserverStatePatchStatus = "applied" | "partial" | "ignored";

type ObserverStatePatchResult = {
    status: ObserverStatePatchStatus;
    state: StoredObserverState;
    appliedFields: string[];
    ignoredFields: string[];
};

const createEmptyObserverState = (): StoredObserverState => ({
    matchId: null,
    observerId: null,
    teams: {
        blue: {},
        red: {},
    },
    objectives: {},
});

let state = createEmptyObserverState();

function cloneState(): StoredObserverState {
    return {
        ...state,
        teams: {
            blue: { ...state.teams.blue },
            red: { ...state.teams.red },
        },
        objectives: {
            ...state.objectives,
        },
    };
}

function resetObserverState(): void {
    state = createEmptyObserverState();
}

function ensureMatch(payload: { matchId: string; observerId: string }): void {
    if (state.matchId !== null && state.matchId !== payload.matchId) {
        resetObserverState();
    }

    state.matchId = payload.matchId;
    state.observerId = payload.observerId;
}

function hasReliableConfidence(
    payload: ObserverStatePatchPayload,
    key: string
): boolean {
    const value = payload.confidence?.[key];

    return typeof value === "number" && value >= MIN_CONFIDENCE;
}

function isValidGold(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNormalDragonType(value: unknown): value is NormalDragonType {
    return (
        value === "cloud" ||
        value === "infernal" ||
        value === "mountain" ||
        value === "ocean" ||
        value === "hextech" ||
        value === "chemtech"
    );
}

function applyTeamInfo(side: TeamSide, team: ObserverTeamInfo): void {
    state.teams[side].name = team.name;

    if (team.tag !== undefined) {
        state.teams[side].tag = team.tag;
    }

    if (team.logoUrl !== undefined) {
        state.teams[side].logoUrl = team.logoUrl;
    }
}

export function getObserverState(): StoredObserverState {
    return cloneState();
}

export function addObserverMatchInfo(payload: ObserverMatchInfoPayload): StoredObserverState {
    ensureMatch(payload);

    state.tournamentName = payload.tournamentName;
    state.setNumber = payload.setNumber;

    applyTeamInfo("blue", payload.teams.blue);
    applyTeamInfo("red", payload.teams.red);

    state.updatedAt = new Date().toISOString();

    return cloneState();
}

export function addObserverStatePatch(payload: ObserverStatePatchPayload): ObserverStatePatchResult {
    ensureMatch(payload);

    const appliedFields: string[] = [];
    const ignoredFields: string[] = [];

    const blueGold = payload.patch.teams?.blue?.globalGold;
    if (blueGold !== undefined){
        if (
            isValidGold(blueGold) &&
            hasReliableConfidence(payload, "teams.blue.globalGold")
        ) {
            state.teams.blue.globalGold = blueGold;
            appliedFields.push("teams.blue.globalGold");
        } else {
            ignoredFields.push("teams.blue.globalGold");
        }
    }

    const redGold = payload.patch.teams?.red?.globalGold;
    if (redGold !== undefined){
        if (
            isValidGold(redGold) &&
            hasReliableConfidence(payload, "teams.red.globalGold")
        ) {
            state.teams.red.globalGold = redGold;
            appliedFields.push("teams.red.globalGold");
        } else {
            ignoredFields.push("teams.red.globalGold");
        }
    }

    const nextDragonType = payload.patch.objectives?.dragon?.nextDragonType;
    if (nextDragonType !== undefined){
        if (
            isNormalDragonType(nextDragonType) &&
            hasReliableConfidence(payload, "objectives.dragon.nextDragonType")
        ) {
            state.objectives.nextDragonType = nextDragonType;
            appliedFields.push("objectives.dragon.nextDragonType");
        } else {
            ignoredFields.push("objectives.dragon.nextDragonType");
        }
    }

    const status: ObserverStatePatchStatus =
        appliedFields.length === 0
            ? "ignored" 
            : ignoredFields.length > 0 
                ? "partial" : "applied";

    if (appliedFields.length > 0) {
        state.updatedAt = new Date().toISOString();
    }

    return {
        status,
        state: cloneState(),
        appliedFields,
        ignoredFields,
    };
    // return cloneState();
}

export function mergeObserverStateIntoGameState(gameState: GameState): GameState {
    const observerState = getObserverState();

    return {
        ...gameState,

        blueTeam: {
            ...gameState.blueTeam,
            name: observerState.teams.blue.name ?? gameState.blueTeam.name,
            tag: observerState.teams.blue.tag ?? gameState.blueTeam.tag,
            logoUrl: observerState.teams.blue.logoUrl ?? gameState.blueTeam.logoUrl,
            globalGold:
                observerState.teams.blue.globalGold ?? gameState.blueTeam.globalGold,
        },

        redTeam: {
            ...gameState.redTeam,
            name: observerState.teams.red.name ?? gameState.redTeam.name,
            tag: observerState.teams.red.tag ?? gameState.redTeam.tag,
            logoUrl: observerState.teams.red.logoUrl ?? gameState.redTeam.logoUrl,
            globalGold:
                observerState.teams.red.globalGold ?? gameState.redTeam.globalGold,
        },

        objectives: {
            ...gameState.objectives,
            dragon: {
                ...gameState.objectives.dragon,
                dragonType:
                    observerState.objectives.nextDragonType ?? gameState.objectives.dragon.dragonType,
            },
        },

        updatedAt: new Date().toISOString(),
    };
}
