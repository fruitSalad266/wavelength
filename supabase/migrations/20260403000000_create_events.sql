-- Events table for storing Ticketmaster + future event sources
create table public.events (
  id text primary key,                    -- ticketmaster event ID or custom ID
  source text not null default 'ticketmaster', -- 'ticketmaster', 'eventbrite', 'manual'
  title text not null,
  date text not null,                     -- 'YYYY-MM-DD'
  time text,                              -- '5:30 PM'
  location text,                          -- 'Lumen Field, Seattle, WA'
  venue_name text,
  venue_latitude double precision,
  venue_longitude double precision,
  attendees integer default 0,
  category text,                          -- 'Music', 'Sports', etc.
  background_image text,                  -- main image URL
  tags jsonb default '[]'::jsonb,         -- [{label, variant}]
  tickets jsonb,                          -- {url, startingPrice, tiers: [{label, price}]}
  detail_type text,                       -- 'concert', 'sports', etc.
  ticket_url text,                        -- direct link to buy tickets
  price_min numeric,
  price_max numeric,
  currency text default 'USD',
  raw_classifications jsonb,              -- original Ticketmaster classifications
  fetched_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index for common queries
create index events_date_idx on public.events (date);
create index events_category_idx on public.events (category);
create index events_source_idx on public.events (source);

-- Enable RLS
alter table public.events enable row level security;

-- Allow anyone to read events (public data)
create policy "Events are publicly readable"
  on public.events for select
  using (true);
