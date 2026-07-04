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
  claimed_at: string;
}

export type Filter = 'all' | 'needed' | 'claimed';
