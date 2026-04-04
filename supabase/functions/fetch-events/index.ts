import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TICKETMASTER_API_KEY = Deno.env.get("TICKETMASTER_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TAG_VARIANTS: Record<string, string> = {
  Music: "purple",
  Sports: "teal",
  "Arts & Theatre": "purple",
  Film: "teal",
  Miscellaneous: "outline",
};

/** Map a Ticketmaster classification segment to an app category */
function mapCategory(segment?: string): string {
  const mapping: Record<string, string> = {
    Music: "Music",
    Sports: "Sports",
    "Arts & Theatre": "Art",
    Film: "Art",
    Miscellaneous: "Other",
  };
  return mapping[segment ?? ""] ?? "Other";
}

/** Build tags array from Ticketmaster classifications */
function buildTags(
  classifications: Array<{
    segment?: { name: string };
    genre?: { name: string };
    subGenre?: { name: string };
  }> = []
): Array<{ label: string; variant: string }> {
  const tags: Array<{ label: string; variant: string }> = [];
  const seen = new Set<string>();

  for (const c of classifications) {
    if (c.segment?.name && !seen.has(c.segment.name)) {
      seen.add(c.segment.name);
      tags.push({
        label: c.segment.name,
        variant: TAG_VARIANTS[c.segment.name] ?? "outline",
      });
    }
    if (c.genre?.name && !seen.has(c.genre.name)) {
      seen.add(c.genre.name);
      tags.push({ label: c.genre.name, variant: "purple" });
    }
    if (c.subGenre?.name && !seen.has(c.subGenre.name)) {
      seen.add(c.subGenre.name);
      tags.push({ label: c.subGenre.name, variant: "outline" });
    }
  }

  return tags;
}

/** Format time from "HH:MM:SS" to "H:MM AM/PM" */
function formatTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

/** Pick the best image — prefer 16:9, largest width */
function pickImage(images: Array<{ url: string; width: number; ratio: string }> = []): string | null {
  if (images.length === 0) return null;
  const wide = images.filter((i) => i.ratio === "16_9");
  const pool = wide.length > 0 ? wide : images;
  pool.sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return pool[0]?.url ?? null;
}

/** Map a single Ticketmaster event to our DB row */
function mapEvent(ev: Record<string, unknown>): Record<string, unknown> {
  const embedded = ev._embedded as Record<string, unknown[]> | undefined;
  const venue = embedded?.venues?.[0] as Record<string, unknown> | undefined;
  const dates = ev.dates as Record<string, unknown> | undefined;
  const start = dates?.start as Record<string, string> | undefined;
  const classifications = ev.classifications as Array<Record<string, { name: string }>> | undefined;
  const priceRanges = ev.priceRanges as Array<{ min: number; max: number; currency: string }> | undefined;
  const images = ev.images as Array<{ url: string; width: number; ratio: string }> | undefined;

  const segmentName = classifications?.[0]?.segment?.name;
  const venueName = (venue?.name as string) ?? "";
  const city = (venue?.city as Record<string, string>)?.name ?? "";
  const state = (venue?.state as Record<string, string>)?.stateCode ?? "";
  const location = [venueName, city, state].filter(Boolean).join(", ");

  const priceMin = priceRanges?.[0]?.min;
  const priceMax = priceRanges?.[0]?.max;
  const startingPrice = priceMin != null ? `$${priceMin.toFixed(2)}` : null;

  const tickets = (ev.url as string)
    ? {
        url: ev.url,
        startingPrice,
        tiers: [],
      }
    : null;

  return {
    id: ev.id as string,
    source: "ticketmaster",
    title: ev.name as string,
    date: start?.localDate ?? "",
    time: formatTime(start?.localTime),
    location,
    venue_name: venueName,
    venue_latitude: (venue?.location as Record<string, string>)?.latitude
      ? parseFloat((venue?.location as Record<string, string>).latitude)
      : null,
    venue_longitude: (venue?.location as Record<string, string>)?.longitude
      ? parseFloat((venue?.location as Record<string, string>).longitude)
      : null,
    category: mapCategory(segmentName),
    background_image: pickImage(images),
    tags: buildTags(classifications),
    tickets,
    detail_type: segmentName?.toLowerCase() === "music" ? "concert" : segmentName?.toLowerCase() ?? null,
    ticket_url: (ev.url as string) ?? null,
    price_min: priceMin ?? null,
    price_max: priceMax ?? null,
    currency: priceRanges?.[0]?.currency ?? "USD",
    raw_classifications: classifications ?? [],
    fetched_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  try {
    // Allow optional query params to override defaults
    const url = new URL(req.url);
    const city = url.searchParams.get("city") ?? "Seattle";
    const stateCode = url.searchParams.get("stateCode") ?? "WA";
    const size = url.searchParams.get("size") ?? "50";

    // Fetch from Ticketmaster
    const tmUrl = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    tmUrl.searchParams.set("apikey", TICKETMASTER_API_KEY);
    tmUrl.searchParams.set("city", city);
    tmUrl.searchParams.set("stateCode", stateCode);
    tmUrl.searchParams.set("sort", "relevance,desc");
    tmUrl.searchParams.set("size", size);

    const tmRes = await fetch(tmUrl.toString());
    if (!tmRes.ok) {
      const body = await tmRes.text();
      return new Response(JSON.stringify({ error: "Ticketmaster API error", detail: body }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tmData = await tmRes.json();
    const rawEvents = tmData?._embedded?.events ?? [];

    if (rawEvents.length === 0) {
      return new Response(JSON.stringify({ message: "No events found", upserted: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Map to our schema
    const rows = rawEvents.map(mapEvent);

    // Upsert into Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase
      .from("events")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      return new Response(JSON.stringify({ error: "Supabase upsert failed", detail: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: `Fetched and upserted ${rows.length} events`, upserted: rows.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
