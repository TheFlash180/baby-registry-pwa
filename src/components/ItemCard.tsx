import { useState } from 'react';
import type { Claim, Item, Retailer } from '../lib/types';

function formatZar(n: number): string {
  return `R${n.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
}

export function ItemCard({
  item,
  retailers,
  claim,
  online,
  onClaim,
  onShowClaim,
}: {
  item: Item;
  retailers: Retailer[];
  claim: Claim | undefined;
  online: boolean;
  onClaim: () => void;
  onShowClaim: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...retailers].sort((a, b) => a.price_zar - b.price_zar);
  const cheapest = sorted[0];
  const iconSrc = `${import.meta.env.BASE_URL}${item.icon_path}`;

  return (
    <div className={`item-card${claim ? ' claimed-card' : ''}`}>
      <div className="item-row">
        <img
          className="item-icon"
          src={iconSrc}
          alt=""
          loading="lazy"
          onError={(e) => {
            // Fall back to the soft gift-box icon if an item icon is missing.
            (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}icons/gift-box.svg`;
          }}
        />
        <div className="item-info">
          <div className="item-name">{item.name}</div>
          {cheapest && (
            <div className="item-price">
              From{' '}
              <a href={cheapest.url} target="_blank" rel="noreferrer">
                {formatZar(cheapest.price_zar)} at {cheapest.store}
              </a>
              {sorted.length > 1 && (
                <button className="expand" onClick={() => setExpanded(!expanded)}>
                  {expanded ? 'hide shops' : `+${sorted.length - 1} more`}
                </button>
              )}
            </div>
          )}
        </div>
        {claim ? (
          <button className="claimed-pill" onClick={onShowClaim} title="See who claimed this">
            🎁 {claim.claimer_name}
          </button>
        ) : (
          <button className="btn btn-claim" onClick={onClaim} disabled={!online}>
            I&rsquo;ll get this
          </button>
        )}
      </div>
      {expanded && sorted.length > 1 && (
        <div className="retailer-list">
          {sorted.slice(1).map((r) => (
            <div className="row" key={r.id}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.store}
              </a>
              <span>{formatZar(r.price_zar)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
