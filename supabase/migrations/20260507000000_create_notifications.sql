-- Notifications table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('friend_request', 'friend_accepted', 'friend_event')),
  title text not null,
  body text not null,
  related_user_id uuid references profiles(id) on delete set null,
  related_event_id text references events(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id) where not read;

alter table notifications enable row level security;

create policy "Users can read own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- Function: create notification for friend request
create or replace function notify_friend_request()
returns trigger as $$
declare
  sender_name text;
begin
  if NEW.status = 'pending' then
    select full_name into sender_name from profiles where id = NEW.user_id;
    insert into notifications (user_id, type, title, body, related_user_id)
    values (
      NEW.friend_id,
      'friend_request',
      sender_name || ' sent you a friend request',
      sender_name || ' wants to be your friend.',
      NEW.user_id
    );
  end if;

  if NEW.status = 'accepted' and OLD.status = 'pending' then
    select full_name into sender_name from profiles where id = NEW.friend_id;
    insert into notifications (user_id, type, title, body, related_user_id)
    values (
      NEW.user_id,
      'friend_accepted',
      sender_name || ' accepted your friend request',
      'You and ' || sender_name || ' are now friends!',
      NEW.friend_id
    );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_friendship_change
  after insert or update on friendships
  for each row execute function notify_friend_request();

-- Function: notify friends when someone RSVPs to a shared event
create or replace function notify_friend_rsvp()
returns trigger as $$
declare
  rsvp_user_name text;
  event_title text;
  friend_row record;
begin
  if NEW.status != 'going' then return NEW; end if;

  select full_name into rsvp_user_name from profiles where id = NEW.user_id;
  select title into event_title from events where id = NEW.event_id;

  if event_title is null then return NEW; end if;

  for friend_row in
    select er.user_id as friend_id
    from event_rsvps er
    join friendships f on (
      (f.user_id = NEW.user_id and f.friend_id = er.user_id)
      or (f.friend_id = NEW.user_id and f.user_id = er.user_id)
    )
    where er.event_id = NEW.event_id
      and er.user_id != NEW.user_id
      and er.status = 'going'
      and f.status = 'accepted'
  loop
    insert into notifications (user_id, type, title, body, related_user_id, related_event_id)
    values (
      friend_row.friend_id,
      'friend_event',
      rsvp_user_name || ' is going!',
      rsvp_user_name || ' just RSVP''d to ' || event_title || ' — an event you''re attending.',
      NEW.user_id,
      NEW.event_id
    );
  end loop;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_rsvp_going
  after insert or update on event_rsvps
  for each row execute function notify_friend_rsvp();
