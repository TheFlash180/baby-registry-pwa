import { useState } from 'react';
import type { Claim, Item } from '../lib/types';
import { TeddyBear } from './Motifs';

export function ClaimModal({
  item,
  busy,
  onConfirm,
  onClose,
}: {
  item: Item;
  busy: boolean;
  onConfirm: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const valid = name.trim().length > 0;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TeddyBear className="teddy-small" />
        <h3>How lovely!</h3>
        <p>
          You&rsquo;re claiming <strong>{item.name}</strong>. Tell us who this
          thoughtful gift is from:
        </p>
        <input
          autoFocus
          placeholder="Your name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid && !busy) onConfirm(name.trim());
          }}
        />
        <div className="actions">
          <button className="btn btn-soft" onClick={onClose}>
            Not yet
          </button>
          <button
            className="btn btn-claim"
            disabled={!valid || busy}
            onClick={() => onConfirm(name.trim())}
          >
            {busy ? 'Saving…' : "I'll get this"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClaimedInfoModal({
  item,
  claim,
  isMine,
  busy,
  onUnclaim,
  onClose,
}: {
  item: Item;
  claim: Claim;
  isMine: boolean;
  busy: boolean;
  onUnclaim: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TeddyBear className="teddy-small" />
        <h3>Already spoken for</h3>
        <p>
          <strong>{item.name}</strong> will be lovingly brought by{' '}
          <strong>{claim.claimer_name}</strong>.
        </p>
        {isMine ? (
          <>
            <p>That&rsquo;s you! Changed your mind or picked the wrong one?</p>
            <div className="actions">
              <button className="btn btn-soft" onClick={onClose}>
                Keep it
              </button>
              <button className="btn btn-danger-soft" disabled={busy} onClick={onUnclaim}>
                {busy ? 'Removing…' : 'Remove my claim'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ opacity: 0.8 }}>
              Only the person who claimed it (from their own phone) or the
              registry owner can unclaim it — so nobody loses their pick.
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
