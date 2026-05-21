import React, { useState } from 'react';
import MainBar from './MainBar';
import TimerObjectiveBar from './TimerObjectiveBar';

// 1. 로고 이미지 불러오기
import ktLogo from '../../assets/teams/kt-rolster.png'; 
import hleLogo from '../../assets/teams/hanwha.png';

// 2. 타입 정의
export type TeamData = {
  name: string;
  logo: string;
  kills: number;
  gold: string;
  goldDiff: string;
  towers: number;
};

export type GameData = {
  gameTime: string;
  blueTeam: TeamData;
  redTeam: TeamData;
};

// 3. 초기 데이터 세팅
const initialData: GameData = {
  gameTime: "13:05",
  blueTeam: { name: "KT", logo: ktLogo, kills: 12, gold: "45.2K", goldDiff: "+2.1K", towers: 4 },
  redTeam: { name: "HLE", logo: hleLogo, kills: 8, gold: "43.1K", goldDiff: "-2.1K", towers: 2 }
};

// 4. 메인 컴포넌트
export default function TopScoreboard() {
  const [gameData, setGameData] = useState<GameData>(initialData);

  const handleUpdateKill = (team: 'blueTeam' | 'redTeam', delta: number) => {
    setGameData(prev => ({
      ...prev,
      [team]: { ...prev[team], kills: Math.max(0, prev[team].kills + delta) }
    }));
  };

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
      <MainBar gameData={gameData} updateKill={handleUpdateKill} />
      <TimerObjectiveBar gameTime={gameData.gameTime} />
    </div>
  );
}