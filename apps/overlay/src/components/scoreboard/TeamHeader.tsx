import React from 'react';

export default function TeamHeader({ name, logo, align }: any) {
  const isRight = align === 'right';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexDirection: isRight ? 'row-reverse' : 'row', width: '220px' }}>
      <img src={logo} style={{ width: '45px', height: '45px', objectFit: 'contain' }} alt={name} />
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFF' }}>{name}</span>
    </div>
  );
}
