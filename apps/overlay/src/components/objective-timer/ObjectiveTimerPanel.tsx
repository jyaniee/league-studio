import type { ObjectiveTimerViewModel } from "./ObjectiveTimerData";

interface ObjectiveTimerPanelProps {
    timer: ObjectiveTimerViewModel;
}

const PANEL_WIDTH = 156;

export default function ObjectiveTimerPanel({ timer }: ObjectiveTimerPanelProps) {
    const isLeft = timer.position === "left";

     return (
        <div
        style={{
            position: "fixed",
            top: 0,
            left: isLeft ? `${timer.slotIndex * PANEL_WIDTH}px` : "auto",
            right: isLeft ? "auto" : `${timer.slotIndex * PANEL_WIDTH}px`,
            width: `${PANEL_WIDTH}px`,
            height: "72px",
            background: "rgba(120, 120, 120, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            color: "#ffffff",
            fontFamily: "Sora, sans-serif",
            zIndex: 20,
        }}
        >
        {isLeft && (
            <>
            <span
                style={{
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: 1,
                }}
            >
                {timer.timeText}
            </span>

            <img
                src={timer.icon}
                alt={timer.label}
                style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                }}
            />
            </>
        )}

        {!isLeft && (
            <>
            <img
                src={timer.icon}
                alt={timer.label}
                style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                }}
            />

            <span
                style={{
                fontSize: "20px",
                fontWeight: 500,
                lineHeight: 1,
                }}
            >
                {timer.timeText}
            </span>
            </>
        )}
        </div>
  );
}