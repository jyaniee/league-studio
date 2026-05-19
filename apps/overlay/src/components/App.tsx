import React, { useState } from 'react';
import BlueTeam from './components/BlueTeam';
import RedTeam from './components/RedTeam';
import CenterScore from './components/CenterScore';
import BottomBar from './components/BottomBar';

export default function App() {
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
      <div style={{ width: '100%', maxWidth: '1300px', height: '80px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
        <BlueTeam data={gameData.blueTeam} />
        <CenterScore blueKills={gameData.blueTeam.kills} redKills={gameData.redTeam.kills} updateKill={handleUpdateKill} />
        <RedTeam data={gameData.redTeam} />
      </div>
      <BottomBar gameTime={gameData.gameTime} />
    </div>
  );
}
