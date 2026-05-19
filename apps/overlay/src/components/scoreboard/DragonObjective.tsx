import React from 'react';

export type DragonType =
  | "cloud"
  | "infernal"
  | "mountain"
  | "ocean"
  | "hextech"
  | "chemtech"
  | "elder";

type DragonObjectiveProps = {
  blueDragons: DragonType[];
  redDragons: DragonType[];
};

// 드래곤 타입별 임시 아이콘(이모지) 매핑 매니저
const DRAGON_ICONS: Record<DragonType, string> = {
  cloud: "💨",
  infernal: "🔥",
  mountain: "⛰️",
  ocean: "💧",
  hextech: "⚡",
  chemtech: "🧪",
  elder: "🐲"
};

export default function DragonObjective({ blueDragons, redDragons }: DragonObjectiveProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      {/* 블루팀 획득 드래곤 */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {blueDragons.map((dragon, idx) => (
          <span key={`blue-${idx}`} style={{ fontSize: '14px' }} title={dragon}>
            {DRAGON_ICONS[dragon]}
          </span>
        ))}
      </div>

      <span style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '12px' }}>DRAGONS</span>

      {/* 레드팀 획득 드래곤 */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {redDragons.map((dragon, idx) => (
          <span key={`red-${idx}`} style={{ fontSize: '14px' }} title={dragon}>
            {DRAGON_ICONS[dragon]}
          </span>
        ))}
      </div>
    </div>
  );
}
