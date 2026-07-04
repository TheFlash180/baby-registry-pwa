import { TeddyBear } from './Motifs';

export function GrowthMeter({ claimed, total }: { claimed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((claimed / total) * 100);
  const fill = Math.max(pct, 2);
  return (
    <div className="meter" aria-label={`${claimed} of ${total} gifts claimed`}>
      <div className="label">
        <span className="eyebrow">our little list is growing</span>
        <span className="count">
          {claimed} of {total}
        </span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${fill}%` }} />
        <span className="rider" style={{ left: `${fill}%` }}>
          <TeddyBear />
        </span>
      </div>
    </div>
  );
}
