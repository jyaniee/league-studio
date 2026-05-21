import ObjectiveTimerPanel from "./ObjectiveTimerPanel";
import { mockObjectiveTimers } from "./ObjectiveTimerData";

export default function ObjectiveTimerOverlay() {
    return (
        <>
            {mockObjectiveTimers.map((timer) => (
                <ObjectiveTimerPanel key={timer.id} timer={timer} />
            ))}
        </>
    )
}