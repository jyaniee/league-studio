
import React from 'react';

import 바람용 from '../../assets/objectives/dragons/cloud-drake.png';
import 대지용 from '../../assets/objectives/dragons/mountain-drake.png';
import 바론아이콘 from '../../assets/objectives/major/baron.png';
import 전령아이콘 from '../../assets/objectives/major/herald.png';
import 유층아이콘 from '../../assets/objectives/major/voidgrub.png';
import type { GameState } from '@league-studio/shared-types';

type Props ={
  gameState: GameState;
};

function formatRemainingTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function TimerObjectiveBar({ gameState }: Props) {
  const gameTime = formatRemainingTime(gameState.gameTime || 0)
  const blueVoidgrubs = gameState.blueTeam.voidgrubs;
  const redVoidgrubs = gameState.redTeam.voidgrubs;

  return (
<div style={{
     width:'100%',
     maxWidth:'740px',
     margin:'0 auto',
     height:'36px',
     position: 'relative',
     display:'flex',
     alignItems: 'center',
     justifyContent: 'space-between',
     padding: '40px',
     boxSizing: 'border-box',
     background: 'linear-gradient(90deg, rgba(40,40,50,0) 0%, rgba(40,40,50,0.7) 15%, rgba(40,40,50,0.8) 50%, rgba(40,40,50,0.7)85%, rgba(40,40,5,0) 100%)',
     borderRadius: '0 0 8px 8px'
}}>

    <div style={{
      width: '100%',
      display:'flex',
      alignItems:'center',
      justifyContent: 'space-between',
      padding:'0 60px'
    }}>

<div style={{display: 'flex', alignItems:'center',gap:'4px'}}>
    <span style={{color: 'white', fontWeight: 'bold'}}></span>
   <img src={유층아이콘} alt="유층" style={{width:'30px',height:'30px', objectFit:'contain', filter: 'brightness(0) invert(1)'}}/>
   <span style={{color: 'white', fontWeight: 'bold'}}>0</span>
  </div>

<div style={{display: 'flex',alignItems: 'center',gap:'8px'}}>
  <span style={{color:'#ffffff', fontSize: '30px', fontWeight:'bold',letterSpacing: '1px'}}>{gameTime}</span>
  <img src={바람용} alt="바람" style={{width: '20px', height: '20px',objectFit: 'contain'}}/>
  <img src={대지용} alt="대지" style={{width: '20px', height: '20px',objectFit: 'contain'}}/>
</div>

<div style={{display:'flex', alignItems: 'center', gap: '4px'}}>
  <span style={{color: 'white', fontWeight: 'bold'}}>0</span>
  <img src={유층아이콘} alt="유층" style={{width: '30px', height:'30px',objectFit:'contain',filter:'brightness(0) invert(1)'}}/>

  </div>
  </div>
  </div>
  );
}