import React from 'react';

export default function GameTimer({ gameTime }: any) {
  return <span style={{ color: '#E2E8F0', fontWeight: 'bold' }}>⏱️ {gameTime || "00:00"}</span>;
}
