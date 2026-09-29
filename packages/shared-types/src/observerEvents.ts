import type { DragonType, TeamSide } from "./gameState";

export type NormalDragonType = Exclude<DragonType, "elder">;

export type ObserverTeamInfo = {
    name: string;
    tag?: string;
    logoUrl?: string;
};

export type ObserverMatchInfoPayload = {
    matchId: string;
    observerId: string;
    sentAt: string;

    tournamentName?: string;
    setNumber?: number;

    teams: Record<TeamSide, ObserverTeamInfo>;
};

export type ObserverTeamPatch = {
    globalGold?: number;
};

export type ObserverObjectivePatch = {
    dragon?: {
        /*
            관전자 화면의 오브젝트 타이머에 표시되는
            다음 생성 예정 일반 드래곤 타입을 의미함.

            각 팀이 이미 획득한 드래곤 목록은 TeamState.dragons에서 관리하며,
            이 값은 해당 목록을 의미하지 않음.

            2026-06-16:jhan
        */
        nextDragonType?: NormalDragonType;
    };
};

export type ObserverStatePatch = {
    teams?: Partial<Record<TeamSide, ObserverTeamPatch>>;
    objectives?: ObserverObjectivePatch;
};

export type ObserverConfidenceMap = Record<string, number>;

export type ObserverStatePatchPayload = {
    matchId: string;
    observerId: string;
    sentAt: string;
    observedAt: string;

    patch: ObserverStatePatch;

    /*
    예:
    {
        "teams.blue.globalGold": 0.96,
        "teams.red.globalGold": 0.94,
        "objectives.dragon.nextDragonType": 0.91
    }
    */

    confidence?: ObserverConfidenceMap;
};

// MatchInfo: 수동 입력 값
// StatePatch: OCR / 이미지 매칭 결과




