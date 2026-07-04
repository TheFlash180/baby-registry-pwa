import { useEffect, useMemo, useState } from 'react';
import { useRegistry } from './lib/useRegistry';
import type { Claim, Filter, Item } from './lib/types';
import { Header } from './components/Header';
import { GrowthMeter } from './components/GrowthMeter';
import { Filters } from './components/Filters';
import { ItemCard } from './components/ItemCard';
import {
  ClaimModal,
  ClaimedInfoModal,
  InfoModal,
  ThankYouModal,
} from './components/Modals';
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
  const [info, setInfo] = useState<{ title: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const claimsByItem = useMemo(() => {
    const m = new Map<string, Claim[]>();
    for (const c of registry.claims) {
      const list = m.get(c.item_id) ?? [];
      list.push(c);
      m.set(c.item_id, list);
    }
    return m;
  }, [registry.claims]);

  const retailersByItem = useMemo(() => {
    const m = new Map<string, typeof registry.retailers>();
    for (const r of registry.retailers) {
      const list = m.get(r.item_id) ?? [];
      list.push(r);
      m.set(r.item_id, list);
    }
    return m;
  }, [registry.retailers]);

  // Growth meter counts gift "spots": an item 3 people can claim adds 3.
  const totalSpots = useMemo(
    () => registry.items.reduce((sum, i) => sum + i.max_claims, 0),
    [registry.items],
  );

  if (route.startsWith('#/admin')) {
    return <AdminPage registry={registry} push={push} toasts={toasts} />;
  }

  const visibleItems = (catId: string) =>
    registry.items.filter((i) => {
      if (i.category_id !== catId) return false;
      const count = claimsByItem.get(i.id)?.length ?? 0;
      const full = count >= i.max_claims;
      // "Still needed" = has open spots; "Claimed" = has at least one claim.
      if (filter === 'needed') return !full;
      if (filter === 'claimed') return count > 0;
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
      setInfo({
        title: 'Oh — just missed it!',
        message:
          'Someone just claimed the last one of these — pick another item, there is plenty of love to go around!',
      });
    } else if (result === 'already') {
      setInfo({
        title: 'You already have this one',
        message:
          'This item is already on your list from this device. Tap its claimed name if you want to change it.',
      });
    } else if (result === 'offline') {
      setInfo({
        title: "You're offline",
        message: 'Reconnect to the internet to claim this gift — the list will be waiting.',
      });
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

  const viewingClaims = viewing ? (claimsByItem.get(viewing.id) ?? []) : [];

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
          <GrowthMeter claimed={registry.claims.length} total={totalSpots} />
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
                    claims={claimsByItem.get(item.id) ?? []}
                    online={online}
                    onClaim={() => setClaiming(item)}
                    onShowClaims={() => setViewing(item)}
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
          spotsLeft={claiming.max_claims - (claimsByItem.get(claiming.id)?.length ?? 0)}
          busy={busy}
          onConfirm={handleConfirmClaim}
          onClose={() => setClaiming(null)}
        />
      )}
      {viewing && viewingClaims.length > 0 && (
        <ClaimedInfoModal
          item={viewing}
          claims={viewingClaims}
          myTokenHash={registry.myTokenHash}
          busy={busy}
          onUnclaim={handleUnclaim}
          onClose={() => setViewing(null)}
        />
      )}
      {thanking && <ThankYouModal name={thanking} onClose={() => setThanking('')} />}
      {info && <InfoModal title={info.title} message={info.message} onClose={() => setInfo(null)} />}

      <Toasts toasts={toasts} />
    </>
  );
}
