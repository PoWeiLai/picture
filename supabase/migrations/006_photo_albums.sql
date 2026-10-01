-- 照片分成兩本相簿：daily = 生活點滴、setup = 布展活動。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
alter table public.studio_photos
  add column album text not null default 'daily' check (album in ('daily', 'setup'));
