-- Migration 002: one device can claim multiple spots of a multi-claim item.
-- Run AFTER migrate-001-multi-claims.sql in the Supabase SQL Editor.

alter table claims add column qty int not null default 1 check (qty >= 1);

-- claim_item gains a quantity. Capacity is now the SUM of quantities, still
-- checked while the item row is locked so races can't overbook. If the same
-- device claims again, its existing claim is topped up rather than duplicated.
-- Single-claim items (max_claims = 1) always force qty to 1.
drop function if exists claim_item(uuid, text, text);
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
    v_qty := 1;  -- quantity claiming only where multiple claims are allowed
  end if;
  select coalesce(sum(qty), 0) into v_taken from claims where item_id = p_item_id;
  if v_taken + v_qty > v_max then
    return 'taken';
  end if;
  select id into v_mine_id from claims
   where item_id = p_item_id and claim_token_hash = _hash_token(p_token);
  if v_mine_id is not null then
    update claims set qty = qty + v_qty where id = v_mine_id;
  else
    insert into claims (item_id, claimer_name, claim_token_hash, qty)
    values (p_item_id, trim(p_name), _hash_token(p_token), v_qty);
  end if;
  return 'ok';
end $$;

grant execute on function claim_item(uuid, text, text, int) to anon;
