import React from 'react';
import TeamHeader from './TeamHeader';
import TeamStats from './TeamStats';
import CenterScore from './CenterScore';

export default function MainBar({ gameData, handleUpdateKill }: any) {
  return (
    <div style={{ width: '100%', maxWidth: '1300px', height: '80px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)', padding: '0 20px' }}>
      <TeamHeader name={gameData.blueTeam.name} logo={gameData.blueTeam.logo} align="left" />
      <TeamStats kills={gameData.blueTeam.kills} towers={gameData.blueTeam.towers} gold={gameData.blueTeam.gold} goldDiff={gameData.blueTeam.goldDiff} align="left" />
      <CenterScore blueKills={gameData.blueTeam.kills} redKills={gameData.redTeam.kills} updateKill={handleUpdateKill} />
      <TeamStats kills={gameData.redTeam.kills} towers={gameData.redTeam.towers} gold={gameData.redTeam.gold} goldDiff={gameData.redTeam.goldDiff} align="right" />
      <TeamHeader name={gameData.redTeam.name} logo={gameData.redTeam.logo} align="right" />
    </div>
  );
}
