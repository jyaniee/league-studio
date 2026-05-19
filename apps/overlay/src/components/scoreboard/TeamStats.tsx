import React from 'react';

type TeamHeaderProps = {
  name: string;
  logo: string;
  side: 'blue' | 'red';
};

export default function TeamHeader({ name, logo, side }: TeamHeaderProps) {
  const isRed = side === 'red';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isRed ? 'row-reverse' : 'row', width: '220px' }}>
      <img src={logo} style={{ width: '45px', height: '45px', objectFit: 'contain' }} alt={name} />
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFF' }}>{name}</span>
    </div>
  );
}
