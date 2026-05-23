export const OBJECTIVE_FIRST_SPAWN_TIMES = {
  dragon: 5 * 60,      // 5:00
  voidgrubs: 8 * 60,   // 8:00
  herald: 15 * 60,     // 15:00
  baron: 20 * 60,      // 20:00
} as const;

export const OBJECTIVE_RESPAWN_TIMES = {
  dragon: 5 * 60,      // 처치 후 5분
  elder: 6 * 60,       // 처치 후 6분
  baron: 6 * 60,       // 처치 후 6분
} as const;