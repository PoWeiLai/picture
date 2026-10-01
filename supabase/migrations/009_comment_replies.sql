-- 管理員回覆留言。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
alter table public.comments
  add column reply text check (char_length(reply) between 1 and 1000),
  add column replied_at timestamptz;

-- 會員新增留言時不能自己填回覆
drop policy "comments 登入者新增" on public.comments;
create policy "comments 登入者新增" on public.comments for insert to authenticated
  with check (user_id = auth.uid() and reply is null and replied_at is null);

-- 只有管理員能寫入或修改回覆
create policy "comments 管理員回覆" on public.comments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
