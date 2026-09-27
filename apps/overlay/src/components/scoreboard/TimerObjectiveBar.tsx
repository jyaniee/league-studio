
import React from 'react';

import 바람용 from '../../assets/objectives/dragons/cloud-drake.png';
import 대지용 from '../../assets/objectives/dragons/mountain-drake.png';
import 바론아이콘 from '../../assets/objectives/major/baron.png';
import 전령아이콘 from '../../assets/objectives/major/herald.png';
import 유층아이콘 from '../../assets/objectives/major/voidgrub.png';

type Props ={
  gameTime: string;
};

export default function TimerObjectiveBar({gameTime}:Props) {
  const itemBoxStyle = {
    display: 'flex',
    alignIstems: 'conter',
    gap: '6px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding:'4px 8px',
    borderRadius:'6px'
  };

  return (
<div style={{
     width:'100%',
     maxWidth:'1000px',
     margin:'0 auto',
     height:'50px',
     position: 'relative',
     display:'flex',
     alignItems: 'center',
     justifyContent: 'center',
     padding: '40px',
     boxSizing: 'border-box',
     background: 'linear-gradient(90deg, rgba(40,40,50,0) 0%, rgba(40,40,50,0.7) 15%, rgba(40,40,50,0.8) 50%, rgba(40,40,50,0.7)85%, rgba(40,40,5,0) 100%)',
     borderRadius: '0 0 8px 8px'
}}>
    <span style={{
      posion:'absolute',
      left:'50px',
      transform: 'translate(-50px,-50px)',
      color:'#FFFFFF',
      fontSize: '30px',
      fontWeight: 'bold',
      letterSpacing:'1px'
    }}>
      {gameTime}
    </span>

    <div style={{
      width: '100%',
      display:'flex',
      alignItems:'center',
      justifyContent: 'space-between',
      padding:'0 60px'
    }}>

<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}}>

<div style={{display: 'flex', alignIstems:'conter',gap:'4px'}}>
   <img src={유층아이콘} alt="유층" style={{width:'30px',height:'30px', objectFit:'contain', filter: 'brightness(0) invert(1)'}}/>
   <span style={{color: 'white', fontWeight: 'bold'}}>0</span>
  </div>

<div style={{display: 'flex',alignIstems: 'center',gap:'8px'}}>
  <span style={{color:'#ffffff', fontSize: '30px', fontWeight:'bold',letterSpacing: '1px'}}>{gameTime}</span>
  <img src={바람용} alt="바람" style={{width: '20px', height: '20px',objectFit: 'contain'}}/>
  <img src={대지용} alt="대지" style={{width: '20px', height: '20px',objectFit: 'contain'}}/>
</div>

<div style={{display:'flex', alignIstems: 'center', gap: '4px'}}>
   <img src={유층아이콘} alt="유층" style={{width: '30px', height:'30px',ObjectFit:'contain',filter:'brightness(0) invert(1)'}}/>
  <span style={{color: 'white',fontWeight: 'bold'}}>0</span>
  </div>

  </div>
  </div>
  </div>

import type { DragonType, GameState } from '@league-studio/shared-types';

import type { GameState } from '@league-studio/shared-types';


import DragonObjective from './DragonObjective';
import GameTimer from './GameTimer';
import VoidgrubObjective from './VoidgrubObjective';

const SCOREBOARD_WIDTH = 1080;
const TIMER_OBJECTIVE_BAR_HEIGHT = 36;

const DRAGON_GROUP_OFFSET = 60;

type TimerObjectiveBarProps = {
  gameState: GameState;
};


export default function TimerObjectiveBar({ gameState }: TimerObjectiveBarProps) {
  const { blueTeam, redTeam, gameTime } = gameState;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: `${SCOREBOARD_WIDTH}px`,
        height: `${TIMER_OBJECTIVE_BAR_HEIGHT}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: '-2px',
        background: `
          linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.08) 8%,
            rgba(255,255,255,0.18) 16%,
            rgba(20,15,30,0.78) 24%,
            rgba(20,15,30,0.94) 32%,
            rgba(20,15,30,0.98) 50%,
            rgba(20,15,30,0.94) 68%,
            rgba(20,15,30,0.78) 76%,
            rgba(255,255,255,0.18) 84%,
            rgba(255,255,255,0.08) 92%,
            rgba(255,255,255,0) 100%
          )
        `,
        backdropFilter: 'blur(6px)',
        fontFamily: '"Sora", sans-serif',
      }}
    >
      {/* 블루팀 유충 수 */}
      <VoidgrubObjective count={blueTeam.voidgrubs} side="blue" />

      {/* 블루팀 드래곤 */}
      <div
        style={{
          position: 'absolute',
          left: `calc(50% - ${DRAGON_GROUP_OFFSET}px)`,
          top: '50%',
          transform: 'translate(-100%, -50%)',
        }}
      >
        <DragonObjective dragons={blueTeam.dragons} side="blue" />
      </div>

      {/* 중앙 게임 시간 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <GameTimer seconds={gameTime} />
      </div>

      {/* 레드팀 드래곤 */}
      <div
        style={{
          position: 'absolute',
          left: `calc(50% + ${DRAGON_GROUP_OFFSET}px)`,
          top: '50%',
          transform: 'translate(0, -50%)',
        }}
      >
        <DragonObjective dragons={redTeam.dragons} side="red" />
      </div>


      {/* 레드팀 유충 수 */}
      <VoidgrubObjective count={redTeam.voidgrubs} side="red" />
    </div>
  );
}