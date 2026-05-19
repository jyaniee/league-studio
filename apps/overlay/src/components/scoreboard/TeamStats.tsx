import React from 'react';

type Side = "blue" | "red";

type TeamStatsProps = {
  kills: number;
  towers: number;
  gold: string;
  goldDiff: string;
  side: Side;
};


export default function TeamStats({ kills, towers, gold, goldDiff, side }: TeamStatsProps) {
  const isRed = side === 'red';
  return (
   <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isRed ? 'row-reverse' : 'row', flex: 1, justifyContent: isRed ? 'flex-start' : 'flex-end', padding: isRed ? '0 0 0 20px' : '0 20px 0 0' }}>
      <span style={{ fontSize: '18px', color: '#E2E8F0' }}>{towers}</span>
      <span style={{ fontSize: '18px', color: '#ECC94B' }}>{gold}</span>
      <span style={{ fontSize: '14px', color: goldDiff.startsWith('+') ? '#48BB78' : '#F56565', fontWeight: 'bold' }}>{goldDiff}</span>
    </div>
  );
}
