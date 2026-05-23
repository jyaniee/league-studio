import React from 'react';
import type { GameState } from '@league-studio/shared-types';

import TeamHeader from './TeamHeader';
import TeamStats from './TeamStats';
import CenterScore from './CenterScore';

type MainBarProps = {
  gameState: GameState;
};

function formatGold(gold?: number): string {
  if (gold === undefined){
    return '-';
  }
  return `${(gold / 1000).toFixed(1)}K`;
}

function formatGoldLead(teamGold?: number, opponentGold?: number): string {
  if (teamGold === undefined || opponentGold === undefined) {
    return '';
  }

  const diff = teamGold - opponentGold;

  if (diff <= 0) {
    return '';
  }

  return `+${(diff / 1000).toFixed(1)}K`;
}

export default function MainBar({ gameState }: MainBarProps) {
  const { blueTeam, redTeam } = gameState;

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
      
      {/* 블루팀 영역 */}
      <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <TeamHeader 
          name={blueTeam.name} 
          logo={blueTeam.logoUrl} 
          side="blue"
        />
        <div style={{ 
          width: '3.5px', 
          height: '59px', 
          backgroundColor: 'rgba(255, 255, 255, 0.65)', 
          marginLeft: '40px',       
          marginRight: '20px'       
        }}></div>
        
        <TeamStats
           towers={blueTeam.towers} 
           gold={formatGold(blueTeam.globalGold)} 
           goldDiff={formatGoldLead(blueTeam.globalGold, redTeam.globalGold)} 
           side="blue" 
        />
      </div>
      
     {/* 중앙 점수판 영역 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CenterScore blueKills={blueTeam.kills} redKills={redTeam.kills} />
      </div>
      
      {/* 레드팀 영역 */}
      <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <TeamStats 
          towers={redTeam.towers} 
          gold={formatGold(redTeam.globalGold)} 
          goldDiff={formatGoldLead(redTeam.globalGold, blueTeam.globalGold)} 
          side="red" 
        />
        
        <div style={{ 
          width: '3.5px', 
          height: '59px', 
          backgroundColor: 'rgba(255, 255, 255, 0.65)', 
          marginLeft: '20px',
          marginRight: '40px'
        }}></div>
        
        <TeamHeader 
          name={redTeam.name} 
          logo={redTeam.logoUrl} 
          side="red" 
        />

      </div>

    </div>
  );
}
