-- 後台管理：網站內容設定、會員管理。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。

-- 網站內容（首頁封面、畫家頁等），value 為 JSON；前台讀不到時使用程式內建的預設值
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "site_settings 公開讀取" on public.site_settings for select using (true);
create policy "site_settings 管理員寫入" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- 會員列表（含 Email），只有管理員能呼叫
create function public.admin_list_members()
returns table (id uuid, email text, display_name text, is_admin boolean, created_at timestamptz, comment_count bigint)
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
           (select count(*) from public.comments c where c.user_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

-- 設定或取消管理員；不能取消自己的管理員身分，避免沒人能管理網站
create function public.set_admin(target uuid, value boolean)
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
end;
$$;

revoke execute on function public.admin_list_members() from public, anon;
revoke execute on function public.set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_list_members() to authenticated;
grant execute on function public.set_admin(uuid, boolean) to authenticated;
