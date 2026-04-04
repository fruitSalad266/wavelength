import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TRUMBA_BASE = "https://www.trumba.com/calendars/sea_campus.json";

/** Strip HTML tags */
function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

/** Extract location text from HTML link or plain string */
function extractLocation(loc?: string): string {
  if (!loc) return "UW Campus";
  // Location often contains <a href="...">Building Name</a>
  const match = loc.match(/>([^<]+)</);
  return match ? `${match[1]}, UW Campus` : `${stripHtml(loc)}, UW Campus`;
}

/** Extract lat/lng from Google Maps link in location field */
function extractCoords(loc?: string): { lat: number | null; lng: number | null } {
  if (!loc) return { lat: null, lng: null };
  const match = loc.match(/q=([-\d.]+),([-\d.]+)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  return { lat: null, lng: null };
}

/** Format time from ISO datetime to "H:MM AM/PM" */
function formatTime(dtStr?: string): string | null {
  if (!dtStr) return null;
  const match = dtStr.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const min = match[2];
  if (hour === 0 && min === "00") return null; // all-day events
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${ampm}`;
}

/** Extract date as YYYY-MM-DD */
function extractDate(dtStr?: string): string {
  if (!dtStr) return "";
  return dtStr.split("T")[0];
}

/** Map event types from customFields to category */
function mapCategory(customFields?: Array<{ label: string; value: string }>): string {
  const eventTypes = customFields?.find((f) => f.label === "Event Types")?.value ?? "";
  const lower = eventTypes.toLowerCase();

  if (lower.includes("music") || lower.includes("concert") || lower.includes("performance")) return "Music";
  if (lower.includes("sport") || lower.includes("athletic")) return "Sports";
  if (lower.includes("exhibit") || lower.includes("art") || lower.includes("film")) return "Art";
  if (lower.includes("career") || lower.includes("networking")) return "Networking";
  if (lower.includes("food")) return "Food";
  if (lower.includes("lecture") || lower.includes("seminar") || lower.includes("tech")) return "Technology";
  return "UW";
}

/** Build tags from Trumba event data */
function buildTags(
  customFields?: Array<{ label: string; value: string }>,
  locationType?: string,
): Array<{ label: string; variant: string }> {
  const tags: Array<{ label: string; variant: string }> = [];
  const seen = new Set<string>();

  tags.push({ label: "UW", variant: "purple" });
  seen.add("UW");

  // Add event types as tags
  const eventTypes = customFields?.find((f) => f.label === "Event Types")?.value ?? "";
  for (const t of eventTypes.split(",")) {
    const trimmed = t.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      tags.push({ label: trimmed, variant: "teal" });
    }
  }

  if (locationType && !seen.has(locationType)) {
    seen.add(locationType);
    tags.push({ label: locationType, variant: "outline" });
  }

  return tags;
}

function mapEvent(ev: Record<string, unknown>): Record<string, unknown> {
  const customFields = ev.customFields as Array<{ label: string; value: string; fieldID: number; type: number }> | undefined;
  const location = ev.location as string | undefined;
  const coords = extractCoords(location);
  const startDt = ev.startDateTime as string | undefined;
  const eventImage = ev.eventImage as { url: string; size: { width: number; height: number } } | undefined;

  return {
    id: `trumba-${ev.eventID}`,
    source: "trumba",
    title: ev.title as string,
    date: extractDate(startDt),
    time: formatTime(startDt),
    location: extractLocation(location),
    venue_name: extractLocation(location).replace(", UW Campus", ""),
    venue_latitude: coords.lat,
    venue_longitude: coords.lng,
    attendees: 0,
    category: mapCategory(customFields),
    background_image: eventImage?.url ?? null,
    tags: buildTags(customFields, ev.locationType as string | undefined),
    tickets: ev.openSignUp
      ? { url: ev.permaLinkUrl as string, startingPrice: null, tiers: [] }
      : null,
    detail_type: "uw_event",
    ticket_url: (ev.permaLinkUrl as string) ?? null,
    price_min: null,
    price_max: null,
    currency: "USD",
    raw_classifications: {
      customFields,
      template: ev.template,
      categoryCalendar: ev.categoryCalendar,
      description: stripHtml(ev.description as string),
    },
    fetched_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const days = url.searchParams.get("days") ?? "60";

    // Start from today
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    const d = now.getDate().toString().padStart(2, "0");
    const startdate = url.searchParams.get("startdate") ?? `${y}${m}${d}`;

    const trumbaUrl = `${TRUMBA_BASE}?startdate=${startdate}&days=${days}`;

    const trumbaRes = await fetch(trumbaUrl);
    if (!trumbaRes.ok) {
      const body = await trumbaRes.text();
      return new Response(JSON.stringify({ error: "Trumba API error", detail: body }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawEvents = await trumbaRes.json();

    if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
      return new Response(JSON.stringify({ message: "No events found", upserted: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Filter out cancelled events
    const activeEvents = rawEvents.filter((ev: Record<string, unknown>) => !ev.canceled);
    const rows = activeEvents.map(mapEvent);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from("events").upsert(rows, { onConflict: "id" });

    if (error) {
      return new Response(JSON.stringify({ error: "Supabase upsert failed", detail: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: `Fetched and upserted ${rows.length} UW calendar events`, upserted: rows.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
