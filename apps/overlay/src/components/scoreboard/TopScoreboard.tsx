import React, { useState } from 'react';
import type { GameState } from '@league-studio/shared-types';
import { OBJECTIVE_FIRST_SPAWN_TIMES, OBJECTIVE_RESPAWN_TIMES } from '@league-studio/shared-types';

import MainBar from './MainBar';
import TimerObjectiveBar from './TimerObjectiveBar';

import ktLogo from '../../assets/teams/kt-rolster.png'; 
import hleLogo from '../../assets/teams/hanwha.png';


const initialGameTime = 785; // 13:05
const initialDragonKillTime = 620;
const nextDragonSpawnTime =
  initialDragonKillTime + OBJECTIVE_RESPAWN_TIMES.dragon;


const initialGameState: GameState = {
  phase: 'in-game',
  gameTime: 785,

  blueTeam: {
    side: 'blue',
    name: 'KT',
    logoUrl: ktLogo,
    kills: 12,
    towers: 4,
    dragons: ['cloud', 'infernal'],
    voidgrubs: 3,
    globalGold: 45200,
  },

  redTeam: {
    side: 'red',
    name: 'HLE',
    logoUrl: hleLogo,
    kills: 8,
    towers: 2,
    dragons: ['mountain'],
    voidgrubs: 0,
    globalGold: 43100,
  },

  objectives: {
    dragon: {
      status: 'waiting',
      isAlive: false,
      canRespawn: true,
      spawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.dragon,
      lastKillTimeSeconds: initialDragonKillTime,
      nextSpawnTimeSeconds: nextDragonSpawnTime,
      remainingSeconds: nextDragonSpawnTime - initialGameTime,
    },
    elder: {
      status: 'inactive',
      isAlive: false,
      canRespawn: true,
    },
    baron: {
      status: 'inactive',
      isAlive: false,
      canRespawn: true,
      spawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.baron,
      nextSpawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.baron,
      remainingSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.baron - initialGameTime,
    },
    herald: {
      status: 'inactive',
      isAlive: false,
      canRespawn: true, // 1게임에 최대 2번
      spawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.herald,
      nextSpawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.herald,
      remainingSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.herald - initialGameTime,
    },
    voidgrub: {
      status: 'ended',
      isAlive: false,
      canRespawn: false,
      spawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.voidgrubs,
    },
  },

  source: 'mock',
  updatedAt: new Date().toISOString(),
};

// 4. 메인 컴포넌트
export default function TopScoreboard() {
  const [gameState] = useState<GameState>(initialGameState);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <MainBar gameState={gameState} />
      <TimerObjectiveBar gameState={gameState} />
    </div>
  );
}