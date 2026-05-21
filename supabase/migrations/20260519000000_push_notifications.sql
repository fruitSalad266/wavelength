-- Store Expo push tokens per device
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  platform text,
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index idx_push_tokens_user on push_tokens(user_id);

alter table push_tokens enable row level security;

create policy "Users manage own push tokens"
  on push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- After a notification row is inserted, call the edge function to send a push
create or replace function dispatch_push_notification()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://bpibanzmaxfndegpeuhr.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_C5sODbXTPq0KIQ-4qnmFLw_imlpziyr'
    ),
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'id', NEW.id,
        'user_id', NEW.user_id,
        'type', NEW.type,
        'title', NEW.title,
        'body', NEW.body,
        'related_user_id', NEW.related_user_id,
        'related_event_id', NEW.related_event_id
      )
    )
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_notification_insert_send_push
  after insert on notifications
  for each row execute function dispatch_push_notification();
