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


export default function DragonObjective({
  blueDragons,
  redDragons,
}: DragonObjectiveProps) {
  return (
    <div>
      {/* blueDragons, redDragons를 아이콘으로 렌더링 */}
    </div>
  );
}
