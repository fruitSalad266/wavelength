-- Fix RLS performance: wrap auth.uid() in (select ...) so it evaluates once
-- instead of per-row. See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ============================================================
-- profiles
-- ============================================================

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

-- ============================================================
-- friendships
-- ============================================================

drop policy if exists "Users see own friendships" on public.friendships;
create policy "Users see own friendships"
  on public.friendships for select
  using ((select auth.uid()) = user_id or (select auth.uid()) = friend_id);

drop policy if exists "Users can send friend requests" on public.friendships;
create policy "Users can send friend requests"
  on public.friendships for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own friendships" on public.friendships;
create policy "Users can update own friendships"
  on public.friendships for update
  using ((select auth.uid()) = user_id or (select auth.uid()) = friend_id);

drop policy if exists "Users can delete own friendships" on public.friendships;
create policy "Users can delete own friendships"
  on public.friendships for delete
  using ((select auth.uid()) = user_id or (select auth.uid()) = friend_id);

-- ============================================================
-- event_rsvps
-- ============================================================

drop policy if exists "Public RSVPs are readable" on public.event_rsvps;
create policy "Public RSVPs are readable"
  on public.event_rsvps for select
  using (is_public = true or (select auth.uid()) = user_id);

drop policy if exists "Users manage own RSVPs" on public.event_rsvps;
create policy "Users manage own RSVPs"
  on public.event_rsvps for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own RSVPs" on public.event_rsvps;
create policy "Users update own RSVPs"
  on public.event_rsvps for update
  using ((select auth.uid()) = user_id);

drop policy if exists "Users delete own RSVPs" on public.event_rsvps;
create policy "Users delete own RSVPs"
  on public.event_rsvps for delete
  using ((select auth.uid()) = user_id);

-- ============================================================
-- group_chats
-- ============================================================

drop policy if exists "Users can create group chats" on public.group_chats;
create policy "Users can create group chats"
  on public.group_chats for insert
  with check ((select auth.uid()) = created_by);

-- ============================================================
-- group_chat_members
-- ============================================================

drop policy if exists "Members see chat members" on public.group_chat_members;
create policy "Members see chat members"
  on public.group_chat_members for select
  using (
    exists (
      select 1 from public.group_chat_members m
      where m.group_chat_id = group_chat_members.group_chat_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can join group chats" on public.group_chat_members;
create policy "Users can join group chats"
  on public.group_chat_members for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can leave group chats" on public.group_chat_members;
create policy "Users can leave group chats"
  on public.group_chat_members for delete
  using ((select auth.uid()) = user_id);

-- ============================================================
-- messages
-- ============================================================

drop policy if exists "Users see own messages" on public.messages;
create policy "Users see own messages"
  on public.messages for select
  using (
    (select auth.uid()) = sender_id
    or (select auth.uid()) = recipient_id
    or exists (
      select 1 from public.group_chat_members m
      where m.group_chat_id = messages.group_chat_id
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
  on public.messages for insert
  with check ((select auth.uid()) = sender_id);
