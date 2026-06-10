type VoidgrubObjectiveProps = {
  blueCount: number;
  redCount: number;
  maxCount?: number;
};

export default function VoidgrubObjective({blueCount, redCount, maxCount = 6}: VoidgrubObjectiveProps) {

  return (
    <span style={{ color: '#B794F4'}}>
      👾 {blueCount} / {redCount} / {maxCount} ACTIVE
    </span>
  );
}
