import React from 'react';

export default function RedTeam({ data }: any) {
  return (
    <div style={{
      flex: 1, height: '100%', display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', padding: '0 30px',
      background: 'linear-gradient(-90deg, #E6334D 0%, rgba(230, 51, 77, 0.4) 50%, transparent 100%)'
    }}>
      <img src={data.logo} style={{ width: '50px', height: '50px', objectFit: 'contain', marginLeft: '30px', filter: 'brightness(0) invert(1)' }} alt="Red Team Logo" />
      <span style={{ fontSize: '40px', fontWeight: '900', fontStyle: 'italic' }}>{data.name}</span>
      <div style={{ width: '1.5px', height: '60px', backgroundColor: 'rgba(255, 255, 255, 0.4)', margin: '0 40px' }} />
      <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', color: 'white', fontWeight: '500', marginRight: '8px' }}>{data.towers}</span>
          <img src="/tower.png" style={{ width: '25px', height: '25px', filter: 'invert(31%) sepia(82%) saturate(3660%) hue-rotate(335deg) brightness(97%) contrast(102%)' }} alt="Tower" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', color: 'white', fontWeight: '600', marginRight: '8px' }}>{data.redTeam?.gold || data.gold}</span>
            {data.goldDiff !== '0' && data.goldDiff !== '+0' && (
              <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: '700', marginTop: '-2px', marginRight: '8px' }}>{data.goldDiff}</span>
            )}
          </div>
          <img src="/coin.png" style={{ width: '18px', height: '18px', filter: 'invert(31%) sepia(82%) saturate(3660%) hue-rotate(335deg) brightness(97%) contrast(102%)' }} alt="Gold" />
        </div>
      </div>
    </div>
  );
}
