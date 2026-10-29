import { useEffect, useState } from 'react';
import type { GameState } from '@league-studio/shared-types';

import TopScoreboard from './components/scoreboard/TopScoreboard';
import ObjectiveTimerOverlay from './components/objective-timer/ObjectiveTimerOverlay';
import BottomScoreboard from './components/bottom-hud/BottomScoreboard';
import { initialGameState } from './mock/gameState';
import { connectGameState } from './services/socket';

export default function App() {
  const usePreview = new URLSearchParams(window.location.search).get('preview') === '1';

  const [gameState, setGameState] = useState<GameState | null>(usePreview ? initialGameState : null,);

  useEffect(() => {
    if (usePreview) {
      return;
    }

    const connection = connectGameState((nextState) => {
      setGameState(nextState);
    });

    return () => {
      connection.close();
    };
  }, [usePreview]);

  if (gameState === null){
    return null;
  } 

  return (
    <>
      <ObjectiveTimerOverlay gameState={gameState}/>
      <TopScoreboard gameState={gameState}/>
      <BottomScoreboard gameState={gameState}/>
    </>
  );
}
