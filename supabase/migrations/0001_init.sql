-- Gezinnen, leden en activiteiten, met Row Level Security per gezin.

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id),
  title text not null,
  who text not null default '',
  note text not null default '',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index on public.activities (family_id, occurred_at desc);
create index on public.family_members (user_id);

-- Helper: zit de ingelogde gebruiker in dit gezin?
create or replace function public.is_family_member(fid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = fid and user_id = auth.uid()
  );
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.activities enable row level security;

create policy "leden zien hun gezin" on public.families
  for select using (public.is_family_member(id));

create policy "leden zien gezinsleden" on public.family_members
  for select using (public.is_family_member(family_id));

create policy "leden zien activiteiten" on public.activities
  for select using (public.is_family_member(family_id));
create policy "leden voegen activiteiten toe" on public.activities
  for insert with check (public.is_family_member(family_id) and created_by = auth.uid());
create policy "leden verwijderen activiteiten" on public.activities
  for delete using (public.is_family_member(family_id));

-- Gezin aanmaken en uitnodigingscode gebruiken gaan via functies,
-- zodat clients nooit rechtstreeks in families/family_members schrijven.
create or replace function public.create_family(family_name text, member_name text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'niet ingelogd'; end if;
  insert into families(name) values (family_name) returning id into fid;
  insert into family_members(family_id, user_id, display_name) values (fid, auth.uid(), member_name);
  return fid;
end;
$$;

create or replace function public.join_family(code text, member_name text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'niet ingelogd'; end if;
  select id into fid from families where invite_code = code;
  if fid is null then raise exception 'ongeldige uitnodigingscode'; end if;
  insert into family_members(family_id, user_id, display_name)
    values (fid, auth.uid(), member_name)
    on conflict do nothing;
  return fid;
end;
$$;

revoke all on function public.create_family(text, text) from public, anon;
revoke all on function public.join_family(text, text) from public, anon;
grant execute on function public.create_family(text, text) to authenticated;
grant execute on function public.join_family(text, text) to authenticated;
