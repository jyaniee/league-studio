import React, { useState } from 'react';
import MainBar from './MainBar';
import BottomObjectiveBar from './BottomObjectiveBar';

export default function TopScoreboard() {
  const [gameData, setGameData] = useState({
    blueTeam: { name: 'KT', logo: '/kt-logo.png', kills: 12, towers: 4, gold: '45.2k', goldDiff: '+2.1k' },
    redTeam: { name: 'HLE', logo: '/hle-logo.png', kills: 8, towers: 2, gold: '43.1k', goldDiff: '-2.1k' },
    gameTime: "24:15"
  });

  const handleUpdateKill = (team: 'blueTeam' | 'redTeam', amount: number) => {
    setGameData(prev => ({
      ...prev,
      [team]: { ...prev[team], kills: prev[team].kills + amount }
    }));
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'transparent', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <MainBar gameData={gameData} handleUpdateKill={handleUpdateKill} />
      <BottomObjectiveBar gameTime={gameData.gameTime} />
    </div>
  );
}
