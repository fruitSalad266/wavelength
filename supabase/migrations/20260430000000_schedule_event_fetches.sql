-- Enable required extensions
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Fetch UW calendar events daily at 6:00 AM UTC (11 PM PT)
select cron.schedule(
  'fetch-uw-events-daily',
  '0 6 * * *',
  $$
  select net.http_get(
    url := 'https://bpibanzmaxfndegpeuhr.supabase.co/functions/v1/fetch-uw-calendar-events?days=90',
    headers := jsonb_build_object(
      'Authorization', 'Bearer sb_publishable_C5sODbXTPq0KIQ-4qnmFLw_imlpziyr'
    )
  );
  $$
);

-- Fetch Ticketmaster Seattle events daily at 6:15 AM UTC
select cron.schedule(
  'fetch-ticketmaster-seattle-daily',
  '15 6 * * *',
  $$
  select net.http_get(
    url := 'https://bpibanzmaxfndegpeuhr.supabase.co/functions/v1/fetch-events?city=Seattle&stateCode=WA&size=50',
    headers := jsonb_build_object(
      'Authorization', 'Bearer sb_publishable_C5sODbXTPq0KIQ-4qnmFLw_imlpziyr'
    )
  );
  $$
);

-- Fetch Ticketmaster Gorge events daily at 6:30 AM UTC
select cron.schedule(
  'fetch-ticketmaster-gorge-daily',
  '30 6 * * *',
  $$
  select net.http_get(
    url := 'https://bpibanzmaxfndegpeuhr.supabase.co/functions/v1/fetch-events?city=George&stateCode=WA&size=50',
    headers := jsonb_build_object(
      'Authorization', 'Bearer sb_publishable_C5sODbXTPq0KIQ-4qnmFLw_imlpziyr'
    )
  );
  $$
);
