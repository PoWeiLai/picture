-- 會員自行註銷帳號。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。

-- 刪除自己的登入帳號；個人資料、留言、管理員申請會跟著一併刪除。
-- 頭像檔案由網站在呼叫前先從 Storage 移除。最後一位管理員不能註銷，避免沒人能管理網站。
create function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception '請先登入';
  end if;
  if public.is_admin() and (select count(*) from public.profiles where is_admin) <= 1 then
    raise exception '你是唯一的管理員，不能註銷帳號';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
