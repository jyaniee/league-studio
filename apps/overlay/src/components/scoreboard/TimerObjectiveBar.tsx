import React from 'react';
import 바람용 from '../../assets/바람용.png';
import 화염용 from '../../assets/화염용.png';

export default function TimerObjectiveBar() {
  return (
    <div
      style={{
        width: '100%',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: '-2px',
        background: `
        linear-gradient(
          90deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.12) 15%,
          rgba(255,255,255,0.35) 25%,
          rgba(20,15,30,0.92) 35%,
          rgba(20,15,30,0.98) 50%,
          rgba(20,15,30,0.92) 65%,
          rgba(255,255,255,0.35) 75%,
          rgba(255,255,255,0.12) 85%,
          rgba(255,255,255,0) 100%
        )
        `,
        backdropFilter: 'blur(6px)',
        fontFamily: '"Sora", sans-serif',
      }}
    >
      {/* 중앙 시간 및 오브젝트 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            color: '#FFFFFF',
            fontWeight: '500',
            letterSpacing: '1px',
          }}
        >
          13:05
        </span>

        {/* 드래곤 아이콘 */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <img 
            src={바람용} 
            alt="바람용" 
            style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
          />
          <img 
            src={화염용} 
            alt="화염용" 
            style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
          />
        </div>
      </div>
    </div>
  );
}