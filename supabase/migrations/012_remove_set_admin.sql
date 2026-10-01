-- 拿掉「取消管理員」功能：管理員身分一旦核准就不會被其他管理員取消。
-- 第一次設定時 schema.sql 已不包含 set_admin，只有舊資料庫才需要執行。
drop function if exists public.set_admin(uuid, boolean);
