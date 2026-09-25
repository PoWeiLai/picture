-- 只有在「已經執行過舊版 schema.sql」時才需要執行這個檔案。
-- 第一次設定的話，直接執行最新的 schema.sql 即可（已包含這些變更）。

alter table public.paintings alter column image_path drop not null;
alter table public.paintings add column video_url text check (video_url ~ '^https://');
alter table public.paintings add constraint paintings_has_media
  check (image_path is not null or video_url is not null);
