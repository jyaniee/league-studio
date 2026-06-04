import { useEffect, useState } from 'react';
import type { GameState } from '@league-studio/shared-types';

import TopScoreboard from './components/scoreboard/TopScoreboard';
import ObjectiveTimerOverlay from './components/objective-timer/ObjectiveTimerOverlay';
import { initialGameState } from './mock/gameState';
import { connectGameState } from './services/socket';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  useEffect(() => {
    const connection = connectGameState((nextState) => {
      setGameState(nextState);
    });

    return () => {
      connection.close();
    };
  }, []);

  return (
    <>
      <ObjectiveTimerOverlay gameState={gameState}/>
      <TopScoreboard gameState={gameState}/>
    </>
  );
}
