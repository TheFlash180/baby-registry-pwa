import type { Filter } from '../lib/types';

const LABELS: Record<Filter, string> = {
  all: 'All items',
  needed: 'Still needed',
  claimed: 'Claimed',
};

export function Filters({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="filters" role="tablist">
      {(Object.keys(LABELS) as Filter[]).map((f) => (
        <button
          key={f}
          role="tab"
          aria-selected={value === f}
          className={value === f ? 'active' : ''}
          onClick={() => onChange(f)}
        >
          {LABELS[f]}
        </button>
      ))}
    </div>
  );
}
