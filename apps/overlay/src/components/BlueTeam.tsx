import React from 'react';

export default function BlueTeam({ data }: any) {
  return (
    <div style={{
      flex: 1, height: '100%', display: 'flex', alignItems: 'center', padding: '0 30px',
      background: 'linear-gradient(90deg, #1F5AFE 0%, rgba(31, 90, 254, 0.4) 50%, transparent 100%)'
    }}>
      <img src={data.logo} style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '30px', filter: 'brightness(0) invert(1)' }} alt="Blue Team Logo" />
      <span style={{ fontSize: '40px', fontWeight: '900', fontStyle: 'italic' }}>{data.name}</span>
      <div style={{ width: '1.5px', height: '60px', backgroundColor: 'rgba(255, 255, 255, 0.4)', margin: '0 40px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/tower.png" style={{ width: '25px', height: '25px', marginRight: '8px', filter: 'invert(35%) sepia(96%) saturate(3332%) hue-rotate(212deg) brightness(101%) contrast(106%)' }} alt="Tower" />
          <span style={{ fontSize: '24px', color: 'white', fontWeight: '500' }}>{data.towers}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/coin.png" style={{ width: '18px', height: '18px', marginRight: '8px', filter: 'invert(35%) sepia(96%) saturate(3332%) hue-rotate(212deg) brightness(101%) contrast(106%)' }} alt="Gold" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', color: 'white', fontWeight: '600' }}>{data.gold}</span>
            {data.goldDiff !== '0' && data.goldDiff !== '+0' && (
              <span style={{ fontSize: '13px', color: '#3B82F6', fontWeight: '700', marginTop: '-2px' }}>{data.goldDiff}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
