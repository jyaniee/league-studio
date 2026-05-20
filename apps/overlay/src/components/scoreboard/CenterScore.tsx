import React from 'react';


type Side = "blueTeam" | "redTeam";


type CenterScoreProps = {
  blueKills: number;
  redKills: number;
  updatekill?: (team: Side, amount: number) => void;
};

export default function CenterScore({
  blueKills,
  redKills,
  updatekill, 
}: CenterScoreProps) { 
  

  return (
    <div style={{ width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px' }}>
      
      <span style={{fontSize: '40px', fontWeight: '300', color: '#FFF' }}>
        {blueKills}
      </span>

      <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/league-studio_logo_draft_v3.png" 
          style={{ width: '45px', height: '45px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
          alt="Logo" 
        />
      </div>

      <span style={{ fontSize: '40px', fontWeight: '300', color: '#FFF' }}>
        {redKills}
      </span>
      
    </div>
  );
} //
