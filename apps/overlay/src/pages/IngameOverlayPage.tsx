import { useEffect, useState } from "react";
import type { GameState } from "@league-studio/shared-types";
import { connectGameState } from "../services/socket";
import Scoreboard from "../components/Scoreboard";

export default function IngameOverlayPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const socket = connectGameState(setGameState);

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "40px",
        background: "transparent",
        boxSizing: "border-box",
      }}
    >
      <Scoreboard gameState={gameState} />
    </div>
  );
}