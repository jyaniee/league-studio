import React, { useState } from 'react';
import MainBar from './MainBar';
import TimerObjectiveBar from './TimerObjectiveBar';

export type TeamData = {
  name: string;
  logo: string;
  kills: number;
  towers: number;
  gold: string;
  goldDiff: string;
};

export type GameData = {
  blueTeam: TeamData;
  redTeam: TeamData;
  gameTime: string;
};

export default function TopScoreboard() {
  const [gameData, setGameData] = useState<GameData>({
    blueTeam: { name: 'KT', logo: '/kt-logo.png', kills: 12, towers: 4, gold: '45.2k', goldDiff: '+2.1k' },
    redTeam: { name: 'HLE', logo: '/hle-logo.png', kills: 8, towers: 2, gold: '43.1k', goldDiff: '-2.1k' },
    gameTime: "24:15"
  });

  const handleUpdateKill = (side: 'blue' | 'red') => {
    const teamKey = side === 'blue' ? 'blueTeam' : 'redTeam';
    setGameData(prev => ({
      ...prev,
      [teamKey]: { ...prev[teamKey], kills: prev[teamKey].kills + 1 }
    }));
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'transparent', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <MainBar gameData={gameData} handleUpdateKill={handleUpdateKill} />
      <TimerObjectiveBar gameTime={gameData.gameTime} />
    </div>
  );
}
