import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { useRegistry } from '../lib/useRegistry';
import type { Retailer } from '../lib/types';
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
  const [drafts, setDrafts] = useState<Record<string, Partial<Retailer>>>({});
  const [refresh, setRefresh] = useState(0);
  const [localRetailers, setLocalRetailers] = useState<Retailer[] | null>(null);

  const retailers = localRetailers ?? registry.retailers;

  const retailersByItem = useMemo(() => {
    const m = new Map<string, Retailer[]>();
    for (const r of retailers) {
      const list = m.get(r.item_id) ?? [];
      list.push(r);
      m.set(r.item_id, list);
    }
    return m;
  }, [retailers]);

  const claimsByItem = useMemo(
    () => new Map(registry.claims.map((c) => [c.item_id, c])),
    [registry.claims],
  );

  const reloadRetailers = async () => {
    const { data } = await supabase.from('retailers').select('*');
    if (data) setLocalRetailers(data as Retailer[]);
    setRefresh((n) => n + 1);
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

  const removeClaim = async (itemId: string, who: string) => {
    const { data, error } = await supabase.rpc('admin_remove_claim', {
      p_item_id: itemId,
      p_password: password,
    });
    if (error || data !== true) push("Couldn't remove that claim.", true);
    else push(`Removed ${who}'s claim.`);
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
    <div className="admin" key={refresh}>
      <h2>Registry Owner</h2>

      <div className="panel">
        <strong>Claims</strong>
        {registry.claims.length === 0 && <p style={{ marginTop: 8 }}>No claims yet.</p>}
        {registry.claims.map((c) => {
          const item = registry.items.find((i) => i.id === c.item_id);
          return (
            <div className="claim-row" key={c.id}>
              <span>
                <strong>{c.claimer_name}</strong> → {item?.name ?? 'unknown item'}
              </span>
              <button
                className="small-btn"
                style={{ padding: '6px 10px' }}
                onClick={() => void removeClaim(c.item_id, c.claimer_name)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="panel">
        <strong>Items, retailers &amp; prices</strong>
        {registry.categories.map((cat) => (
          <div key={cat.id}>
            <p style={{ marginTop: 14, fontWeight: 700 }}>
              {cat.icon} {cat.name}
            </p>
            {registry.items
              .filter((i) => i.category_id === cat.id)
              .map((item) => {
                const draft = drafts[item.id] ?? {};
                return (
                  <div className="item-block" key={item.id}>
                    <div className="head">
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {item.name}
                        {claimsByItem.has(item.id) && ' 🎁'}
                      </span>
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
                          setDrafts({ ...drafts, [item.id]: { ...draft, store: e.target.value } })
                        }
                      />
                      <input
                        placeholder="R"
                        type="number"
                        value={draft.price_zar ?? ''}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [item.id]: { ...draft, price_zar: Number(e.target.value) },
                          })
                        }
                      />
                      <input
                        placeholder="URL"
                        value={draft.url ?? ''}
                        onChange={(e) =>
                          setDrafts({ ...drafts, [item.id]: { ...draft, url: e.target.value } })
                        }
                      />
                      <button
                        className="small-btn"
                        disabled={!draft.store}
                        onClick={() => {
                          void saveRetailer(item.id, draft);
                          setDrafts({ ...drafts, [item.id]: {} });
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      <a className="back-link" href="#/">
        ← back to the registry
      </a>
      <Toasts toasts={toasts} />
    </div>
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
