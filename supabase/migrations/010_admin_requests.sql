-- 會員申請成為管理員、管理員核准或拒絕。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
create table public.admin_requests (
  user_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

-- 本人可以送出、查看、取消自己的申請；管理員可以查看全部並拒絕（刪除）
alter table public.admin_requests enable row level security;
create policy "admin_requests 本人或管理員讀取" on public.admin_requests for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "admin_requests 會員申請" on public.admin_requests for insert to authenticated
  with check (user_id = auth.uid() and not public.is_admin());
create policy "admin_requests 本人取消或管理員拒絕" on public.admin_requests for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 會員列表多回傳申請時間與申請說明（回傳欄位改變，需要先刪掉舊函式）
drop function public.admin_list_members();
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

-- 設定或取消管理員時，一併清掉這位會員的申請
create or replace function public.set_admin(target uuid, value boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  if target = auth.uid() and not value then
    raise exception '不能取消自己的管理員身分';
  end if;
  update public.profiles set is_admin = value where id = target;
  delete from public.admin_requests where user_id = target;
end;
$$;
