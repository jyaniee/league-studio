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
  updateKill?: (team: 'blueTeam'| 'redTeam', delta: number) => void;
};

export default function MainBar({ gameData, updateKill }: MainBarProps) {
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1237px', 
      height: '90px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      
    
      background: 'linear-gradient(to right, #3B82F6 0%, #17112B 22%, #17112B 78%, #F43F5E 100%)', 
      
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)', 
      padding: '0 37px', 
      boxSizing: 'border-box',
      fontFamily: '"Sora", sans-serif'
    }}>
      
      {/* 🔵 블루팀 영역 */}
      <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <TeamHeader name={gameData.blueTeam.name} logo={gameData.blueTeam.logo} side="blue" />
        

        <div style={{ 
          width: '3.5px', 
          height: '59px', 
          backgroundColor: 'rgba(255, 255, 255, 0.65)', 
          marginLeft: '40px',       
          marginRight: '20px'       
        }}></div>
        
        <TeamStats kills={gameData.blueTeam.kills} towers={gameData.blueTeam.towers} gold={gameData.blueTeam.gold} goldDiff={gameData.blueTeam.goldDiff} side="blue" />
      </div>
      
     {/* 🏢 중앙 점수판 영역 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CenterScore blueKills={gameData.blueTeam.kills} redKills={gameData.redTeam.kills} />
      </div>
      
      {/* 🔴 레드팀 영역 */}
      <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <TeamStats kills={gameData.redTeam.kills} towers={gameData.redTeam.towers} gold={gameData.redTeam.gold} goldDiff={gameData.redTeam.goldDiff} side="red" />
        

        <div style={{ 
          width: '3.5px', 
          height: '59px', 
          backgroundColor: 'rgba(255, 255, 255, 0.65)', 
          marginLeft: '20px',
          marginRight: '40px'
        }}></div>
        
        <TeamHeader name={gameData.redTeam.name} logo={gameData.redTeam.logo} side="red" />
      </div>

    </div>
  );
}
