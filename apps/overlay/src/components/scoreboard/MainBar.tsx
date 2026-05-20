import React from 'react';
import TeamHeader from './TeamHeader';
import TeamStats from './TeamStats';
import CenterScore from './CenterScore';

type TeamData = {
  name: string;
  logo: string;
  kills: number;
  towers: number;
  gold: string;
  goldDiff: string;
};

type GameData = {
  blueTeam: TeamData;
  redTeam: TeamData;
};

type MainBarProps = {
  gameData: GameData;
  handleUpdateKill?: (team: 'blueTeam'| 'redTeam',delta: number)  => void;
};

export default function MainBar({ gameData, handleUpdateKill }: MainBarProps) {
  return (
  
    <div style={{ 
      width: '100%', 
      maxWidth: '1300px', 
      height: '80px', 
      display: 'flex', 
      alignItems: 'center', 
      background: 'linear-gradient(to right, #2E65D6 0%, #101124 30%, #101124 70%, #E03155 100%)', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)', 
      padding: '0 40px'
    }}>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '30px' }}>
        <TeamHeader name={gameData.blueTeam.name} logo={gameData.blueTeam.logo} side="blue" />
        <TeamStats kills={gameData.blueTeam.kills} towers={gameData.blueTeam.towers} gold={gameData.blueTeam.gold} goldDiff={gameData.blueTeam.goldDiff} side="blue" />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 40px' }}>
        <CenterScore blueKills={gameData.blueTeam.kills} redKills={gameData.redTeam.kills} />
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '30px' }}>
        <TeamStats kills={gameData.redTeam.kills} towers={gameData.redTeam.towers} gold={gameData.redTeam.gold} goldDiff={gameData.redTeam.goldDiff} side="red" />
        <TeamHeader name={gameData.redTeam.name} logo={gameData.redTeam.logo} side="red" />
      </div>

    </div>
  );
}
