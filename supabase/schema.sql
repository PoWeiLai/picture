-- 畫作網站資料庫結構
-- 在 Supabase 後台 → SQL Editor 貼上整份執行一次即可。

-- ========== 使用者資料 ==========
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  is_admin boolean not null default false,
  avatar_path text check (char_length(avatar_path) <= 300),
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
  reply text check (char_length(reply) between 1 and 1000),
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index comments_painting_id_idx on public.comments (painting_id, created_at);
create index paintings_category_id_idx on public.paintings (category_id);

-- ========== 權限 (Row Level Security) ==========
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.paintings enable row level security;
alter table public.comments enable row level security;

-- profiles：大家都能看名字與頭像；本人只能改自己的 display_name 與 avatar_path（不能把自己改成管理員）
create policy "profiles 公開讀取" on public.profiles for select using (true);
create policy "profiles 本人更新" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant update (display_name, avatar_path) on public.profiles to authenticated;

-- categories / paintings：公開讀取，只有管理員能新增修改刪除
create policy "categories 公開讀取" on public.categories for select using (true);
create policy "categories 管理員寫入" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "paintings 公開讀取" on public.paintings for select using (true);
create policy "paintings 管理員寫入" on public.paintings for all
  using (public.is_admin()) with check (public.is_admin());

-- comments：公開讀取；登入者以自己身分發言（不能自己填回覆）；只有管理員能回覆；本人或管理員可刪除
create policy "comments 公開讀取" on public.comments for select using (true);
create policy "comments 登入者新增" on public.comments for insert to authenticated
  with check (user_id = auth.uid() and reply is null and replied_at is null);
create policy "comments 管理員回覆" on public.comments for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "comments 本人或管理員刪除" on public.comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ========== 照片（生活點滴 daily／布展活動 setup） ==========
create table public.studio_photos (
  id bigint generated always as identity primary key,
  image_path text not null,
  caption text not null default '' check (char_length(caption) <= 200),
  taken_on date,
  album text not null default 'daily' check (album in ('daily', 'setup')),
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

-- 會員申請成為管理員，由管理員核准或拒絕
create table public.admin_requests (
  user_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

-- 本人可以送出、查看、取消自己的申請；管理員可以查看全部並拒絕（刪除）
alter table public.admin_requests enable row level security;
create policy "admin_requests 本人或管理員讀取" on public.admin_requests for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "admin_requests 會員申請" on public.admin_requests for insert to authenticated
  with check (user_id = auth.uid() and not public.is_admin());
create policy "admin_requests 本人取消或管理員拒絕" on public.admin_requests for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 同意某位會員的管理員申請：升為管理員並清掉申請
create function public.approve_admin(target uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception '需要管理員權限';
  end if;
  if not exists (select 1 from public.admin_requests where user_id = target) then
    raise exception '找不到這位會員的申請';
  end if;
  update public.profiles set is_admin = true where id = target;
  delete from public.admin_requests where user_id = target;
end;
$$;
revoke execute on function public.approve_admin(uuid) from public, anon;
grant execute on function public.approve_admin(uuid) to authenticated;

-- 會員列表（含 Email 與管理員申請），只有管理員能呼叫
create function public.admin_list_members()
returns table (id uuid, email text, display_name text, is_admin boolean, created_at timestamptz, comment_count bigint,
               requested_at timestamptz, request_note text)
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
           (select count(*) from public.comments c where c.user_id = p.id),
           r.created_at, r.note
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.admin_requests r on r.user_id = p.id
    order by r.created_at desc nulls last, p.created_at desc;
end;
$$;
revoke execute on function public.admin_list_members() from public, anon;
grant execute on function public.admin_list_members() to authenticated;

-- 會員自行註銷帳號：個人資料、留言、管理員申請會跟著一併刪除（頭像檔案由網站先移除）
-- 最後一位管理員不能註銷，避免沒人能管理網站
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

-- ========== 圖片儲存 ==========
insert into storage.buckets (id, name, public) values ('paintings', 'paintings', true);

create policy "paintings 圖片管理員上傳" on storage.objects for insert to authenticated
  with check (bucket_id = 'paintings' and public.is_admin());
create policy "paintings 圖片管理員修改" on storage.objects for update to authenticated
  using (bucket_id = 'paintings' and public.is_admin());
create policy "paintings 圖片管理員刪除" on storage.objects for delete to authenticated
  using (bucket_id = 'paintings' and public.is_admin());

-- ========== 個人頭像 ==========
-- 頭像存放空間：公開讀取；每個人只能在以自己 id 命名的資料夾裡上傳、替換、刪除
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "avatars 本人上傳" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars 本人修改" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars 本人刪除" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ========== 「歡迎私訊我」訪客私訊 ==========
create table public.messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 50),
  email text not null check (char_length(email) between 3 and 200),
  body text not null check (char_length(body) between 1 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 任何訪客（不用登入）都能送出；只有管理員能讀取、標記已讀與刪除
alter table public.messages enable row level security;
create policy "messages 訪客送出" on public.messages for insert to anon, authenticated
  with check (is_read = false);
create policy "messages 管理員讀取" on public.messages for select using (public.is_admin());
create policy "messages 管理員修改" on public.messages for update using (public.is_admin()) with check (public.is_admin());
create policy "messages 管理員刪除" on public.messages for delete using (public.is_admin());

-- ========== 作品表情（讚、大心…） ==========
-- 不用登入也能按：瀏覽器自己產生一組訪客代號（visitor_id），每位訪客對每件作品只能留一個表情。
-- 資料表不開放直接讀寫，只能透過下面兩個函式操作，訪客看不到別人的代號。
create table public.reactions (
  painting_id bigint not null references public.paintings (id) on delete cascade,
  visitor_id uuid not null,
  kind text not null check (kind in ('like', 'love', 'care', 'haha', 'wow', 'sad')),
  created_at timestamptz not null default now(),
  primary key (painting_id, visitor_id)
);
alter table public.reactions enable row level security;

-- 各表情的數量，以及這位訪客目前按的是哪一個
create function public.get_reactions(p_painting bigint, p_visitor uuid)
returns jsonb
language sql stable
security definer set search_path = ''
as $
  select jsonb_build_object(
    'counts', coalesce((
      select jsonb_object_agg(kind, n)
      from (select kind, count(*) as n from public.reactions where painting_id = p_painting group by kind) t
    ), '{}'::jsonb),
    'mine', (select kind from public.reactions where painting_id = p_painting and visitor_id = p_visitor)
  );
$;

-- 按表情；p_kind 為 null 代表收回
create function public.set_reaction(p_painting bigint, p_visitor uuid, p_kind text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $
begin
  if p_kind is null then
    delete from public.reactions where painting_id = p_painting and visitor_id = p_visitor;
  else
    insert into public.reactions (painting_id, visitor_id, kind)
    values (p_painting, p_visitor, p_kind)
    on conflict (painting_id, visitor_id) do update set kind = excluded.kind, created_at = now();
  end if;
  return public.get_reactions(p_painting, p_visitor);
end;
$;

revoke execute on function public.get_reactions(bigint, uuid) from public;
revoke execute on function public.set_reaction(bigint, uuid, text) from public;
grant execute on function public.get_reactions(bigint, uuid) to anon, authenticated;
grant execute on function public.set_reaction(bigint, uuid, text) to anon, authenticated;

-- ========== 預設分類（可自行修改） ==========
insert into public.categories (name, sort_order) values
  ('國畫', 1), ('熱蠟畫', 2), ('水彩', 3), ('油畫', 4);

-- ========== 設定媽媽為管理員 ==========
-- 媽媽先在網站上註冊帳號後，把下面的 email 換成她的，再單獨執行這一行：
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = 'mom@example.com');
