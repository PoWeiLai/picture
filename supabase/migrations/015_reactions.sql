-- 作品表情（讚、大心…）。第一次設定時 schema.sql 已包含，只有舊資料庫才需要執行。

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
as $$
  select jsonb_build_object(
    'counts', coalesce((
      select jsonb_object_agg(kind, n)
      from (select kind, count(*) as n from public.reactions where painting_id = p_painting group by kind) t
    ), '{}'::jsonb),
    'mine', (select kind from public.reactions where painting_id = p_painting and visitor_id = p_visitor)
  );
$$;

-- 按表情；p_kind 為 null 代表收回
create function public.set_reaction(p_painting bigint, p_visitor uuid, p_kind text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
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
$$;

revoke execute on function public.get_reactions(bigint, uuid) from public;
revoke execute on function public.set_reaction(bigint, uuid, text) from public;
grant execute on function public.get_reactions(bigint, uuid) to anon, authenticated;
grant execute on function public.set_reaction(bigint, uuid, text) to anon, authenticated;
