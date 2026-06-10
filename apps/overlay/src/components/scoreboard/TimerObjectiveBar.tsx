import type { GameState } from '@league-studio/shared-types';

import DragonObjective from './DragonObjective';
import GameTimer from './GameTimer';
import voidgrubIcon from '../../assets/objectives/major/voidgrub.png';

const SCOREBOARD_WIDTH = 1080;
const TIMER_OBJECTIVE_BAR_HEIGHT = 36;

const TOWER_ICON_OFFSET = 270;
const DRAGON_GROUP_OFFSET = 60;

type TimerObjectiveBarProps = {
  gameState: GameState;
};


function VoidgrubCount({ count, side, }: { count: number, side: 'blue' | 'red'; }) {
  return(
    <div 
      style={{
        position: 'absolute',
        top: '5px',

        left: side === 'blue' ? `calc(50% - ${TOWER_ICON_OFFSET}px)` : 'auto',
        right: side === 'red' ? `calc(50% - ${TOWER_ICON_OFFSET}px)` : 'auto',

        display: 'flex',
        alignItems: 'center',
        gap: '6px',

        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: '18px',
        fontWeight: 500,
      }}
    >
      {side === 'blue' && (
        <>
        <img
          src={voidgrubIcon}
          alt="voidgrub"
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'contain',
            filter: 'grayscale(1) brightness(2)',
            opacity: 0.9,
          }}
        />
        <span>{count}</span>
        </>
      )}

      {side === 'red' && (
        <>
        <span>{count}</span>
        <img
          src={voidgrubIcon}
          alt="voidgrub"
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'contain',
            filter: 'grayscale(1) brightness(2)',
            opacity: 0.9,
          }}
        />
        </>
      )}
    </div> 
  );
}


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
      <VoidgrubCount count={blueTeam.voidgrubs} side="blue" />

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
      <VoidgrubCount count={redTeam.voidgrubs} side="red" />
    </div>
  );
}