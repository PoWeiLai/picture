-- 管理員申請：任何一位管理員同意即生效。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
-- （如果之前執行過「需要兩位同意」的版本，這份也會把它改回來）
drop function if exists public.approve_admin(uuid);
drop table if exists public.admin_approvals;

-- 同意某位會員的管理員申請：升為管理員並清掉申請
create function public.approve_admin(target uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  if not exists (select 1 from public.admin_requests where user_id = target) then
    raise exception '找不到這位會員的申請';
  end if;
  update public.profiles set is_admin = true where id = target;
  delete from public.admin_requests where user_id = target;
end;
$$;
revoke execute on function public.approve_admin(uuid) from public, anon;
grant execute on function public.approve_admin(uuid) to authenticated;

-- set_admin 只能用來取消管理員；新增管理員一律走申請與同意流程
create or replace function public.set_admin(target uuid, value boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  if value then
    raise exception '新增管理員需要對方先申請，並由管理員同意';
  end if;
  if target = auth.uid() then
    raise exception '不能取消自己的管理員身分';
  end if;
  update public.profiles set is_admin = false where id = target;
end;
$$;

-- 會員列表改回不含同意紀錄的版本（同 010）
drop function if exists public.admin_list_members();
create function public.admin_list_members()
returns table (id uuid, email text, display_name text, is_admin boolean, created_at timestamptz, comment_count bigint,
               requested_at timestamptz, request_note text)
language plpgsql
stable
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  return query
    select p.id, u.email::text, p.display_name, p.is_admin, p.created_at,
           (select count(*) from public.comments c where c.user_id = p.id),
           r.created_at, r.note
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.admin_requests r on r.user_id = p.id
    order by r.created_at desc nulls last, p.created_at desc;
end;
$$;
revoke execute on function public.admin_list_members() from public, anon;
grant execute on function public.admin_list_members() to authenticated;
