import React from 'react';


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
      
      <span style={{ fontSize: '40px', fontWeight: '300', color: '#3182CE' }}>
        {blueKills}
      </span>

      <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/league-studio_logo_draft_v3.png" 
          style={{ width: '45px', height: '45px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
          alt="Logo" 
        />
      </div>

      <span style={{ fontSize: '40px', fontWeight: '300', color: '#E53E3E' }}>
        {redKills}
      </span>
      
    </div>
  );
} //