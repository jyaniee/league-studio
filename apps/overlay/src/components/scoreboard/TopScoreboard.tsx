import type { GameState } from '@league-studio/shared-types';

import MainBar from './MainBar';
import TimerObjectiveBar from './TimerObjectiveBar';

type TopScoreboardProps = {
  gameState: GameState;
};


// 4. 메인 컴포넌트
export default function TopScoreboard({ gameState }: TopScoreboardProps) {
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