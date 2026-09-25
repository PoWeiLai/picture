-- 只有在「已經執行過舊版 schema.sql」時才需要執行。
alter table public.paintings add column year int check (year between 1900 and 2100);
alter table public.paintings add column medium text not null default '';
alter table public.paintings add column dimensions text not null default '';
