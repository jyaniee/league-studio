import React from 'react';
import logoImg from '../../assets/brand/league-studio_logo_draft_v3.png';

type Side = "blueTeam" | "redTeam";

type CenterScoreProps = {
  blueKills: number;
  redKills: number;
};

export default function CenterScore({
  blueKills,
  redKills,
}: CenterScoreProps) { 
  
  return (
    <div style={{ width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px' }}>
      
      {/* 블루팀 킬 스코어 */}
      <span style={{fontSize: '40px', fontWeight: '500', color: '#FFF' }}>
        {blueKills}
      </span>

      {/* 🏢 중앙 로고 영역 */}
      <div style={{ 
        width: '60px', 
        height: '60px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <img 
          src={logoImg} 
          style={{ 
            width: '60px', 
            height: '60px', 
            objectFit: 'contain', 
            filter: 'brightness(0) invert(1) brightness(1.5)' 
          }} 
          alt="League Studio Logo" 
        />
      </div>

      {/* 레드팀 킬 스코어 */}
      <span style={{ fontSize: '40px', fontWeight: '500', color: '#FFF' }}>
        {redKills}
      </span>
      
    </div>
  );
}