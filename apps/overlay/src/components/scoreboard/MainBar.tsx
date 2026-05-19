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
  handleUpdateKill: (side: "blue" | "red") => void;
};

export default function MainBar({ gameData, handleUpdateKill }: MainBarProps) {
  return (
    <div style={{ width: '100%', maxWidth: '1300px', height: '80px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)', padding: '0 20px' }}>
      <TeamHeader name={gameData.blueTeam.name} logo={gameData.blueTeam.logo} side="blue" />
      <TeamStats kills={gameData.blueTeam.kills} towers={gameData.blueTeam.towers} gold={gameData.blueTeam.gold} goldDiff={gameData.blueTeam.goldDiff} side="blue" />
      <CenterScore blueKills={gameData.blueTeam.kills} redKills={gameData.redTeam.kills} />
      <TeamStats kills={gameData.redTeam.kills} towers={gameData.redTeam.towers} gold={gameData.redTeam.gold} goldDiff={gameData.redTeam.goldDiff} side="red" />
      <TeamHeader name={gameData.redTeam.name} logo={gameData.redTeam.logo} side="red" />
    </div>
  );
}
