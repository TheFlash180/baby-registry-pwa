import { describe, expect, it } from 'vitest';
import { claimedQty, type Claim } from '../types';

const claim = (qty: number, over: Partial<Claim> = {}): Claim => ({
  id: 'c1',
  item_id: 'i1',
  claimer_name: 'Guest',
  claim_token_hash: 'hash',
  qty,
  claimed_at: '2026-07-01T00:00:00Z',
  ...over,
});

describe('claimedQty', () => {
  it('is 0 for no claims', () => {
    expect(claimedQty([])).toBe(0);
  });

  it('sums a single claim', () => {
    expect(claimedQty([claim(3)])).toBe(3);
  });

  it('sums quantities across claims', () => {
    expect(claimedQty([claim(1), claim(2, { id: 'c2' }), claim(3, { id: 'c3' })])).toBe(6);
  });
});
