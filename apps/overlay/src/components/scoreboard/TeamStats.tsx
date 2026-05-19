import React from 'react';

export default function TeamStats({ kills, towers, gold, goldDiff, align }: any) {
  const isRight = align === 'right';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isRight ? 'row-reverse' : 'row', flex: 1, justifyContent: isRight ? 'flex-start' : 'flex-end', padding: isRight ? '0 0 0 20px' : '0 20px 0 0' }}>
      <span style={{ fontSize: '18px', color: '#E2E8F0' }}>🏰 {towers}</span>
      <span style={{ fontSize: '18px', color: '#ECC94B' }}>💰 {gold}</span>
      <span style={{ fontSize: '14px', color: goldDiff.startsWith('+') ? '#48BB78' : '#F56565', fontWeight: 'bold' }}>{goldDiff}</span>
    </div>
  );
}
