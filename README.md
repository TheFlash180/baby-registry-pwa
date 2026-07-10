# Baby Registry 🧸

A soft, warm baby-shower gift registry, built as an installable PWA. Guests
browse gift categories, see where each item can be bought in South Africa and
for how much, and claim items by entering their name. Claims sync live to every
guest's device via Supabase Realtime — no accounts, no doubles.

Live at: `https://<username>.github.io/baby-registry-pwa/`

## How it works

- **Claiming**: tap "I'll get this" → enter your name → done. Every other
  connected guest sees the item claimed within seconds.
- **Un-claiming**: your browser keeps a private random token; only the device
  that made a claim (or the registry owner) can remove it. A guest who claimed
  several spots can give back just some of them instead of all-or-nothing.
- **Multiple claims per item**: each item has a claim capacity (e.g. 3 guests
  can each bring baby bottles); the card shows how many spots are left. Set
  per-item capacities in `/admin`.
- **Race-safety**: capacity is checked in Postgres while holding a lock on the
  item row — racing guests past the limit get a friendly "someone just claimed
  the last one" popup, never an overbooked item.
- **Prices**: curated per item for SA retailers (Takealot, Baby City,
  Woolworths, Checkers, Pick n Pay Baby) and editable by the owner in-app. No
  live scraping — retailer sites change constantly and scraping breaks and/or
  violates their terms; the links open the retailer's live page for the
  up-to-the-minute price.
- **Offline**: the catalog (shell, data, icons) is cached, so guests can browse
  offline; claiming needs a connection and says so gently.

## One-time setup

### 1. Supabase

1. Use an existing Supabase project or create one (free tier).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql) —
   **first change the admin password** on the marked line near the top.
3. Then run [`supabase/seed.sql`](supabase/seed.sql) to load the catalog
   (10 categories, 60 items, curated prices).

To change the admin password later:

```sql
update registry_settings set value = 'new-password' where key = 'admin_password';
```

> Why no `ADMIN_PASSWORD` env var? This is a static site — every `VITE_` env
> var is baked into the public JS bundle. The password lives in the
> `registry_settings` table (unreadable through the API) and every admin action
> is verified inside Postgres via security-definer functions.

### 2. GitHub

```powershell
git init -b main
git add .
git commit -m "Baby registry"
gh repo create baby-registry-pwa --public --source . --push
```

Then: repo → Settings → Pages → Source: **GitHub Actions**, and add two
Actions secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | your project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon public key |

Every push to `main` builds and deploys automatically.

## Local development

```powershell
npm install
copy .env.example .env.local   # fill in your Supabase URL + anon key
npm run dev                    # http://localhost:5173/baby-registry-pwa/
npm run build                  # exactly what CI runs
```

## Owner admin

Open `/#/admin` (link: `https://<username>.github.io/baby-registry-pwa/#/admin`),
enter the owner password, and you can:

- edit every item's retailers, prices and links (changes are live immediately —
  no redeploy needed, it's all data in Supabase);
- add new items to any category and set how many guests may claim each item;
- remove any claim (for when a guest cleared their browser storage and can't
  un-claim their own pick).

Existing databases created before multi-claim support: run
[`supabase/migrate-001-multi-claims.sql`](supabase/migrate-001-multi-claims.sql)
once in the SQL Editor.

## Item icons

All 61 item icons are generated, palette-matched SVGs in `public/icons/`,
created by `npm run gen:icons` (see `tooling/gen-icons.mjs`). To restyle or add
an icon, edit that file and re-run. Missing icons automatically fall back to a
soft gift-box icon. PWA app icons come from `npm run gen:pwa-icons`.

## Structure

```
src/                 React app (main list, claim/unclaim modals, admin)
src/theme.css        The whole visual language — palette, script/serif/sans type
supabase/schema.sql  Tables, RLS, claim/unclaim/admin functions, realtime
supabase/seed.sql    Catalog: categories, items, retailer prices (ZAR)
tooling/             Icon generators
.github/workflows/   Build + deploy to GitHub Pages on push
```
