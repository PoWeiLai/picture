-- 畫作網站資料庫結構
-- 在 Supabase 後台 → SQL Editor 貼上整份執行一次即可。

-- ========== 使用者資料 ==========
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 註冊時自動建立 profile
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 判斷目前使用者是否為管理員
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ========== 風格分類 ==========
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 1 and 30),
  sort_order int not null default 0
);

-- ========== 作品（畫作圖片或影片） ==========
-- image_path：上傳的圖片（影片作品則當作封面，可省略）
-- video_url：影片網址（YouTube / Vimeo / .mp4 直連）
create table public.paintings (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 1 and 100),
  description text not null default '',
  category_id bigint references public.categories (id) on delete set null,
  image_path text,
  video_url text check (video_url ~ '^https://'),
  year int check (year between 1900 and 2100),
  medium text not null default '',
  dimensions text not null default '',
  created_at timestamptz not null default now(),
  constraint paintings_has_media check (image_path is not null or video_url is not null)
);

-- ========== 評論 ==========
create table public.comments (
  id bigint generated always as identity primary key,
  painting_id bigint not null references public.paintings (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_painting_id_idx on public.comments (painting_id, created_at);
create index paintings_category_id_idx on public.paintings (category_id);

-- ========== 權限 (Row Level Security) ==========
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.paintings enable row level security;
alter table public.comments enable row level security;

-- profiles：大家都能看名字；本人只能改自己的 display_name（不能把自己改成管理員）
create policy "profiles 公開讀取" on public.profiles for select using (true);
create policy "profiles 本人更新" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

-- categories / paintings：公開讀取，只有管理員能新增修改刪除
create policy "categories 公開讀取" on public.categories for select using (true);
create policy "categories 管理員寫入" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "paintings 公開讀取" on public.paintings for select using (true);
create policy "paintings 管理員寫入" on public.paintings for all
  using (public.is_admin()) with check (public.is_admin());

-- comments：公開讀取；登入者以自己身分發言；本人或管理員可刪除
create policy "comments 公開讀取" on public.comments for select using (true);
create policy "comments 登入者新增" on public.comments for insert to authenticated
  with check (user_id = auth.uid());
create policy "comments 本人或管理員刪除" on public.comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ========== 畫室日常照片 ==========
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

-- ========== 後台：網站內容與會員管理 ==========

-- 網站內容（首頁封面、畫家頁等），value 為 JSON；前台讀不到時使用程式內建的預設值
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "site_settings 公開讀取" on public.site_settings for select using (true);
create policy "site_settings 管理員寫入" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- 會員列表（含 Email），只有管理員能呼叫
create function public.admin_list_members()
returns table (id uuid, email text, display_name text, is_admin boolean, created_at timestamptz, comment_count bigint)
language plpgsql
stable
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  return query
    select p.id, u.email::text, p.display_name, p.is_admin, p.created_at,
           (select count(*) from public.comments c where c.user_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

-- 設定或取消管理員；不能取消自己的管理員身分，避免沒人能管理網站
create function public.set_admin(target uuid, value boolean)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  if target = auth.uid() and not value then
    raise exception '不能取消自己的管理員身分';
  end if;
  update public.profiles set is_admin = value where id = target;
end;
$$;

revoke execute on function public.admin_list_members() from public, anon;
revoke execute on function public.set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_list_members() to authenticated;
grant execute on function public.set_admin(uuid, boolean) to authenticated;

-- ========== 圖片儲存 ==========
insert into storage.buckets (id, name, public) values ('paintings', 'paintings', true);

create policy "paintings 圖片管理員上傳" on storage.objects for insert to authenticated
  with check (bucket_id = 'paintings' and public.is_admin());
create policy "paintings 圖片管理員修改" on storage.objects for update to authenticated
  using (bucket_id = 'paintings' and public.is_admin());
create policy "paintings 圖片管理員刪除" on storage.objects for delete to authenticated
  using (bucket_id = 'paintings' and public.is_admin());

-- ========== 預設分類（可自行修改） ==========
insert into public.categories (name, sort_order) values
  ('水彩', 1), ('油畫', 2), ('素描', 3), ('國畫', 4), ('其他', 99);

-- ========== 設定媽媽為管理員 ==========
-- 媽媽先在網站上註冊帳號後，把下面的 email 換成她的，再單獨執行這一行：
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = 'mom@example.com');
