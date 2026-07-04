import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { getClaimToken, sha256Hex } from './claimToken';
import type { Category, Claim, Item, Retailer } from './types';

export type ClaimResult = 'ok' | 'taken' | 'invalid' | 'offline' | 'error';

export function useRegistry() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [myTokenHash, setMyTokenHash] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const refetchClaims = useCallback(async () => {
    const { data, error } = await supabase.from('claims').select('*');
    if (!error && data) setClaims(data as Claim[]);
  }, []);

  useEffect(() => {
    sha256Hex(getClaimToken()).then(setMyTokenHash);

    (async () => {
      const [cats, its, rets, cls] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('items').select('*').order('sort_order'),
        supabase.from('retailers').select('*'),
        supabase.from('claims').select('*'),
      ]);
      if (cats.error || its.error || rets.error || cls.error) {
        setLoadError(true);
      } else {
        setCategories(cats.data as Category[]);
        setItems(its.data as Item[]);
        setRetailers(rets.data as Retailer[]);
        setClaims(cls.data as Claim[]);
      }
      setLoading(false);
    })();

    // Live sync: any claim added or removed anywhere updates every guest.
    const channel = supabase
      .channel('claims-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claims' },
        () => void refetchClaims(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetchClaims]);

  const claimItem = useCallback(
    async (itemId: string, name: string): Promise<ClaimResult> => {
      if (!navigator.onLine) return 'offline';
      const { data, error } = await supabase.rpc('claim_item', {
        p_item_id: itemId,
        p_name: name,
        p_token: getClaimToken(),
      });
      await refetchClaims();
      if (error) return 'error';
      return data as ClaimResult;
    },
    [refetchClaims],
  );

  const unclaimItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      if (!navigator.onLine) return false;
      const { data, error } = await supabase.rpc('remove_claim', {
        p_item_id: itemId,
        p_token: getClaimToken(),
      });
      await refetchClaims();
      return !error && data === true;
    },
    [refetchClaims],
  );

  return {
    categories,
    items,
    retailers,
    claims,
    myTokenHash,
    loading,
    loadError,
    claimItem,
    unclaimItem,
  };
}
