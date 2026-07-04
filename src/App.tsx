import { useEffect, useMemo, useState } from 'react';
import { useRegistry } from './lib/useRegistry';
import type { Filter, Item } from './lib/types';
import { Header } from './components/Header';
import { GrowthMeter } from './components/GrowthMeter';
import { Filters } from './components/Filters';
import { ItemCard } from './components/ItemCard';
import { ClaimModal, ClaimedInfoModal, ThankYouModal } from './components/Modals';
import { Toasts, useToasts } from './components/Toast';
import { TeddyBear, HeartDivider } from './components/Motifs';
import { AdminPage } from './admin/AdminPage';

function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

export default function App() {
  const route = useHashRoute();
  const online = useOnline();
  const registry = useRegistry();
  const { toasts, push } = useToasts();

  const [filter, setFilter] = useState<Filter>('all');
  const [claiming, setClaiming] = useState<Item | null>(null);
  const [viewing, setViewing] = useState<Item | null>(null);
  const [thanking, setThanking] = useState('');
  const [busy, setBusy] = useState(false);

  const claimsByItem = useMemo(
    () => new Map(registry.claims.map((c) => [c.item_id, c])),
    [registry.claims],
  );
  const retailersByItem = useMemo(() => {
    const m = new Map<string, typeof registry.retailers>();
    for (const r of registry.retailers) {
      const list = m.get(r.item_id) ?? [];
      list.push(r);
      m.set(r.item_id, list);
    }
    return m;
  }, [registry.retailers]);

  if (route.startsWith('#/admin')) {
    return <AdminPage registry={registry} push={push} toasts={toasts} />;
  }

  const visibleItems = (catId: string) =>
    registry.items.filter((i) => {
      if (i.category_id !== catId) return false;
      const claimed = claimsByItem.has(i.id);
      if (filter === 'needed') return !claimed;
      if (filter === 'claimed') return claimed;
      return true;
    });

  const handleConfirmClaim = async (name: string) => {
    if (!claiming) return;
    setBusy(true);
    const result = await registry.claimItem(claiming.id, name);
    setBusy(false);
    setClaiming(null);
    if (result === 'ok') {
      setThanking(name);
    } else if (result === 'taken') {
      push('Someone just claimed this — pick another item!', true);
    } else if (result === 'offline') {
      push("You're offline — reconnect to claim this.", true);
    } else {
      push("That didn't save — please try again in a moment.", true);
    }
  };

  const handleUnclaim = async () => {
    if (!viewing) return;
    setBusy(true);
    const ok = await registry.unclaimItem(viewing.id);
    setBusy(false);
    setViewing(null);
    if (ok) push('Your claim was removed — thank you for updating!');
    else push("We couldn't remove that claim — check your connection.", true);
  };

  const viewingClaim = viewing ? claimsByItem.get(viewing.id) : undefined;

  return (
    <>
      <Header />

      {!online && (
        <div className="offline-banner">
          🌙 You&rsquo;re offline — you can browse, but reconnect to claim a gift.
        </div>
      )}

      {registry.loadError && (
        <div className="offline-banner">
          The list is having a little nap and won&rsquo;t load — please try
          again in a moment.
        </div>
      )}

      {registry.loading ? (
        <div className="empty-state">
          <TeddyBear className="teddy-small" />
          <p>Fetching the little list…</p>
        </div>
      ) : (
        <>
          <GrowthMeter claimed={registry.claims.length} total={registry.items.length} />
          <Filters value={filter} onChange={setFilter} />

          {registry.categories.map((cat) => {
            const catItems = visibleItems(cat.id);
            if (catItems.length === 0) return null;
            return (
              <section className="category" key={cat.id}>
                <div className="category-title">
                  <span className="eyebrow">{cat.icon}</span>{' '}
                  <div className="name">{cat.name}</div>
                </div>
                <HeartDivider />
                {catItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    retailers={retailersByItem.get(item.id) ?? []}
                    claim={claimsByItem.get(item.id)}
                    online={online}
                    onClaim={() => setClaiming(item)}
                    onShowClaim={() => setViewing(item)}
                  />
                ))}
              </section>
            );
          })}

          {filter === 'claimed' && registry.claims.length === 0 && (
            <div className="empty-state">
              <TeddyBear className="teddy-small" />
              <p>Nothing claimed yet — be the first!</p>
            </div>
          )}
        </>
      )}

      {claiming && (
        <ClaimModal
          item={claiming}
          busy={busy}
          onConfirm={handleConfirmClaim}
          onClose={() => setClaiming(null)}
        />
      )}
      {viewing && viewingClaim && (
        <ClaimedInfoModal
          item={viewing}
          claim={viewingClaim}
          isMine={viewingClaim.claim_token_hash === registry.myTokenHash}
          busy={busy}
          onUnclaim={handleUnclaim}
          onClose={() => setViewing(null)}
        />
      )}
      {thanking && <ThankYouModal name={thanking} onClose={() => setThanking('')} />}

      <Toasts toasts={toasts} />
    </>
  );
}
