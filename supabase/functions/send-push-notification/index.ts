import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  related_user_id: string | null;
  related_event_id: string | null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { record } = (await req.json()) as { record?: NotificationRecord };
    if (!record?.id || !record?.user_id) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Re-fetch from DB so callers can't spoof arbitrary push content
    const { data: notif, error: notifError } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, related_user_id, related_event_id")
      .eq("id", record.id)
      .eq("user_id", record.user_id)
      .single();

    if (notifError || !notif) {
      return new Response(JSON.stringify({ error: "Notification not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", notif.user_id);

    if (tokensError) {
      return new Response(JSON.stringify({ error: tokensError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const messages = tokens.map(({ token }) => ({
      to: token,
      title: notif.title,
      body: notif.body,
      sound: "default",
      data: {
        notificationId: notif.id,
        type: notif.type,
        relatedUserId: notif.related_user_id,
        relatedEventId: notif.related_event_id,
      },
    }));

    const pushRes = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messages),
    });

    const pushResult = await pushRes.json();
    const staleTokens: string[] = [];

    if (pushResult?.data && Array.isArray(pushResult.data)) {
      pushResult.data.forEach(
        (item: { status?: string; details?: { error?: string } }, i: number) => {
          if (
            item.status === "error" &&
            (item.details?.error === "DeviceNotRegistered" ||
              item.details?.error === "InvalidCredentials")
          ) {
            staleTokens.push(messages[i].to);
          }
        }
      );
    }

    if (staleTokens.length > 0) {
      await supabase
        .from("push_tokens")
        .delete()
        .eq("user_id", notif.user_id)
        .in("token", staleTokens);
    }

    return new Response(
      JSON.stringify({ sent: messages.length, staleRemoved: staleTokens.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
