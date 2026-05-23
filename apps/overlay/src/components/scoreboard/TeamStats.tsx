import React from 'react';

import coinImg from '../../assets/scoreboard/coin.png';
import towerImg from '../../assets/scoreboard/tower.png';

const BLUE_TOWER_FILTER = 'invert(48%) sepia(82%) saturate(4156%) hue-rotate(203deg) brightness(97%) contrast(97%)';
const BLUE_COIN_FILTER = 'invert(48%) sepia(82%) saturate(4156%) hue-rotate(203deg) brightness(97%) contrast(97%)';

const RED_TOWER_FILTER = 'invert(37%) sepia(61%) saturate(3025%) hue-rotate(328deg) brightness(101%) contrast(92%)';
const RED_COIN_FILTER = 'invert(37%) sepia(61%) saturate(3025%) hue-rotate(328deg) brightness(101%) contrast(92%)';

type Side = "blue" | "red";

type TeamStatsProps = {
  towers: number;
  gold: string;
  goldDiff: string;
  side: Side;
};

export default function TeamStats({ towers, gold, goldDiff, side }: TeamStatsProps) {
  const isRed = side === 'red';

  const diffTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isRed ? '#F43F5E' : '#3B82F6',
    fontWeight: '500',
    lineHeight: '1',
    visibility: goldDiff ? 'visible' : 'hidden',
  };

  const goldTextStyle: React.CSSProperties = {
    fontSize: '20px',
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: '1.1',
  };

  // 블루팀 레이아웃
  const renderBlueStats = () => (
    <>
      {/* 타워 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <img 
          src={towerImg} 
          alt="tower" 
          style={{ width: '32px', height: '32px', objectFit: 'contain', filter: BLUE_TOWER_FILTER }} 
        />
        <span style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: '500' }}>{towers}</span>
      </div>

      {/* 골드 및 격차 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <img 
          src={coinImg} 
          alt="coin" 
          style={{ width: '24px', height: '24px', objectFit: 'contain', filter: BLUE_COIN_FILTER }} 
        />

        <div 
          style={{ 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center',
          }}
        >
          <span style={goldTextStyle}>
            {gold}
          </span>
          <span style={{
            ...diffTextStyle,
            position: 'absolute',
            top: '26px',
            left: 0,
          }}>
            {goldDiff || '+0.0K'}
          </span>
        </div>
      </div>
    </>
  );

  // 레드팀 레이아웃 (-2.1K 격차 삭제 완료!)
  const renderRedStats = () => (
    <>
      {/* 골드 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
          >
          <span style={goldTextStyle}>
            {gold}
          </span>
          <span style={{
            ...diffTextStyle,
            position: 'absolute',
            top: '26px',
            right: 0,
          }}>
            {goldDiff || '+0.0K'}
          </span>
        </div>

        <img 
          src={coinImg} 
          alt="coin" 
          style={{ width: '24px', height: '24px', objectFit: 'contain', filter: RED_COIN_FILTER }} 
        />
      </div>

      {/* 타워 정보 구역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
        <span style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: '500' }}>
          {towers}
        </span>
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
      width: '210px',
      display: 'flex', 
      alignItems: 'center', 
      gap: '24px', 
      justifyContent: isRed ? 'flex-end' : 'flex-start', 
      boxSizing: 'border-box',
    }}>
      {isRed ? renderRedStats() : renderBlueStats()}
    </div>
  );
}