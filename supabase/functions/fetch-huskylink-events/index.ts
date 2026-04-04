import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const HUSKYLINK_BASE = "https://huskylink.washington.edu/api/discovery/event/search";
const HUSKYLINK_IMAGE_BASE = "https://se-images.campuslabs.com/clink/images/";

/** Map HuskyLink theme/category to app category */
function mapCategory(theme?: string, categoryNames?: string[]): string {
  const cat = categoryNames?.[0]?.toLowerCase() ?? "";
  const t = theme?.toLowerCase() ?? "";

  if (cat.includes("club meeting")) return "UW";
  if (cat.includes("guest lecture") || cat.includes("workshop")) return "Technology";
  if (cat.includes("gaming")) return "Sports";
  if (cat.includes("networking") || cat.includes("career")) return "Networking";
  if (cat.includes("performance") || cat.includes("concert")) return "Music";
  if (cat.includes("food")) return "Food";
  if (t === "athletics") return "Sports";
  if (t === "arts") return "Art";
  if (t === "social") return "UW";
  if (t === "thoughtfullearning") return "Technology";
  return "UW";
}

/** Build tags from HuskyLink fields */
function buildTags(
  theme?: string,
  categoryNames?: string[],
  benefitNames?: string[],
  orgName?: string,
): Array<{ label: string; variant: string }> {
  const tags: Array<{ label: string; variant: string }> = [];
  const seen = new Set<string>();

  // Always tag as UW
  tags.push({ label: "UW", variant: "purple" });
  seen.add("UW");

  if (theme && theme !== "Unknown" && !seen.has(theme)) {
    seen.add(theme);
    tags.push({ label: theme, variant: "teal" });
  }

  for (const cat of categoryNames ?? []) {
    if (!seen.has(cat)) {
      seen.add(cat);
      tags.push({ label: cat, variant: "outline" });
    }
  }

  for (const b of benefitNames ?? []) {
    if (!seen.has(b)) {
      seen.add(b);
      tags.push({ label: b, variant: "teal" });
    }
  }

  return tags;
}

/** Format ISO datetime to "H:MM AM/PM" */
function formatTime(isoStr?: string): string | null {
  if (!isoStr) return null;
  const date = new Date(isoStr);
  const h = date.getUTCHours();
  const m = date.getUTCMinutes().toString().padStart(2, "0");
  // startsOn is already in UTC offset, parse hours from the string directly
  const match = isoStr.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const min = match[2];
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${ampm}`;
}

/** Extract date as YYYY-MM-DD from ISO string */
function extractDate(isoStr?: string): string {
  if (!isoStr) return "";
  return isoStr.split("T")[0];
}

/** Build image URL from imagePath */
function buildImageUrl(imagePath?: string): string | null {
  if (!imagePath) return null;
  return `${HUSKYLINK_IMAGE_BASE}${imagePath}`;
}

/** Strip HTML tags from description */
function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

function mapEvent(ev: Record<string, unknown>): Record<string, unknown> {
  const categoryNames = ev.categoryNames as string[] | undefined;
  const benefitNames = ev.benefitNames as string[] | undefined;
  const theme = ev.theme as string | undefined;
  const orgName = ev.organizationName as string | undefined;
  const startsOn = ev.startsOn as string | undefined;
  const location = ev.location as string | undefined;

  return {
    id: `huskylink-${ev.id}`,
    source: "huskylink",
    title: ev.name as string,
    date: extractDate(startsOn),
    time: formatTime(startsOn),
    location: location ? `${location}, UW Campus` : "UW Campus",
    venue_name: location ?? "UW Campus",
    venue_latitude: ev.latitude ? parseFloat(ev.latitude as string) : null,
    venue_longitude: ev.longitude ? parseFloat(ev.longitude as string) : null,
    attendees: (ev.rsvpTotal as number) ?? 0,
    category: mapCategory(theme, categoryNames),
    background_image: buildImageUrl(ev.imagePath as string | undefined),
    tags: buildTags(theme, categoryNames, benefitNames, orgName),
    tickets: null,
    detail_type: "uw_event",
    ticket_url: null,
    price_min: null,
    price_max: null,
    currency: "USD",
    raw_classifications: {
      theme,
      categoryNames,
      benefitNames,
      organizationName: orgName,
      description: stripHtml(ev.description as string),
    },
    fetched_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const take = url.searchParams.get("take") ?? "100";

    // Default: fetch events starting from today
    const now = new Date();
    const startsAfter = url.searchParams.get("startsAfter") ?? now.toISOString();

    const hlUrl = new URL(HUSKYLINK_BASE);
    hlUrl.searchParams.set("orderByField", "startsOn");
    hlUrl.searchParams.set("orderByDirection", "ascending");
    hlUrl.searchParams.set("status", "Approved");
    hlUrl.searchParams.set("startsAfter", startsAfter);
    hlUrl.searchParams.set("take", take);

    const hlRes = await fetch(hlUrl.toString());
    if (!hlRes.ok) {
      const body = await hlRes.text();
      return new Response(JSON.stringify({ error: "HuskyLink API error", detail: body }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hlData = await hlRes.json();
    const rawEvents = hlData?.value ?? hlData ?? [];

    if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
      return new Response(JSON.stringify({ message: "No events found", upserted: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = rawEvents.map(mapEvent);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from("events").upsert(rows, { onConflict: "id" });

    if (error) {
      return new Response(JSON.stringify({ error: "Supabase upsert failed", detail: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: `Fetched and upserted ${rows.length} HuskyLink events`, upserted: rows.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
