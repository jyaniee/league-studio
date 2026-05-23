import type { GameState } from "@league-studio/shared-types"

import ObjectiveTimerPanel from "./ObjectiveTimerPanel";
import { getObjectiveTimersFromGameState } from "./ObjectiveTimerData";

type ObjectiveTimerOverlayProps = {
    gameState: GameState;
}

export default function ObjectiveTimerOverlay({ gameState }: ObjectiveTimerOverlayProps) {
    const objectiveTimers = getObjectiveTimersFromGameState(gameState);
    return (
        <>
            {objectiveTimers.map((timer) => (
                <ObjectiveTimerPanel key={timer.id} timer={timer} />
            ))}
        </>
    )
}