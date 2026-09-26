-- 「畫室日常」照片。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
create table public.studio_photos (
  id bigint generated always as identity primary key,
  image_path text not null,
  caption text not null default '' check (char_length(caption) <= 200),
  taken_on date,
  created_at timestamptz not null default now()
);

alter table public.studio_photos enable row level security;
create policy "studio_photos 公開讀取" on public.studio_photos for select using (true);
create policy "studio_photos 管理員寫入" on public.studio_photos for all
  using (public.is_admin()) with check (public.is_admin());
