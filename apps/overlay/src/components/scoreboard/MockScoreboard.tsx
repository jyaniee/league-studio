import type { GameState, ObjectiveTimer } from "@league-studio/shared-types";

interface ScoreboardProps {
  gameState: GameState | null;
}

function formatGameTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${secs}`;
}

function ObjectiveBox({
  title,
  objective,
}: {
  title: string;
  objective: ObjectiveTimer;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#1b1b1b",
        borderRadius: "10px",
        border: "1px solid #333",
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
        {title}
      </div>

      <div style={{ fontSize: "20px", fontWeight: 800 }}>
        {objective.isAlive ? "LIVE" : objective.remainingTime}
      </div>

      <div style={{ fontSize: "11px", opacity: 0.65, marginTop: "4px" }}>
        다음 생성: {objective.nextSpawnTime}
      </div>
    </div>
  );
}

export default function Scoreboard({ gameState }: ScoreboardProps) {
  if (!gameState) {
    return (
      <div
        style={{
          padding: "16px 24px",
          background: "#111",
          color: "#fff",
          borderRadius: "12px",
          width: "fit-content",
          fontFamily: "sans-serif",
        }}
      >
        데이터 수신 대기 중...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px 24px",
        background: "#111",
        color: "#fff",
        borderRadius: "12px",
        width: "fit-content",
        fontFamily: "sans-serif",
        minWidth: "320px",
      }}
    >
      <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
        {gameState.blueTeamName} vs {gameState.redTeamName}
      </div>

      <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
        {gameState.blueKills} : {gameState.redKills}
      </div>

      <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "12px" }}>
        Time: {formatGameTime(gameState.gameTime)}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <ObjectiveBox title="DRAGON" objective={gameState.objectives.dragon} />
        <ObjectiveBox title="BARON" objective={gameState.objectives.baron} />
      </div>

      <div style={{ fontSize: "12px", opacity: 0.65 }}>
        Phase: {gameState.phase} / Source: {gameState.source}
      </div>
    </div>
  );
}