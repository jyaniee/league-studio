import type { GameState, PlayerState } from '@league-studio/shared-types';
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

const initialPlayers: PlayerState[] = [
  {
    side: 'blue',
    position: 'TOP',
    championKey: 'Garen',
    kills: 2,
    deaths: 1,
    assists: 3,
    creepScore: 110,
    items: [
      { itemId: 1054, slot: 0 },
      { itemId: 3047, slot: 1 },
    ],
    trinketItemId: 3340,
  },
  {
    side: 'blue',
    position: 'JUNGLE',
    championKey: 'LeeSin',
    kills: 3,
    deaths: 2,
    assists: 4,
    creepScore: 90,
    items: [{ itemId: 6691, slot: 0 }],
    trinketItemId: 3364,
  },
  {
    side: 'blue',
    position: 'MIDDLE',
    championKey: 'Ahri',
    kills: 4,
    deaths: 1,
    assists: 2,
    creepScore: 140,
    items: [{ itemId: 6655, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: 'blue',
    position: 'BOTTOM',
    championKey: 'Jinx',
    kills: 2,
    deaths: 2,
    assists: 1,
    creepScore: 160,
    items: [{ itemId: 3031, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: 'blue',
    position: 'UTILITY',
    championKey: 'Thresh',
    kills: 1,
    deaths: 3,
    assists: 8,
    creepScore: 20,
    items: [{ itemId: 3850, slot: 0 }],
    trinketItemId: 3364,
  },
  {
    side: 'red',
    position: 'TOP',
    championKey: 'Aatrox',
    kills: 2,
    deaths: 2,
    assists: 1,
    creepScore: 120,
    items: [{ itemId: 6630, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: 'red',
    position: 'JUNGLE',
    championKey: 'Viego',
    kills: 1,
    deaths: 3,
    assists: 2,
    creepScore: 80,
    items: [{ itemId: 3074, slot: 0 }],
    trinketItemId: 3364,
  },
  {
    side: 'red',
    position: 'MIDDLE',
    championKey: 'Syndra',
    kills: 3,
    deaths: 2,
    assists: 1,
    creepScore: 130,
    items: [{ itemId: 6655, slot: 0 }],
    trinketItemId: 3340,
  },
  {
    side: 'red',
    position: 'BOTTOM',
    championKey: 'Aphelios',
    kills: 2,
    deaths: 3,
    assists: 0,
    creepScore: 150,
    items: [{ itemId: 3031, slot: 0 }],
    trinketItemId: 3363,
  },
  {
    side: 'red',
    position: 'UTILITY',
    championKey: 'Rell',
    kills: 0,
    deaths: 4,
    assists: 6,
    creepScore: 10,
    items: [{ itemId: 3850, slot: 0 }],
    trinketItemId: 3340,
  },
];


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

    players : [
      { championName: 'Aatrox' , kills: 3, deaths: 1, assists: 2, cs: 112,
        items: [1055, 3047, 3071, 2003, null, null], ward: 'stealth'},
      { championName: 'LeeSin', kills: 2, deaths: 2, assists: 5, cs: 78,
        items: [1101, 3134, 3158, 1036, null, null], ward: 'oracle'},
      { championName : 'Ahri' , kills: 4, deaths: 1, assists: 3, cs: 120,
        items : [1056, 6655, 3020, null, null, null], ward: 'stealth' },
      { championName : 'Jinx', kills: 3, deaths: 2, assists: 2, cs: 125,
        items: [1055, 6672, 3006, 1036, null, null], ward: 'farsight'},
      { championName : 'Thresh', kills: 0, deaths: 2, assists: 8, cs: 18,
        items : [3865, 3047, 1029, 2055, null, null], ward: 'oracle'},
    ],
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
    
   players : [
    { championName : 'Renekton', kills: 2, deaths: 3, assists: 1, cs: 105,
      items : [1054, 3047, 3133, 2003, null, null], ward: 'stealth'},
    { championName : 'Viego' , kills: 3, deaths: 2, assists: 2, cs: 82,
      items : [1102, 3153, 3006, null, null, null], ward: 'oracle'},  
    { championName : 'Orianna', kills: 1, deaths: 3, assists: 3, cs: 118,
      items: [1056, 3802,3020,1052, null, null], ward: 'stealth'},
    { championName : 'Kaisa', kills: 2,deaths: 2, assists: 2, cs: 121,
      items: [1055, 3124, 3006, null, null, null], ward: 'farsight'}, 
    { championName : 'Nautilus', kills: 0, deaths: 2, assists: 5, cs: 15,
      items: [3865, 3111, 1029, 2055, null, null], ward: 'oracle'},
    ]
  },

  players: initialPlayers,

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