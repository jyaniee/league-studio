import React, { useEffect, useState } from 'react';
import type { GameState } from '@league-studio/shared-types';

import TopScoreboard from './components/scoreboard/TopScoreboard';
import ObjectiveTimerOverlay from './components/objective-timer/ObjectiveTimerOverlay';
import BottomScoreboard from './components/bottom-hud/BottomScoreboard';

import { initialGameState } from './mock/gameState';
import { connectGameState } from './services/socket';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  useEffect(() => {
    const connection = connectGameState((nexState) => {
      setGameState(nexState);
    });

return () => {
  connection.close();
};
  }, []);

  return (
    <div style={{width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative'}}>
      <ObjectiveTimerOverlay gameState={gameState} />
      <TopScoreboard gameState={gameState} />

      <BottomScoreboard gameState={gameState} />
    </div>
  );
}