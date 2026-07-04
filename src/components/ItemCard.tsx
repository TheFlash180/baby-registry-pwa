import { useState } from 'react';
import { claimedQty, type Claim, type Item, type Retailer } from '../lib/types';

function formatZar(n: number): string {
  return `R${n.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
}

export function ItemCard({
  item,
  retailers,
  claims,
  online,
  onClaim,
  onShowClaims,
}: {
  item: Item;
  retailers: Retailer[];
  claims: Claim[];
  online: boolean;
  onClaim: () => void;
  onShowClaims: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...retailers].sort((a, b) => a.price_zar - b.price_zar);
  const cheapest = sorted[0];
  const iconSrc = `${import.meta.env.BASE_URL}${item.icon_path}`;
  const taken = claimedQty(claims);
  const spotsLeft = item.max_claims - taken;
  const full = spotsLeft <= 0;

  const first = claims[0];
  const pillLabel =
    claims.length === 1
      ? `${first.claimer_name}${first.qty > 1 ? ` ×${first.qty}` : ''}`
      : `${first?.claimer_name} +${claims.length - 1}`;

  return (
    <div className={`item-card${full ? ' claimed-card' : ''}`}>
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
          {item.max_claims > 1 && !full && (
            <div className="spots-left" onClick={claims.length > 0 ? onShowClaims : undefined}>
              {taken === 0
                ? `${item.max_claims} can claim this`
                : `${taken} of ${item.max_claims} claimed · ${spotsLeft} left`}
            </div>
          )}
        </div>
        {full ? (
          <button className="claimed-pill" onClick={onShowClaims} title="See who claimed this">
            🎁 {pillLabel}
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
