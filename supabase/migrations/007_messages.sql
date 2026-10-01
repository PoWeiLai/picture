-- 「歡迎私訊我」的訪客私訊。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
create table public.messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 50),
  email text not null check (char_length(email) between 3 and 200),
  body text not null check (char_length(body) between 1 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 任何訪客（不用登入）都能送出；只有管理員能讀取、標記已讀與刪除
alter table public.messages enable row level security;
create policy "messages 訪客送出" on public.messages for insert to anon, authenticated
  with check (is_read = false);
create policy "messages 管理員讀取" on public.messages for select using (public.is_admin());
create policy "messages 管理員修改" on public.messages for update using (public.is_admin()) with check (public.is_admin());
create policy "messages 管理員刪除" on public.messages for delete using (public.is_admin());
