-- Migration 003: owner can delete items; claim-limit can't go below what's
-- already claimed. Run AFTER migrate-002-claim-qty.sql.

-- Deleting an item takes its retailers and claims with it (FK cascade).
create or replace function admin_delete_item(p_item_id uuid, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not _admin_ok(p_password) then return false; end if;
  delete from items where id = p_item_id;
  return found;
end $$;

-- Never let max_claims drop below the spots already claimed.
create or replace function admin_set_max_claims(
  p_item_id uuid, p_max_claims int, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not _admin_ok(p_password) then return false; end if;
  update items set max_claims = greatest(
    coalesce(p_max_claims, 1), 1,
    coalesce((select sum(qty) from claims where item_id = p_item_id), 0))
  where id = p_item_id;
  return found;
end $$;

grant execute on function admin_delete_item(uuid, text) to anon;
