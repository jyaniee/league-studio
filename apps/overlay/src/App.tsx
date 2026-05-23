import React, { useState } from 'react';
import type { GameState } from '@league-studio/shared-types';

import TopScoreboard from './components/scoreboard/TopScoreboard';
import ObjectiveTimerOverlay from './components/objective-timer/ObjectiveTimerOverlay';
import { initialGameState } from './mock/gameState';

export default function App() {
  const [gameState] = useState<GameState>(initialGameState);
  return (
    <>
      <ObjectiveTimerOverlay gameState={gameState}/>
      <TopScoreboard gameState={gameState}/>
    </>
  );
}
