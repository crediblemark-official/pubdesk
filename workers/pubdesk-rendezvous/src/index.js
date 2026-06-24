/**
 * PubDesk Rendezvous Worker
 *
 * Cloudflare Worker untuk peer discovery DAN notifikasi signal sync.
 * 
 * HEMAT LIMIT: KV write sangat dibatasi (1,000/hari free tier).
 * Semua DATA disimpan di Google Sheets via GAS.
 * Worker ini HANYA sebagai sinyal ringan "ada data baru" (1 KV write per push batch).
 *
 * Endpoints:
 *   POST /register   — register peer (peer discovery)
 *   GET  /peers/:ws  — list peers dalam workspace  
 *   POST /notify     — signal: device A baru push ke GAS (1 KV write)
 *   GET  /poll/:ws   — cek: ada data baru? (KV read only, NO write)
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// TTL untuk peer registration (5 menit)
const PEER_TTL = 300;

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      // ─── REGISTER PEER (1 KV write) ───
      if (url.pathname === "/register" && request.method === "POST") {
        const body = await request.json();
        const ws = String(body.workspace_id || "");
        const pid = String(body.peer_id || "");
        const addresses = Array.isArray(body.addresses) ? body.addresses : [];
        const device_name = String(body.device_name || "");

        if (!ws || !pid) {
          return new Response(
            JSON.stringify({ error: "workspace_id and peer_id required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        await env.PUBDESK_PEERS.put(
          `peers:${ws}:${pid}`,
          JSON.stringify({ peer_id: pid, addresses, device_name, ts: Date.now() }),
          { expirationTtl: PEER_TTL }
        );

        return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS });
      }

      // ─── LIST PEERS (KV list + reads) ───
      if (url.pathname.startsWith("/peers/")) {
        const ws = url.pathname.split("/")[2];
        if (!ws) {
          return new Response(
            JSON.stringify({ error: "workspace_id required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        const list = await env.PUBDESK_PEERS.list({ prefix: `peers:${ws}:` });
        const peers = [];
        for (const key of list.keys) {
          const raw = await env.PUBDESK_PEERS.get(key.name);
          if (raw) {
            try { peers.push(JSON.parse(raw)); } catch { /* skip */ }
          }
        }
        return new Response(JSON.stringify(peers), { headers: CORS_HEADERS });
      }

      // ─── NOTIFY — signal "ada data baru di GAS" (1 KV write) ───
      if (url.pathname === "/notify" && request.method === "POST") {
        const body = await request.json();
        const ws = String(body.workspace_id || "");
        const device = String(body.device_id || "");

        if (!ws) {
          return new Response(
            JSON.stringify({ error: "workspace_id required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        const ts = Date.now();
        // 1 KV write — simpan signal
        await env.PUBDESK_PEERS.put(
          `signal:${ws}:last_push`,
          JSON.stringify({ ts, device, at: new Date().toISOString() }),
          { expirationTtl: 3600 } // 1 jam TTL
        );

        return new Response(JSON.stringify({ ok: true, ts }), { headers: CORS_HEADERS });
      }

      // ─── POLL — cek ada data baru? (KV READ only) ───
      if (url.pathname.startsWith("/poll/")) {
        const ws = url.pathname.split("/")[2];
        const device = url.searchParams.get("device") || "";

        if (!ws) {
          return new Response(
            JSON.stringify({ error: "workspace_id required" }),
            { status: 400, headers: CORS_HEADERS }
          );
        }

        // KV read only (NO write — aman limit)
        const raw = await env.PUBDESK_PEERS.get(`signal:${ws}:last_push`);
        let last_push_ts = 0;
        let last_push_device = "";

        if (raw) {
          try {
            const data = JSON.parse(raw);
            last_push_ts = data.ts || 0;
            last_push_device = data.device || "";
          } catch { /* ignore */ }
        }

        // Jangan trigger pull kalau sinyal dari device sendiri
        const has_new_data = last_push_ts > 0 && last_push_device !== device;

        return new Response(JSON.stringify({
          last_push_ts,
          last_push_device,
          has_new_data,
        }), { headers: CORS_HEADERS });
      }

      return new Response(
        JSON.stringify({ usage: "/register | /peers/:ws | /notify | /poll/:ws" }),
        { status: 404, headers: CORS_HEADERS }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  },
};
