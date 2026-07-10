-- Migration 004: partial un-claiming + claimer name refresh on top-up.
-- Run in the Supabase SQL Editor (idempotent).
--
-- 1. remove_claim gains an optional p_qty: a guest who claimed several spots
--    can give back just some of them. Omitted / null / >= their claim removes
--    the whole claim (the old behaviour, so cached clients keep working).
-- 2. claim_item now refreshes claimer_name when a device tops up its existing
--    claim — if the same phone claims again under a different name, the
--    newest name wins instead of being silently ignored.

create or replace function claim_item(
  p_item_id uuid, p_name text, p_token text, p_qty int default 1)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_max int;
  v_taken int;
  v_mine_id uuid;
  v_qty int;
begin
  if length(trim(p_name)) = 0 or length(p_token) < 8 then
    return 'invalid';
  end if;
  select max_claims into v_max from items where id = p_item_id for update;
  if v_max is null then
    return 'invalid';
  end if;
  v_qty := greatest(coalesce(p_qty, 1), 1);
  if v_max = 1 then
    v_qty := 1;
  end if;
  select coalesce(sum(qty), 0) into v_taken from claims where item_id = p_item_id;
  if v_taken + v_qty > v_max then
    return 'taken';
  end if;
  select id into v_mine_id from claims
   where item_id = p_item_id and claim_token_hash = _hash_token(p_token);
  if v_mine_id is not null then
    update claims set qty = qty + v_qty, claimer_name = trim(p_name)
     where id = v_mine_id;
  else
    insert into claims (item_id, claimer_name, claim_token_hash, qty)
    values (p_item_id, trim(p_name), _hash_token(p_token), v_qty);
  end if;
  return 'ok';
end $$;

-- Replace the 2-arg remove_claim with a 3-arg version (default keeps old
-- calls working). Dropping first avoids an ambiguous overload for PostgREST.
drop function if exists remove_claim(uuid, text);

create function remove_claim(p_item_id uuid, p_token text, p_qty int default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_mine_qty int;
begin
  select id, qty into v_id, v_mine_qty from claims
   where item_id = p_item_id and claim_token_hash = _hash_token(p_token)
   for update;
  if v_id is null then
    return false;
  end if;
  if p_qty is not null and p_qty >= 1 and p_qty < v_mine_qty then
    update claims set qty = qty - p_qty where id = v_id;
  else
    delete from claims where id = v_id;
  end if;
  return true;
end $$;

-- New functions default to EXECUTE for PUBLIC — lock down like the rest.
revoke all on function remove_claim(uuid, text, int) from public, anon;
grant execute on function remove_claim(uuid, text, int) to anon;
