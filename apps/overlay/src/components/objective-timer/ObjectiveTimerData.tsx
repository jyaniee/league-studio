import type { DragonType, GameState, ObjectiveTimer } from "@league-studio/shared-types";

import baronIcon from "../../assets/objectives/major/baron.png";
import heraldIcon from "../../assets/objectives/major/herald.png";
import voidgrubIcon from "../../assets/objectives/major/voidgrub.png";

import cloudDrakeIcon from "../../assets/objectives/dragons/chemtech-drake.png";
import infernalDrakeIcon from "../../assets/objectives/dragons/infernal-drake.png";
import mountainDrakeIcon from "../../assets/objectives/dragons/mountain-drake.png";
import oceanDrakeIcon from "../../assets/objectives/dragons/ocean-drake.png";
import hextechDrakeIcon from "../../assets/objectives/dragons/hextech-drake.png";
import chemtechDrakeIcon from "../../assets/objectives/dragons/chemtech-drake.png";
import elderDrakeIcon from "../../assets/objectives/dragons/elder-dragon.png";

export type ObjectiveTimerPosition = "left" | "right";

export interface ObjectiveTimerViewModel {
    id: string;
    label: string;
    timeText: string;
    icon: string;
    position: ObjectiveTimerPosition;
    slotIndex: number;
}

const dragonIconMap: Record<DragonType, string> = {
    cloud: cloudDrakeIcon,
    infernal: infernalDrakeIcon,
    mountain: mountainDrakeIcon,
    ocean: oceanDrakeIcon,
    hextech: hextechDrakeIcon,
    chemtech: chemtechDrakeIcon,
    elder: elderDrakeIcon,
};

function getDragonIcon(timer: ObjectiveTimer): string {
    if (timer.dragonType) {
        return dragonIconMap[timer.dragonType];
    }

    return hextechDrakeIcon;
}

function formatRemainingTime(timer: ObjectiveTimer): string {
    if (timer.status ==="alive") {
        return "LIVE";
    }

    if (timer.remainingSeconds !== undefined && timer.remainingSeconds >= 0){
        const minutes = Math.floor(timer.remainingSeconds / 60);
        const seconds = timer.remainingSeconds % 60;

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

  return "--:--";
}

function hasTimer(timer: ObjectiveTimer): boolean {
    return timer.status === "alive" ||
    (timer.remainingSeconds !== undefined && timer.remainingSeconds >= 0);
}

function createLeftTimer(
    id: string,
    label: string,
    timer: ObjectiveTimer,
    icon: string,
    slotIndex: number
): ObjectiveTimerViewModel {
    return {
        id,
        label,
        timeText: formatRemainingTime(timer),
        icon,
        position: "left",
        slotIndex,
    };
}

function createRightTimer(
    id: string,
    label: string,
    timer: ObjectiveTimer,
    icon: string,
    slotIndex: number
): ObjectiveTimerViewModel{
    return {
        id,
        label,
        timeText: formatRemainingTime(timer),
        icon,
        position: "right",
        slotIndex,
    };
}

export function getLeftObjectiveTimers(gameState: GameState): ObjectiveTimerViewModel[] {
    const { voidgrubs, herald, baron } = gameState.objectives;

    // 1. 유충이 살아있을 때: [전령 타이머] [유충 LIVE]
    if (voidgrubs.status === "alive"){
        const timers: ObjectiveTimerViewModel[] = [];

        if (hasTimer(herald)) {
            timers.push(createLeftTimer("herald", "Herald", herald, heraldIcon, 0));
            timers.push(createLeftTimer("voidgrubs", "Voidgrubs", voidgrubs, voidgrubIcon, 1));
            return timers;
        }

        timers.push(createLeftTimer("voidgrubs", "Voidgrubs", voidgrubs, voidgrubIcon, 0));
        return timers;
    }

    // 2. 전령이 살아 있을 때: [바론 타이머] [전령 LIVE]
    if (herald.status === "alive") {
        const timers: ObjectiveTimerViewModel[] = [];

        if (hasTimer(baron)) {
            timers.push(createLeftTimer("baron", "Baron", baron, baronIcon, 0));
            timers.push(createLeftTimer("herald", "Herald", herald, heraldIcon, 1));
            return timers;
        }

        timers.push(createLeftTimer("herald", "Herald", herald, heraldIcon, 0));
        return timers;
    }

    // 3. 유충 타이머가 의미 있으면 유충 표시
    if (hasTimer(voidgrubs) && voidgrubs.status !== "ended") {
        return [
            createLeftTimer("voidgrubs", "Voidgrubs", voidgrubs, voidgrubIcon, 0),
        ];
    }

    // 4. 전령 타이머가 의미 있으면 전령 표시
    if (hasTimer(herald) && herald.status !== "ended") {
        return [
            createLeftTimer("herald", "Herald", herald, heraldIcon, 0),
        ];
    }

    // 5. 그 외에는 바론 표시
    if (hasTimer(baron)) {
        return [
            createLeftTimer("baron", "Baron", baron, baronIcon, 0),
        ];
    }

    return [];
}

function getRightObjectiveTimers(gameState: GameState): ObjectiveTimerViewModel[] {
    const { dragon, elder } = gameState.objectives;

    // 일단 오른쪽은 일반 드래곤 우선
    // 나중에 장로가 활성화되면 장로를 우선 표시하도록
    if (hasTimer(elder) && elder.status !== "inactive") {
        return [
            createRightTimer("elder", "Elder", elder, elderDrakeIcon, 0),
        ];
    }

    if (hasTimer(dragon)) {
        return [
            createRightTimer("dragon", "Dragon", dragon, getDragonIcon(dragon), 0),
        ];
    }

    return [];
}

export function getObjectiveTimersFromGameState(gameState: GameState): ObjectiveTimerViewModel[] {
    return [
        ...getLeftObjectiveTimers(gameState),
        ...getRightObjectiveTimers(gameState),
    ];
}