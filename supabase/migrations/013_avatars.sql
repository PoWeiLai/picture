-- 會員與管理員的個人頭像。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
alter table public.profiles
  add column avatar_path text check (char_length(avatar_path) <= 300);

-- 本人可以改自己的顯示名稱與頭像（其他欄位，例如 is_admin，仍然不能改）
grant update (display_name, avatar_path) on public.profiles to authenticated;

-- 頭像存放空間：公開讀取；每個人只能在以自己 id 命名的資料夾裡上傳、替換、刪除
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "avatars 本人上傳" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars 本人修改" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars 本人刪除" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
