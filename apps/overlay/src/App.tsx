import React from 'react';
import TopScoreboard from './components/scoreboard/TopScoreboard';
import ObjectiveTimerOverlay from './components/objective-timer/ObjectiveTimerOverlay';

export default function App() {
  return (
    <>
      <ObjectiveTimerOverlay />
      <TopScoreboard />
    </>
  );
}
