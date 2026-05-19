import React from 'react';
import GameTimer from './GameTimer';
import DragonObjective from './DragonObjective';
import VoidgrubObjective from './VoidgrubObjective';

export default function BottomObjectiveBar({ gameTime }: any) {
  return (
    <div style={{
      width: '100%', maxWidth: '600px', height: '35px', margin: '0 auto', backgroundColor: 'rgba(10, 10, 10, 0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', fontSize: '14px', gap: '20px'
    }}>
      <GameTimer gameTime={gameTime} />
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
      <DragonObjective />
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
      <VoidgrubObjective />
    </div>
  );
}
