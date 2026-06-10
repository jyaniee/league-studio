import type { GameState } from '@league-studio/shared-types';
import {
  OBJECTIVE_FIRST_SPAWN_TIMES,
  OBJECTIVE_RESPAWN_TIMES,
} from '@league-studio/shared-types';

import ktLogo from '../assets/teams/kt-rolster.png';
import hleLogo from '../assets/teams/hanwha.png';

const initialGameTime = 785; // 13:05
const initialDragonKillTime = 620;
const nextDragonSpawnTime =
  initialDragonKillTime + OBJECTIVE_RESPAWN_TIMES.dragon;


export const initialGameState: GameState = {
  phase: 'in-game',
  gameTime: initialGameTime,

  blueTeam: {
    side: 'blue',
    name: 'KT',
    logoUrl: ktLogo,
    kills: 12,
    towers: 4,
    dragons: ['cloud', 'infernal'],
    voidgrubs: 3,
    globalGold: 12500,
    heralds: 0,
    barons: 0,
  },

  redTeam: {
    side: 'red',
    name: 'HLE',
    logoUrl: hleLogo,
    kills: 8,
    towers: 2,
    dragons: ['mountain'],
    voidgrubs: 0,
    globalGold: 12100,
    heralds: 0,
    barons: 0,
  },

  objectives: {
    dragon: {
      status: 'waiting',
      isAlive: false,
      canRespawn: true,
      dragonType: 'chemtech',
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
    voidgrubs: {
      status: 'alive',
      isAlive: true,
      canRespawn: false,
      spawnTimeSeconds: OBJECTIVE_FIRST_SPAWN_TIMES.voidgrubs,
    },
  },

  source: 'mock',
  updatedAt: new Date().toISOString(),
};