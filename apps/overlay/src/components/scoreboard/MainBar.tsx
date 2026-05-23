import React from 'react';
import type { GameState } from '@league-studio/shared-types';

import TeamHeader from './TeamHeader';

import logoImg from '../../assets/brand/league-studio_logo_draft_v3.png';
import coinImg from '../../assets/scoreboard/coin.png';
import towerImg from '../../assets/scoreboard/tower.png';

const BLUE_TOWER_FILTER = 'invert(48%) sepia(82%) saturate(4156%) hue-rotate(203deg) brightness(97%) contrast(97%)';
const BLUE_COIN_FILTER = 'invert(48%) sepia(82%) saturate(4156%) hue-rotate(203deg) brightness(97%) contrast(97%)';

const RED_TOWER_FILTER = 'invert(37%) sepia(61%) saturate(3025%) hue-rotate(328deg) brightness(101%) contrast(92%)';
const RED_COIN_FILTER = 'invert(37%) sepia(61%) saturate(3025%) hue-rotate(328deg) brightness(101%) contrast(92%)';

const SCOREBOARD_WIDTH = 1080;
const MAIN_BAR_HEIGHT = 72;

const DIVIDER_OFFSET = 294;
const TOWER_ICON_OFFSET = 270;
const TOWER_COUNT_OFFSET = 250;
const GOLD_ICON_OFFSET = 208;
const GOLD_TEXT_OFFSET = 160;
const KILL_TEXT_OFFSET = 60;

const TOWER_ICON_HEIGHT = 20;
const GOLD_ICON_HEIGHT = 20;
const CENTER_LOGO_HEIGHT = 40;

const SCORE_FONT_SIZE = 30;
const STAT_FONT_SIZE = 18;
const GOLD_FONT_SIZE = 18;
const GOLD_DIFF_FONT_SIZE = 14;

type MainBarProps = {
  gameState: GameState;
};

function formatGold(gold?: number): string {
  if (gold === undefined){
    return '-';
  }
  return `${(gold / 1000).toFixed(1)}K`;
}

function formatGoldLead(teamGold?: number, opponentGold?: number): string {
  if (teamGold === undefined || opponentGold === undefined) {
    return '';
  }

  const diff = teamGold - opponentGold;

  if (diff <= 0) {
    return '';
  }

  return `+${(diff / 1000).toFixed(1)}K`;
}

function centerLeft(offset: number) {
  return `calc(50% - ${offset}px)`;
}

function centerRight(offset: number) {
  return `calc(50% + ${offset}px)`;
}

const anchorBase: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
};

const scoreTextStyle: React.CSSProperties = {
  fontSize: `${SCORE_FONT_SIZE}px`,
  fontWeight: 500,
  color: '#FFFFFF',
  lineHeight: 1,
};

const statTextStyle: React.CSSProperties = {
  fontSize: `${STAT_FONT_SIZE}px`,
  fontWeight: 500,
  color: '#FFFFFF',
  lineHeight: 1,
};

const goldTextStyle: React.CSSProperties = {
  fontSize: `${GOLD_FONT_SIZE}px`,
  fontWeight: 500,
  color: '#FFFFFF',
  lineHeight: 1,
};

const goldDiffStyleBase: React.CSSProperties = {
  position: 'absolute',
  top: '50px',
  transform: 'translateX(-50%)',
  fontSize: `${GOLD_DIFF_FONT_SIZE}px`,
  fontWeight: 500,
  lineHeight: 1,
};

export default function MainBar({ gameState }: MainBarProps) {
  const { blueTeam, redTeam } = gameState;

  const blueGold = formatGold(blueTeam.globalGold);
  const redGold = formatGold(redTeam.globalGold);

  const blueGoldLead = formatGoldLead(blueTeam.globalGold, redTeam.globalGold);
  const redGoldLead = formatGoldLead(redTeam.globalGold, blueTeam.globalGold);

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: `${SCOREBOARD_WIDTH}px`, 
      height: `${MAIN_BAR_HEIGHT}px`, 
      position: 'relative',
      overflow: 'hidden',

      background: 'linear-gradient(to right, #3B82F6 0%, #17112B 22%, #17112B 78%, #F43F5E 100%)', 
      
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)', 
      padding: '0 37px', 
      boxSizing: 'border-box',
      fontFamily: '"Sora", sans-serif'
    }}>
      
      {/* 블루팀 헤더 슬롯 */}
      <div style={{ 
        position: 'absolute',
        left: 0,
        top: 0,
        width: '246px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '28px',
        boxSizing: 'border-box',
        }}
      >
        <TeamHeader 
          name={blueTeam.name} 
          logo={blueTeam.logoUrl} 
          side="blue"
        />
      </div>


      {/* 레드팀 헤더 슬롯 */}
      <div style={{ 
        position: 'absolute',
        right: 0,
        top: 0,
        width: '246px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '28px',
        boxSizing: 'border-box',
        }}
      >
      
        <TeamHeader
          name={redTeam.name}
          logo={redTeam.logoUrl}
          side="red"
        />
      </div>

        {/* 블루 구분선 */}
        <div style={{
          ...anchorBase,
          left: centerLeft(DIVIDER_OFFSET),
          width: '3px',
          height: '56px',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
        }}
        />

        {/* 레드 구분선 */}
        <div style={{
          ...anchorBase,
          left: centerRight(DIVIDER_OFFSET),
          width: '3px',
          height: '56px',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
        }}
        />

        {/* 블루 타워 아이콘 */}
        <img
          src={towerImg}
          alt="blue tower"
          style={{
            ...anchorBase,
            left: centerLeft(TOWER_ICON_OFFSET),
            height: `${TOWER_ICON_HEIGHT}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: BLUE_TOWER_FILTER,
          }}
        />

        {/* 블루 타워 수 */}
        <span style={{
          ...anchorBase,
          left: centerLeft(TOWER_COUNT_OFFSET),
          ...statTextStyle,
        }}
        >
          {blueTeam.towers}
        </span>

        {/* 블루 골드 아이콘 */}
        <img
          src={coinImg}
          alt="blue gold"
          style={{
            ...anchorBase,
            left: centerLeft(GOLD_ICON_OFFSET),
            height: `${GOLD_ICON_HEIGHT}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: BLUE_COIN_FILTER,
          }}
        />

        {/* 블루 골드 텍스트 */}
        <span style={{
          ...anchorBase,
          left: centerLeft(GOLD_TEXT_OFFSET),
          ...goldTextStyle,
          }}
        >
          {blueGold}
        </span>


        {/* 블루 골드 우세 표시 */}
        <span style={{
          ...goldDiffStyleBase,
          left: centerLeft(GOLD_TEXT_OFFSET),
          color: '#3B82F6',
          visibility: blueGoldLead ? 'visible' : 'hidden',
        }}
        >
          {blueGoldLead || '+0.0K'}
        </span>

        {/* 블루 킬 */}
        <span style={{
          ...anchorBase,
          left: centerLeft(KILL_TEXT_OFFSET),
          ...scoreTextStyle,
        }}
        >
          {blueTeam.kills}
        </span>

        {/* 중앙 로고 */}
        <img
          src={logoImg}
          alt="League Studio Logo"
          style={{
            ...anchorBase,
            left: '50%',
            height: `${CENTER_LOGO_HEIGHT}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1) brightness(1.5)',
          }}
        />

        {/* 레드 킬 */}
        <span style={{
          ...anchorBase,
          left: centerRight(KILL_TEXT_OFFSET),
          ...scoreTextStyle,
        }}
        >
          {redTeam.kills}
        </span>


        {/* 레드 골드 텍스트 */}
        <span style={{
          ...anchorBase,
          left: centerRight(GOLD_TEXT_OFFSET),
          ...goldTextStyle,
        }}
        >
          {redGold}
        </span>


        {/* 레드 골드 우세 표시 */}
        <span style={{
          ...goldDiffStyleBase,
          left: centerRight(GOLD_TEXT_OFFSET),
          color: '#F43F5E',
          visibility: redGoldLead ? 'visible' : 'hidden',
        }}
        >
          {redGoldLead || '+0.0K'}
        </span>


        {/* 레드 골드 아이콘 */}
        <img
          src={coinImg}
          alt="red gold"
          style={{
            ...anchorBase,
            left: centerRight(GOLD_ICON_OFFSET),
            height: `${GOLD_ICON_HEIGHT}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: RED_COIN_FILTER,
          }}
        />


        {/* 레드 타워 수 */}
        <span style={{
          ...anchorBase,
          left: centerRight(TOWER_COUNT_OFFSET),
          ...statTextStyle,
        }}
        >
          {redTeam.towers}
        </span>


        {/* 레드 타워 아이콘 */}
        <img
          src={towerImg}
          alt="red tower"
          style={{
            ...anchorBase,
            left: centerRight(TOWER_ICON_OFFSET),
            height: `${TOWER_ICON_HEIGHT}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: RED_TOWER_FILTER,
          }}
        />
      </div>
  );
}
