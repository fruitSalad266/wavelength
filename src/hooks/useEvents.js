import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/** Decode HTML entities like &amp; &#39; etc. */
function decodeHtml(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

/** Map a Supabase row (snake_case) to the shape screens expect (camelCase). */
function mapRow(row) {
  return {
    id: row.id,
    title: decodeHtml(row.title),
    date: row.date,
    time: row.time,
    location: decodeHtml(row.location),
    attendees: row.attendees ?? 0,
    category: row.category,
    backgroundImage: row.background_image,
    tags: row.tags ?? [],
    tickets: row.tickets,
    detailType: row.detail_type,
    ticketUrl: row.ticket_url,
    priceMin: row.price_min,
    priceMax: row.price_max,
    source: row.source,
  };
}

// Module-level cache so multiple screens share the same data
let cachedEvents = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchEvents() {
  const now = Date.now();
  if (cachedEvents && now - cacheTime < CACHE_TTL) {
    return { data: cachedEvents, error: null };
  }

  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('events')
    .select('id,title,date,time,location,attendees,category,background_image,tags,tickets,detail_type,ticket_url,price_min,price_max,source')
    .gte('date', today)
    .order('date', { ascending: true });

  if (!error && data) {
    cachedEvents = data.map(mapRow);
    cacheTime = now;
  }

  return { data: cachedEvents ?? [], error };
}

export function useEvents() {
  const [events, setEvents] = useState(cachedEvents ?? []);
  const [loading, setLoading] = useState(!cachedEvents);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchEvents().then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err);
      } else {
        setEvents(data);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return { events, loading, error };
}
