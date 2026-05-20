import type { GameState } from "@league-studio/shared-types";

interface ScoreboardProps {
  gameState: GameState | null;
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
        minWidth: "240px",
      }}
    >
      <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
        {gameState.blueTeamName} vs {gameState.redTeamName}
      </div>

      <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
        {gameState.blueKills} : {gameState.redKills}
      </div>

      <div style={{ fontSize: "14px", opacity: 0.85 }}>
        Time: {gameState.gameTime}s
      </div>

      <div style={{ fontSize: "12px", opacity: 0.65, marginTop: "8px" }}>
        Phase: {gameState.phase}
      </div>
    </div>
  );
}