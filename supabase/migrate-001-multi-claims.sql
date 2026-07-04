-- Migration 001: multiple claims per item.
-- Run this once in the Supabase SQL Editor (your database already has data,
-- so run THIS — not schema.sql, which is for fresh installs).

-- Each item now has a claim capacity. 1 = classic single claim.
alter table items add column max_claims int not null default 1;

-- The one-claim-per-item unique constraint is replaced by a capacity check
-- inside claim_item (still race-safe: the item row is locked while checking).
alter table claims drop constraint claims_item_id_key;

-- Sensible starting capacities for multi-quantity items (edit any of these
-- in /admin afterwards):
update items set max_claims = 3 where name in (
  'Fitted crib sheets (3–4)', 'Baby bottles', 'Burp cloths', 'Bibs',
  'Bodysuits / onesies (0–3m)', 'Sleepers / pajamas (0–3m)');
update items set max_claims = 2 where name in (
  'Washcloths', 'Socks & mittens', 'Hats');

-- claim_item: capacity-aware. Returns 'ok', 'taken' (full), 'already'
-- (this device already claimed this item), or 'invalid'.
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

-- Owner claim removal now targets a specific claim (items can have several).
drop function if exists admin_remove_claim(uuid, text);
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

grant execute on function claim_item(uuid, text, text) to anon;
grant execute on function admin_remove_claim(uuid, text) to anon;
grant execute on function admin_add_item(uuid, text, int, text) to anon;
grant execute on function admin_set_max_claims(uuid, int, text) to anon;
