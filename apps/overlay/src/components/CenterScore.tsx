import React from 'react';

export default function CenterScore({ blueKills, redKills, updateKill }: any) {
  return (
    <div style={{ width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px' }}>
      <span style={{ fontSize: '40px', fontWeight: '300', cursor: 'pointer' }} onClick={() => updateKill('blueTeam', 1)}>{blueKills}</span>
      <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/league-studio_logo_draft_v3.png" style={{ width: '45px', height: '45px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} alt="League Studio Logo" />
      </div>
      <span style={{ fontSize: '40px', fontWeight: '300', cursor: 'pointer' }} onClick={() => updateKill('redTeam', 1)}>{redKills}</span>
    </div>
  );
}
