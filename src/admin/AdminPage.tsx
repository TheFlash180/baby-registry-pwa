import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { useRegistry } from '../lib/useRegistry';
import type { Item, Retailer } from '../lib/types';
import { Toasts, type ToastMsg } from '../components/Toast';
import { TeddyBear } from '../components/Motifs';

type Registry = ReturnType<typeof useRegistry>;

// The password is verified inside Postgres on every action (see schema.sql).
// This page only remembers it for the session — nothing is trusted client-side.
export function AdminPage({
  registry,
  push,
  toasts,
}: {
  registry: Registry;
  push: (text: string, warn?: boolean) => void;
  toasts: ToastMsg[];
}) {
  const [password, setPassword] = useState(sessionStorage.getItem('registry-admin-pw') ?? '');
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retailerDrafts, setRetailerDrafts] = useState<Record<string, Partial<Retailer>>>({});
  const [newItemDrafts, setNewItemDrafts] = useState<Record<string, { name: string; max: string }>>({});
  const [localRetailers, setLocalRetailers] = useState<Retailer[] | null>(null);
  const [localItems, setLocalItems] = useState<Item[] | null>(null);

  const retailers = localRetailers ?? registry.retailers;
  const items = localItems ?? registry.items;

  const retailersByItem = useMemo(() => {
    const m = new Map<string, Retailer[]>();
    for (const r of retailers) {
      const list = m.get(r.item_id) ?? [];
      list.push(r);
      m.set(r.item_id, list);
    }
    return m;
  }, [retailers]);

  const reloadRetailers = async () => {
    const { data } = await supabase.from('retailers').select('*');
    if (data) setLocalRetailers(data as Retailer[]);
  };

  const reloadItems = async () => {
    const { data } = await supabase.from('items').select('*').order('sort_order');
    if (data) setLocalItems(data as Item[]);
  };

  const unlock = async () => {
    setChecking(true);
    const { data, error } = await supabase.rpc('admin_check_password', {
      p_password: password,
    });
    setChecking(false);
    if (!error && data === true) {
      sessionStorage.setItem('registry-admin-pw', password);
      setUnlocked(true);
    } else {
      push("That password isn't right — try again.", true);
    }
  };

  const saveRetailer = async (itemId: string, r: Partial<Retailer> & { id?: string }) => {
    const { data, error } = await supabase.rpc('admin_upsert_retailer', {
      p_id: r.id ?? null,
      p_item_id: itemId,
      p_store: r.store ?? '',
      p_price: r.price_zar ?? 0,
      p_url: r.url ?? '',
      p_password: password,
    });
    if (error || !data) push("Couldn't save — check the connection.", true);
    else {
      push('Saved.');
      await reloadRetailers();
    }
  };

  const deleteRetailer = async (id: string) => {
    const { data, error } = await supabase.rpc('admin_delete_retailer', {
      p_id: id,
      p_password: password,
    });
    if (error || data !== true) push("Couldn't delete that entry.", true);
    else {
      push('Removed.');
      await reloadRetailers();
    }
  };

  const removeClaim = async (claimId: string, who: string) => {
    const { data, error } = await supabase.rpc('admin_remove_claim', {
      p_claim_id: claimId,
      p_password: password,
    });
    if (error || data !== true) push("Couldn't remove that claim.", true);
    else push(`Removed ${who}'s claim.`);
  };

  const addItem = async (categoryId: string) => {
    const draft = newItemDrafts[categoryId];
    if (!draft?.name.trim()) return;
    const { data, error } = await supabase.rpc('admin_add_item', {
      p_category_id: categoryId,
      p_name: draft.name.trim(),
      p_max_claims: Math.max(Number(draft.max) || 1, 1),
      p_password: password,
    });
    if (error || !data) push("Couldn't add the item.", true);
    else {
      push(`Added "${draft.name.trim()}".`);
      setNewItemDrafts({ ...newItemDrafts, [categoryId]: { name: '', max: '1' } });
      await reloadItems();
    }
  };

  const setMaxClaims = async (itemId: string, max: number) => {
    const { data, error } = await supabase.rpc('admin_set_max_claims', {
      p_item_id: itemId,
      p_max_claims: max,
      p_password: password,
    });
    if (error || data !== true) push("Couldn't update the claim limit.", true);
    else {
      push('Claim limit updated.');
      await reloadItems();
    }
  };

  if (!unlocked) {
    return (
      <div className="admin">
        <TeddyBear className="teddy-small" />
        <h2>Registry Owner</h2>
        <div className="panel" style={{ maxWidth: 340, margin: '0 auto' }}>
          <input
            type="password"
            placeholder="Owner password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password && !checking) void unlock();
            }}
          />
          <button
            className="btn btn-claim"
            style={{ width: '100%', marginTop: 12, padding: 12 }}
            disabled={!password || checking}
            onClick={() => void unlock()}
          >
            {checking ? 'Checking…' : 'Open the registry'}
          </button>
        </div>
        <a className="back-link" href="#/">
          ← back to the registry
        </a>
        <Toasts toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="admin">
      <h2>Registry Owner</h2>

      <div className="panel">
        <strong>Claims</strong>
        {registry.claims.length === 0 && <p style={{ marginTop: 8 }}>No claims yet.</p>}
        {registry.claims.map((c) => {
          const item = items.find((i) => i.id === c.item_id);
          return (
            <div className="claim-row" key={c.id}>
              <span>
                <strong>{c.claimer_name}</strong>
                {c.qty > 1 && ` ×${c.qty}`} → {item?.name ?? 'unknown item'}
              </span>
              <button
                className="small-btn"
                style={{ padding: '6px 10px' }}
                onClick={() => void removeClaim(c.id, c.claimer_name)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <strong>Items, claim limits, retailers &amp; prices</strong>
        <p style={{ fontSize: '0.8rem', marginTop: 4, opacity: 0.75 }}>
          "Spots" = how many guests may claim that item. New items use the soft
          gift-box icon automatically.
        </p>
        {registry.categories.map((cat) => {
          const newDraft = newItemDrafts[cat.id] ?? { name: '', max: '1' };
          return (
            <div key={cat.id}>
              <p style={{ marginTop: 14, fontWeight: 700 }}>
                {cat.icon} {cat.name}
              </p>
              {items
                .filter((i) => i.category_id === cat.id)
                .map((item) => {
                  const draft = retailerDrafts[item.id] ?? {};
                  const claimCount = registry.claims
                    .filter((c) => c.item_id === item.id)
                    .reduce((sum, c) => sum + c.qty, 0);
                  return (
                    <div className="item-block" key={item.id}>
                      <div className="head">
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {item.name}
                          {claimCount > 0 && ` 🎁×${claimCount}`}
                        </span>
                        <MaxClaimsEditor
                          value={item.max_claims}
                          min={Math.max(claimCount, 1)}
                          onSave={(n) => void setMaxClaims(item.id, n)}
                        />
                      </div>
                      {(retailersByItem.get(item.id) ?? []).map((r) => (
                        <EditableRetailerRow
                          key={r.id}
                          retailer={r}
                          onSave={(upd) => void saveRetailer(item.id, { ...upd, id: r.id })}
                          onDelete={() => void deleteRetailer(r.id)}
                        />
                      ))}
                      <div className="ret-row">
                        <input
                          placeholder="Store"
                          value={draft.store ?? ''}
                          onChange={(e) =>
                            setRetailerDrafts({
                              ...retailerDrafts,
                              [item.id]: { ...draft, store: e.target.value },
                            })
                          }
                        />
                        <input
                          placeholder="R"
                          type="number"
                          value={draft.price_zar ?? ''}
                          onChange={(e) =>
                            setRetailerDrafts({
                              ...retailerDrafts,
                              [item.id]: { ...draft, price_zar: Number(e.target.value) },
                            })
                          }
                        />
                        <input
                          placeholder="URL"
                          value={draft.url ?? ''}
                          onChange={(e) =>
                            setRetailerDrafts({
                              ...retailerDrafts,
                              [item.id]: { ...draft, url: e.target.value },
                            })
                          }
                        />
                        <button
                          className="small-btn"
                          disabled={!draft.store}
                          onClick={() => {
                            void saveRetailer(item.id, draft);
                            setRetailerDrafts({ ...retailerDrafts, [item.id]: {} });
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              <div className="ret-row" style={{ gridTemplateColumns: '1fr 80px auto', marginTop: 10 }}>
                <input
                  placeholder={`New item in ${cat.name}…`}
                  value={newDraft.name}
                  onChange={(e) =>
                    setNewItemDrafts({ ...newItemDrafts, [cat.id]: { ...newDraft, name: e.target.value } })
                  }
                />
                <input
                  type="number"
                  min={1}
                  title="How many guests may claim it"
                  value={newDraft.max}
                  onChange={(e) =>
                    setNewItemDrafts({ ...newItemDrafts, [cat.id]: { ...newDraft, max: e.target.value } })
                  }
                />
                <button
                  className="small-btn"
                  style={{ padding: '8px 14px' }}
                  disabled={!newDraft.name.trim()}
                  onClick={() => void addItem(cat.id)}
                >
                  Add item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <a className="back-link" href="#/">
        ← back to the registry
      </a>
      <Toasts toasts={toasts} />
    </div>
  );
}

function MaxClaimsEditor({
  value,
  min,
  onSave,
}: {
  value: number;
  min: number;
  onSave: (n: number) => void;
}) {
  const [val, setVal] = useState(String(value));
  const n = Math.max(Number(val) || 1, 1);
  const dirty = n !== value;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
      spots
      <input
        type="number"
        min={min}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        style={{ width: 58 }}
      />
      {dirty && (
        <button className="small-btn" style={{ padding: '6px 10px' }} onClick={() => onSave(n)}>
          Save
        </button>
      )}
    </span>
  );
}

function EditableRetailerRow({
  retailer,
  onSave,
  onDelete,
}: {
  retailer: Retailer;
  onSave: (r: Partial<Retailer>) => void;
  onDelete: () => void;
}) {
  const [store, setStore] = useState(retailer.store);
  const [price, setPrice] = useState(String(retailer.price_zar));
  const [url, setUrl] = useState(retailer.url);
  const dirty =
    store !== retailer.store || Number(price) !== Number(retailer.price_zar) || url !== retailer.url;

  return (
    <div className="ret-row">
      <input value={store} onChange={(e) => setStore(e.target.value)} />
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input value={url} onChange={(e) => setUrl(e.target.value)} />
      {dirty ? (
        <button
          className="small-btn"
          onClick={() => onSave({ store, price_zar: Number(price), url })}
        >
          Save
        </button>
      ) : (
        <button className="small-btn" onClick={onDelete}>
          ✕
        </button>
      )}
    </div>
  );
}
