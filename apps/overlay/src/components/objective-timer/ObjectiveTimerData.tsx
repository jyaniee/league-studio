import baronIcon from "../../assets/objectives/major/baron.png"
import hextechDrakeIcon from "../../assets/objectives/dragons/hextech-drake.png"

export type ObjectiveTimerPosition = "left" | "right";

export interface ObjectiveTimerViewModel {
    id: string;
    label: string;
    timeText: string;
    icon: string;
    position: ObjectiveTimerPosition;
}

export const mockObjectiveTimers: ObjectiveTimerViewModel[] = [
    {
        id: "baron",
        label: "Baron",
        timeText: "4:15",
        icon: baronIcon,
        position: "left",
    },
    {
        id: "dragon",
        label: "Dragon",
        timeText: "1:01",
        icon: hextechDrakeIcon,
        position: "right"
    },
];

/*
export function getObjectiveTimersFromGameState(gameState: GameState): ObjectiveTimerViewModel[] {
  // gameState.objectives 기반으로 left/right 타이머 반환하는 코드 작성 ->
}
*/