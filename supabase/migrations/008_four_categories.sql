-- 作品分成四類：國畫、熱蠟畫、水彩、油畫。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。
-- 刪除「素描」「其他」後，原本屬於這兩類的作品會變成未分類（不會被刪掉），可到後台重新指定。
delete from public.categories where name in ('素描', '其他');
insert into public.categories (name, sort_order)
select '熱蠟畫', 2 where not exists (select 1 from public.categories where name = '熱蠟畫');
update public.categories set sort_order = 1 where name = '國畫';
update public.categories set sort_order = 2 where name = '熱蠟畫';
update public.categories set sort_order = 3 where name = '水彩';
update public.categories set sort_order = 4 where name = '油畫';
