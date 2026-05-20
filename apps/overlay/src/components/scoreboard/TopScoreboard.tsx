import React, { useState } from 'react';
import MainBar from './MainBar';
import TimerObjectiveBar from './TimerObjectiveBar';

// 1. 로고 이미지 불러오기
import ktLogo from '../../assets/kt-rolster.png'; 
import hleLogo from '../../assets/hanwha.png';

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
  blueTeam: { name: "KT", logo: ktLogo, kills: 12, gold: "45.2K", goldDiff: "+2.1K", towers: 4 , dragons: [] },
  redTeam: { name: "HLE", logo: hleLogo, kills: 8, gold: "43.1K", goldDiff: "-2.1K", towers: 2 }, dragons: ["clound","mountain"]
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
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'transparent', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <MainBar gameData={gameData} updateKill={handleUpdateKill} />
      <TimerObjectiveBar gameTime={gameData.gameTime} />
    </div>
  );
}
