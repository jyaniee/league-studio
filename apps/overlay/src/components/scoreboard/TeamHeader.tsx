import React from 'react';

type Side = "blue" | "red";

type TeamHeaderProps = {
  name: string;
  logo: string;
  side: Side;
};

export default function TeamHeader({ name, logo, side }: TeamHeaderProps) {
  const isRed = side === "red";

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '24px',
      flexDirection: 'row',
      width: 'max-content',
      justifyContent: isRed ? 'flex-end' : 'flex-start' 
    }}>

      {/* 🔵 블루팀 렌더링 순서: [로고] -> [팀명] */}
      {!isRed && (
        <img 
          src={logo} 
          style={{ width: '55px', height: '55px', objectFit: 'contain', filter: 'grayscale(1) brightness(0) invert(1)' }}
          alt={name} 
        />
      )}
      {!isRed && <span style={{ fontSize: '46px', fontWeight: '800', color: '#FFF', fontFamily: '"Sora", sans-serif' }}>{name}</span>}

      {/* 🔴 레드팀 렌더링 순서: [팀명] -> [로고] */}
      {isRed && <span style={{ fontSize: '46px', fontWeight: '800', color: '#FFF', fontFamily: '"Sora", sans-serif' }}>{name}</span>}
      {isRed && (
        <img 
          src={logo} 
          style={{ maxWidth: '71px', height: '45px', objectFit: 'contain', filter: 'grayscale(1) brightness(0) invert(1)' }} 
          alt={name} 
        />
      )}
      
    </div>
  );
}