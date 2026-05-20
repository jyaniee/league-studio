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
      gap: '40px', 
      flexDirection: 'row',
      width: '320px',
     
      justifyContent: isRed ? 'flex-end' : 'flex-start' 
    }}>

      {!isRed && (
        <img 
          src={logo} 
          style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'grayscale(1) brightness(0) invert(1)' }} 
          alt={name} 
        />
      )}
      {!isRed && <span style={{ fontSize: '50px', fontWeight: '900', color: '#FFF' }}>{name}</span>}

      {isRed && <span style={{ fontSize: '50px', fontWeight: '900', color: '#FFF' }}>{name}</span>}
      {isRed && (
        <img 
          src={logo} 
          style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'grayscale(1) brightness(0) invert(1)' }} 
          alt={name} 
        />
      )}
      
    </div>
  );
}
