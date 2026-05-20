import React from 'react';

import coinImg from '../../assets/coin.png';
import towerImg from '../../assets/tower.png';

const BLUE_TOWER_FILTER = 'invert(48%) sepia(82%) saturate(4156%) hue-rotate(203deg) brightness(97%) contrast(97%)';
const BLUE_COIN_FILTER = 'invert(48%) sepia(82%) saturate(4156%) hue-rotate(203deg) brightness(97%) contrast(97%)';

const RED_TOWER_FILTER = 'invert(37%) sepia(61%) saturate(3025%) hue-rotate(328deg) brightness(101%) contrast(92%)';
const RED_COIN_FILTER = 'invert(37%) sepia(61%) saturate(3025%) hue-rotate(328deg) brightness(101%) contrast(92%)';

type Side = "blue" | "red";

type TeamStatsProps = {
  kills: number;
  towers: number;
  gold: string;
  goldDiff: string;
  side: Side;
};

export default function TeamStats({ kills, towers, gold, goldDiff, side }: TeamStatsProps) {
  const isRed = side === 'red';

  // 🔵 블루팀 레이아웃
  const renderBlueStats = () => (
    <>
      {/* 🏰 타워 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <img 
          src={towerImg} 
          alt="tower" 
          style={{ width: '32px', height: '32px', objectFit: 'contain', filter: BLUE_TOWER_FILTER }} 
        />
        <span style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: '500' }}>0</span>
      </div>

      {/* 💰 골드 및 격차 정보 구역 (세로 정렬) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <img 
          src={coinImg} 
          alt="coin" 
          style={{ width: '24px', height: '24px', objectFit: 'contain', filter: BLUE_COIN_FILTER }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: '500', lineHeight: '1.1' }}>
            12.5K
          </span>
          <span style={{ fontSize: '14px', color: '#3B82F6', fontWeight: '500', marginTop: '2px' }}>
            +0.4K
          </span>
        </div>
      </div>
    </>
  );

  // 🔴 레드팀 레이아웃 (-2.1K 격차 삭제 완료!)
  const renderRedStats = () => (
    <>
      {/* 💰 골드 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <span style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: '500' }}>12.1K</span>
        <img 
          src={coinImg} 
          alt="coin" 
          style={{ width: '24px', height: '24px', objectFit: 'contain', filter: RED_COIN_FILTER }} 
        />
      </div>

      {/* 🏰 타워 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <span style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: '500' }}>0</span>
        <img 
          src={towerImg} 
          alt="tower" 
          style={{ width: '32px', height: '32px', objectFit: 'contain', filter: RED_TOWER_FILTER }} 
        />
      </div>
    </>
  );

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '24px', 
      flex: 1, 
      justifyContent: isRed ? 'flex-end' : 'flex-start', 
      padding: isRed ? '0 16px 0 0' : '0 0 0 16px' 
    }}>
      {isRed ? renderRedStats() : renderBlueStats()}
    </div>
  );
}