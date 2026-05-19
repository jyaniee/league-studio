import React from 'react';

export default function BottomBar({ gameTime }: any) {
  return (
    <div style={{
      width: '100%', maxWidth: '600px', height: '35px', margin: '0 auto', backgroundColor: 'rgba(10, 10, 10, 0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', fontSize: '16px', color: '#A0AEC0'
    }}>
      <span>⏱️ {gameTime || "00:00"}</span>
      <span style={{ margin: '0 15px', color: 'rgba(255,255,255,0.2)' }}>|</span>
      <span>🐉 DRAGON OBJECTS ACTIVE</span>
    </div>
  );
}
