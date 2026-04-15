-- ============================================================
-- 1. EXPAND PROFILES
-- Queryable columns for fields we filter/join on.
-- JSONB `extras` for everything else (bio, top events, anthem,
-- social links, clubs) — add new profile sections without migrations.
-- ============================================================

alter table public.profiles
  add column if not exists location       text,           -- "Seattle, WA"
  add column if not exists age_range      text,           -- "25-30"
  add column if not exists class_year     smallint,       -- 2026
  add column if not exists major          text,           -- "Computer Science"
  add column if not exists interests      text[] default '{}',  -- {'Music Festivals','Art & Culture'}
  add column if not exists is_public      boolean default true,
  add column if not exists is_uw_verified boolean default true,  -- all users are @uw.edu
  add column if not exists settings       jsonb default '{}',   -- notification prefs, theme, etc.
  add column if not exists extras         jsonb default '{}';   -- bio, top_events, anthem, social_links, clubs

-- extras example:
-- {
--   "bio": "Front row seats...",
--   "top_events": [{"emoji":"🎵","title":"Rufus Du Sol","desc":"..."}],
--   "anthem": {"title":"Blinding Lights","artist":"The Weeknd","url":"..."},
--   "social_links": [{"icon":"instagram","label":"@alex","url":"..."}],
--   "clubs": ["ACM @ UW","Husky Coding Project"]
-- }

-- Index interests for overlap queries (e.g. match scoring)
create index if not exists profiles_interests_idx on public.profiles using gin (interests);

-- ============================================================
-- 2. FRIENDSHIPS
-- Bidirectional: requester sends, recipient accepts.
-- Query "my friends" = WHERE (user_id = me OR friend_id = me) AND status = 'accepted'
-- ============================================================

create table public.friendships (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status    text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create index friendships_friend_idx on public.friendships (friend_id, status);

alter table public.friendships enable row level security;

-- Users can see friendships they're part of
create policy "Users see own friendships"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Users can send friend requests
create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = user_id);

-- Users can accept/block requests sent to them, or cancel their own
create policy "Users can update own friendships"
  on public.friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Users can remove friendships they're part of
create policy "Users can delete own friendships"
  on public.friendships for delete
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- ============================================================
-- 3. EVENT RSVPs (going / maybe) + STARS (bookmarks)
-- Single table — status for RSVP, is_starred as a flag.
-- Denormalize attendee_count on events via trigger.
-- ============================================================

create table public.event_rsvps (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  event_id   text not null references public.events(id) on delete cascade,
  status     text not null default 'going' check (status in ('going','maybe')),
  is_starred boolean default false,
  is_public  boolean default true,
  created_at timestamptz default now(),
  primary key (user_id, event_id)
);

create index event_rsvps_event_idx on public.event_rsvps (event_id, status);

alter table public.event_rsvps enable row level security;

-- Anyone can see public RSVPs (for attendee lists)
create policy "Public RSVPs are readable"
  on public.event_rsvps for select
  using (is_public = true or auth.uid() = user_id);

-- Users manage their own RSVPs
create policy "Users manage own RSVPs"
  on public.event_rsvps for insert
  with check (auth.uid() = user_id);

create policy "Users update own RSVPs"
  on public.event_rsvps for update
  using (auth.uid() = user_id);

create policy "Users delete own RSVPs"
  on public.event_rsvps for delete
  using (auth.uid() = user_id);

-- Trigger to keep events.attendees in sync
create or replace function public.update_event_attendee_count()
returns trigger as $$
begin
  if (TG_OP = 'DELETE') then
    update public.events
      set attendees = (select count(*) from public.event_rsvps where event_id = OLD.event_id and status = 'going')
      where id = OLD.event_id;
    return OLD;
  else
    update public.events
      set attendees = (select count(*) from public.event_rsvps where event_id = NEW.event_id and status = 'going')
      where id = NEW.event_id;
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_rsvp_change
  after insert or update or delete on public.event_rsvps
  for each row execute function public.update_event_attendee_count();

-- ============================================================
-- 4. GROUP CHATS
-- Per-event group chats with membership.
-- ============================================================

create table public.group_chats (
  id          uuid primary key default gen_random_uuid(),
  event_id    text references public.events(id) on delete set null,
  name        text not null,
  icon        text,           -- emoji
  description text,
  is_verified boolean default false,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

create index group_chats_event_idx on public.group_chats (event_id);

alter table public.group_chats enable row level security;

create policy "Group chats are readable"
  on public.group_chats for select
  using (true);

create policy "Users can create group chats"
  on public.group_chats for insert
  with check (auth.uid() = created_by);

-- ============================================================
-- 5. GROUP CHAT MEMBERS
-- ============================================================

create table public.group_chat_members (
  group_chat_id uuid not null references public.group_chats(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'member' check (role in ('member','admin')),
  joined_at     timestamptz default now(),
  primary key (group_chat_id, user_id)
);

alter table public.group_chat_members enable row level security;

-- Members can see who's in their chats
create policy "Members see chat members"
  on public.group_chat_members for select
  using (
    exists (
      select 1 from public.group_chat_members m
      where m.group_chat_id = group_chat_members.group_chat_id
        and m.user_id = auth.uid()
    )
  );

-- Users can join group chats
create policy "Users can join group chats"
  on public.group_chat_members for insert
  with check (auth.uid() = user_id);

-- Users can leave group chats
create policy "Users can leave group chats"
  on public.group_chat_members for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. MESSAGES (for both group chats and DMs)
-- group_chat_id NULL = DM, recipient_id set.
-- group_chat_id set = group message.
-- ============================================================

create table public.messages (
  id            uuid primary key default gen_random_uuid(),
  group_chat_id uuid references public.group_chats(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  recipient_id  uuid references public.profiles(id) on delete cascade,
  body          text not null,
  created_at    timestamptz default now(),
  check (
    (group_chat_id is not null and recipient_id is null)
    or (group_chat_id is null and recipient_id is not null)
  )
);

create index messages_group_chat_idx on public.messages (group_chat_id, created_at desc);
create index messages_dm_idx on public.messages (
  least(sender_id, recipient_id),
  greatest(sender_id, recipient_id),
  created_at desc
);

alter table public.messages enable row level security;

-- Users see messages in their group chats or DMs
create policy "Users see own messages"
  on public.messages for select
  using (
    auth.uid() = sender_id
    or auth.uid() = recipient_id
    or exists (
      select 1 from public.group_chat_members m
      where m.group_chat_id = messages.group_chat_id
        and m.user_id = auth.uid()
    )
  );

-- Users can send messages
create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);
