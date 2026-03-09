import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const KLING_BASE = "https://api-singapore.klingai.com";

function generateJWT(ak: string, sk: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ak, exp: now + 1800, nbf: now - 5 };

  const b64url = (data: Uint8Array) =>
    btoa(String.fromCharCode(...data))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const enc = new TextEncoder();
  const headerB64 = b64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;


  const key = enc.encode(sk);
  const msg = enc.encode(signingInput);


  return crypto.subtle
    .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((cryptoKey) => crypto.subtle.sign("HMAC", cryptoKey, msg))
    .then((sig) => `${signingInput}.${b64url(new Uint8Array(sig))}`);
}

async function generateJWTAsync(ak: string, sk: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ak, exp: now + 1800, nbf: now - 5 };

  const b64url = (data: Uint8Array) =>
    btoa(String.fromCharCode(...data))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const enc = new TextEncoder();
  const headerB64 = b64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(sk),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(signingInput));
  return `${signingInput}.${b64url(new Uint8Array(sig))}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ak = Deno.env.get("KLING_ACCESS_KEY");
    const sk = Deno.env.get("KLING_SECRET_KEY");
    if (!ak || !sk) throw new Error("Kling AI ключи не настроены");

    const { action, prompt, taskId } = await req.json();
    const token = await generateJWTAsync(ak, sk);
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (action === "create") {

      const response = await fetch(`${KLING_BASE}/v1/videos/text2video`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          model_name: "kling-v2-master",
          prompt: prompt,
          duration: "5",
          cfg_scale: 0.5,
          aspect_ratio: "16:9",
        }),
      });

      const data = await response.json();
      console.log("Kling create response:", JSON.stringify(data));

      if (!response.ok || data.code !== 0) {
        const msg = data.message || "Ошибка создания видео";
        return new Response(JSON.stringify({ error: msg }), {
          status: response.status >= 400 ? response.status : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ taskId: data.data?.task_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "poll") {

      if (!taskId) throw new Error("taskId обязателен");

      const response = await fetch(
        `${KLING_BASE}/v1/videos/text2video/${taskId}`,
        { headers: authHeaders }
      );

      const data = await response.json();
      console.log("Kling poll response:", JSON.stringify(data));

      if (!response.ok) {
        return new Response(JSON.stringify({ error: data.message || "Ошибка проверки статуса" }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const taskData = data.data;
      const status = taskData?.task_status;

      if (status === "succeed") {
        const videoUrl = taskData?.task_result?.videos?.[0]?.url;
        return new Response(
          JSON.stringify({ status: "completed", videoUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (status === "failed") {
        return new Response(
          JSON.stringify({ status: "failed", error: taskData?.task_status_msg || "Генерация не удалась" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {

        return new Response(
          JSON.stringify({ status: "processing" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ error: "Неизвестное действие" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kling-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Неизвестная ошибка" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
