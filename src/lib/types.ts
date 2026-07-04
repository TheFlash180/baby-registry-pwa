export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  icon_path: string;
  sort_order: number;
  max_claims: number;
}

export interface Retailer {
  id: string;
  item_id: string;
  store: string;
  price_zar: number;
  url: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimer_name: string;
  claim_token_hash: string;
  qty: number;
  claimed_at: string;
}

/** Total spots taken by a list of claims (each claim can hold several). */
export function claimedQty(claims: Claim[]): number {
  return claims.reduce((sum, c) => sum + c.qty, 0);
}

export type Filter = 'all' | 'needed' | 'claimed';
