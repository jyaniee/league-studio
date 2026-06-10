import voidgrubIcon from '../../assets/objectives/major/voidgrub.png';

const VOIDGRUB_GROUP_OFFSET = 270;

type VoidgrubObjectiveProps = {
  count: number;
  side: 'blue' | 'red';
};

export default function VoidgrubObjective({
  count,
  side,
}: VoidgrubObjectiveProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '5px',

        left: side === 'blue' ? `calc(50% - ${VOIDGRUB_GROUP_OFFSET}px)` : 'auto',
        right: side === 'red' ? `calc(50% - ${VOIDGRUB_GROUP_OFFSET}px)` : 'auto',

        display: 'flex',
        alignItems: 'center',
        gap: '6px',

        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: '18px',
        fontWeight: 500,
      }}
    >
      {side === 'blue' && (
        <>
          <img
            src={voidgrubIcon}
            alt="voidgrub"
            style={{
              width: '20px',
              height: '20px',
              objectFit: 'contain',
              filter: 'grayscale(1) brightness(2)',
              opacity: 0.9,
            }}
          />
          <span>{count}</span>
        </>
      )}

      {side === 'red' && (
        <>
          <span>{count}</span>
          <img
            src={voidgrubIcon}
            alt="voidgrub"
            style={{
              width: '20px',
              height: '20px',
              objectFit: 'contain',
              filter: 'grayscale(1) brightness(2)',
              opacity: 0.9,
            }}
          />
        </>
      )}
    </div>
  );
}