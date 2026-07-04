import { useState } from 'react';
import { claimedQty, type Claim, type Item } from '../lib/types';
import { TeddyBear, Heart } from './Motifs';

// Generic warm popup with an OK button — used for "someone just claimed
// this" and similar messages that must not be missed.
export function InfoModal({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TeddyBear className="teddy-small" />
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="actions">
          <button className="btn btn-claim" onClick={onClose} autoFocus>
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClaimModal({
  item,
  spotsLeft,
  busy,
  onConfirm,
  onClose,
}: {
  item: Item;
  spotsLeft: number;
  busy: boolean;
  onConfirm: (name: string, qty: number) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const valid = name.trim().length > 0;
  const multi = item.max_claims > 1 && spotsLeft > 1;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TeddyBear className="teddy-small" />
        <h3>How lovely!</h3>
        <p>
          You&rsquo;re claiming <strong>{item.name}</strong>
          {item.max_claims > 1 && (
            <>
              {' '}
              ({spotsLeft} of {item.max_claims} spot{item.max_claims > 1 ? 's' : ''} still open)
            </>
          )}
          . Tell us who this thoughtful gift is from:
        </p>
        <input
          autoFocus
          placeholder="Your name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid && !busy) onConfirm(name.trim(), qty);
          }}
        />
        {multi && (
          <div className="qty-row">
            <span>How many will you bring?</span>
            <div className="qty-stepper">
              <button
                type="button"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="fewer"
              >
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button
                type="button"
                disabled={qty >= spotsLeft}
                onClick={() => setQty((q) => Math.min(spotsLeft, q + 1))}
                aria-label="more"
              >
                +
              </button>
            </div>
          </div>
        )}
        <div className="actions">
          <button className="btn btn-soft" onClick={onClose}>
            Not yet
          </button>
          <button
            className="btn btn-claim"
            disabled={!valid || busy}
            onClick={() => onConfirm(name.trim(), qty)}
          >
            {busy ? 'Saving…' : qty > 1 ? `I'll get ${qty}` : "I'll get this"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClaimedInfoModal({
  item,
  claims,
  myTokenHash,
  busy,
  onUnclaim,
  onClose,
}: {
  item: Item;
  claims: Claim[];
  myTokenHash: string;
  busy: boolean;
  onUnclaim: () => void;
  onClose: () => void;
}) {
  const mine = claims.find((c) => c.claim_token_hash === myTokenHash);
  const taken = claimedQty(claims);
  const full = taken >= item.max_claims;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TeddyBear className="teddy-small" />
        <h3>{full ? 'All spoken for' : 'Who claimed this'}</h3>
        <p>
          <strong>{item.name}</strong> will be lovingly brought by:
        </p>
        <div className="claimer-list">
          {claims.map((c) => (
            <div className="claimer" key={c.id}>
              <Heart size={12} />{' '}
              <strong>{c.claimer_name}</strong>
              {c.qty > 1 && ` ×${c.qty}`}
              {c.claim_token_hash === myTokenHash && ' (you)'}
            </div>
          ))}
        </div>
        {item.max_claims > 1 && !full && (
          <p style={{ opacity: 0.8 }}>
            {item.max_claims - taken} of {item.max_claims} spots still open.
          </p>
        )}
        {mine ? (
          <>
            <p>Changed your mind or picked the wrong one?</p>
            <div className="actions">
              <button className="btn btn-soft" onClick={onClose}>
                Keep it
              </button>
              <button className="btn btn-danger-soft" disabled={busy} onClick={onUnclaim}>
                {busy ? 'Removing…' : mine.qty > 1 ? `Remove my claim (×${mine.qty})` : 'Remove my claim'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ opacity: 0.8 }}>
              Only the person who claimed it (from their own phone) or the
              registry owner can remove a claim — so nobody loses their pick.
            </p>
            <div className="actions">
              <button className="btn btn-claim" onClick={onClose}>
                Okay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ThankYouModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TeddyBear className="teddy-small" />
        <h3>Thank you, {name}!</h3>
        <p>
          Your gift has been noted with love. Everyone else&rsquo;s list just
          updated too — no doubles, promise. 🤍
        </p>
        <div className="actions">
          <button className="btn btn-claim" onClick={onClose}>
            Back to the list
          </button>
        </div>
      </div>
    </div>
  );
}
