import React from 'react';

type GametimerProps = {
  seconds?: number;
}

export default function GameTimer({ seconds = 0 }: GametimerProps) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return (
    <span style={{ color: '#E2E8F0', fontWeight: 'bold' }}>
      ⏱️ {formattedMinutes}:{formattedSeconds}
    </span>
  );
}
