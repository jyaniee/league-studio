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