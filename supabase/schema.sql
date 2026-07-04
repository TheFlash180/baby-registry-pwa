-- Baby Registry schema. Run this once in the Supabase SQL Editor, then run seed.sql.
-- IMPORTANT: change the admin password on the marked line before running.

-- ---------------------------------------------------------------- tables

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '',
  sort_order int not null default 0
);

create table items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  icon_path text not null default '',
  sort_order int not null default 0,
  -- how many guests may claim this item (e.g. 3 people can each bring bottles)
  max_claims int not null default 1
);

create table retailers (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  store text not null,
  price_zar numeric not null,
  url text not null default ''
);

-- Claims are capacity-checked in claim_item while holding a lock on the item
-- row, so racing guests can never exceed an item's max_claims.
create table claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  claimer_name text not null,
  -- Only a SHA-256 hash of the guest's device token is stored. The raw token
  -- never leaves the guest's browser except inside claim/unclaim RPC calls,
  -- so a leaked row can't be used to remove someone else's claim.
  claim_token_hash text not null,
  claimed_at timestamptz not null default now()
);

-- Private settings (admin password). RLS enabled with NO policies = nobody
-- can read or write it through the API; only security-definer functions can.
create table registry_settings (
  key text primary key,
  value text not null
);

-- >>> CHANGE THIS PASSWORD before running <<<
insert into registry_settings (key, value) values ('admin_password', 'teddy2026');

-- ---------------------------------------------------------------- RLS

alter table categories enable row level security;
alter table items enable row level security;
alter table retailers enable row level security;
alter table claims enable row level security;
alter table registry_settings enable row level security;

create policy "public read" on categories for select using (true);
create policy "public read" on items for select using (true);
create policy "public read" on retailers for select using (true);
create policy "public read" on claims for select using (true);
-- No insert/update/delete policies anywhere: ALL writes go through the
-- security-definer functions below, which validate tokens/passwords.

-- ---------------------------------------------------------------- helpers

create or replace function _hash_token(p_token text)
returns text language sql immutable as
$$ select encode(sha256(convert_to(p_token, 'utf8')), 'hex') $$;

create or replace function _admin_ok(p_password text)
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from registry_settings
                  where key = 'admin_password' and value = p_password) $$;

-- ---------------------------------------------------------------- guest RPCs

-- Returns 'ok', 'taken' (item is fully claimed), 'already' (this device
-- already claimed this item), or 'invalid'.
create or replace function claim_item(p_item_id uuid, p_name text, p_token text)
returns text language plpgsql security definer set search_path = public as $$
declare v_max int;
begin
  if length(trim(p_name)) = 0 or length(p_token) < 8 then
    return 'invalid';
  end if;
  -- Lock the item row so concurrent claims on the same item queue up here.
  select max_claims into v_max from items where id = p_item_id for update;
  if v_max is null then
    return 'invalid';
  end if;
  if exists (select 1 from claims
             where item_id = p_item_id
               and claim_token_hash = _hash_token(p_token)) then
    return 'already';
  end if;
  if (select count(*) from claims where item_id = p_item_id) >= v_max then
    return 'taken';
  end if;
  insert into claims (item_id, claimer_name, claim_token_hash)
  values (p_item_id, trim(p_name), _hash_token(p_token));
  return 'ok';
end $$;

-- Guests can only remove a claim made from their own device (matching token).
create or replace function remove_claim(p_item_id uuid, p_token text)
returns boolean language plpgsql security definer set search_path = public as $$
declare deleted int;
begin
  delete from claims
   where item_id = p_item_id and claim_token_hash = _hash_token(p_token);
  get diagnostics deleted = row_count;
  return deleted > 0;
end $$;

-- ---------------------------------------------------------------- admin RPCs

create or replace function admin_check_password(p_password text)
returns boolean language sql stable security definer set search_path = public as
$$ select _admin_ok(p_password) $$;

-- Owner override: remove any claim (guest lost their token / cleared storage).
create or replace function admin_remove_claim(p_claim_id uuid, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
declare deleted int;
begin
  if not _admin_ok(p_password) then return false; end if;
  delete from claims where id = p_claim_id;
  get diagnostics deleted = row_count;
  return deleted > 0;
end $$;

-- Owner can add items (icon falls back to the soft gift box automatically).
create or replace function admin_add_item(
  p_category_id uuid, p_name text, p_max_claims int, p_password text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not _admin_ok(p_password) then return null; end if;
  if length(trim(p_name)) = 0 then return null; end if;
  insert into items (category_id, name, icon_path, sort_order, max_claims)
  values (
    p_category_id, trim(p_name), 'icons/gift-box.svg',
    coalesce((select max(sort_order) from items where category_id = p_category_id), 0) + 1,
    greatest(coalesce(p_max_claims, 1), 1))
  returning id into v_id;
  return v_id;
end $$;

-- Owner can change how many people may claim an item.
create or replace function admin_set_max_claims(
  p_item_id uuid, p_max_claims int, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not _admin_ok(p_password) then return false; end if;
  update items set max_claims = greatest(coalesce(p_max_claims, 1), 1)
  where id = p_item_id;
  return found;
end $$;

-- Add or update a retailer/price row. Pass p_id null to add.
create or replace function admin_upsert_retailer(
  p_id uuid, p_item_id uuid, p_store text, p_price numeric, p_url text, p_password text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not _admin_ok(p_password) then return null; end if;
  if p_id is null then
    insert into retailers (item_id, store, price_zar, url)
    values (p_item_id, p_store, p_price, p_url) returning id into v_id;
  else
    update retailers set store = p_store, price_zar = p_price, url = p_url
    where id = p_id returning id into v_id;
  end if;
  return v_id;
end $$;

create or replace function admin_delete_retailer(p_id uuid, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
declare deleted int;
begin
  if not _admin_ok(p_password) then return false; end if;
  delete from retailers where id = p_id;
  get diagnostics deleted = row_count;
  return deleted > 0;
end $$;

-- ---------------------------------------------------------------- grants

revoke all on all functions in schema public from public, anon;
grant execute on function claim_item(uuid, text, text) to anon;
grant execute on function remove_claim(uuid, text) to anon;
grant execute on function admin_check_password(text) to anon;
grant execute on function admin_remove_claim(uuid, text) to anon;
grant execute on function admin_add_item(uuid, text, int, text) to anon;
grant execute on function admin_set_max_claims(uuid, int, text) to anon;
grant execute on function admin_upsert_retailer(uuid, uuid, text, numeric, text, text) to anon;
grant execute on function admin_delete_retailer(uuid, text) to anon;

-- ---------------------------------------------------------------- realtime

-- Broadcast claim inserts/deletes to every connected guest.
alter publication supabase_realtime add table claims;
