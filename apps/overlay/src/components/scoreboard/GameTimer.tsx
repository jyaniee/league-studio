import React from 'react';

type GameTimerProps = {
  seconds?: number;
};

export default function GameTimer({ seconds = 0 }: GameTimerProps) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return (
    <span
      style={{
        fontSize: '18px',
        color: '#FFFFFF',
        fontWeight: '500',
        letterSpacing: '1px',
        minWidth: '54px',
        textAlign: 'center',
      }}
    >
      {formattedMinutes}:{formattedSeconds}
    </span>
  );
}