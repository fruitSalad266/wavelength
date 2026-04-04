import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/** Map a Supabase row (snake_case) to the shape screens expect (camelCase). */
function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    location: row.location,
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

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (cancelled) return;

      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      setEvents((data ?? []).map(mapRow));
      setLoading(false);
    }

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { events, loading, error };
}
