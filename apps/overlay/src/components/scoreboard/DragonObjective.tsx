import type { DragonType } from '@league-studio/shared-types';

import cloudDrake from '../../assets/objectives/dragons/cloud-drake.png';
import infernalDrake from '../../assets/objectives/dragons/infernal-drake.png';
import mountainDrake from '../../assets/objectives/dragons/mountain-drake.png';
import oceanDrake from '../../assets/objectives/dragons/ocean-drake.png';
import hextechDrake from '../../assets/objectives/dragons/hextech-drake.png';
import chemtechDrake from '../../assets/objectives/dragons/chemtech-drake.png';
import elderDrake from '../../assets/objectives/dragons/elder-dragon.png';

type DragonObjectiveProps = {
  dragons: DragonType[];
  side: 'blue' | 'red';
};

const dragonIconMap: Record<DragonType, string> = {
  cloud: cloudDrake,
  infernal: infernalDrake,
  mountain: mountainDrake,
  ocean: oceanDrake,
  hextech: hextechDrake,
  chemtech: chemtechDrake,
  elder: elderDrake,
};

export default function DragonObjective({
  dragons,
  side,
}: DragonObjectiveProps) {
  if (dragons.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {dragons.map((dragon, index) => (
        <img
          key={`${side}-${dragon}-${index}`}
          src={dragonIconMap[dragon]}
          alt={`${dragon} dragon`}
          style={{
            width: '20px',
            height: '20px',
            objectFit: 'contain',
          }}
        />
      ))}
    </div>
  );
}