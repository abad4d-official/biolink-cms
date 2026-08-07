// Pages Function — jalan otomatis di /api/blocks
// Butuh KV binding bernama "BLOCKS_KV" dan env var "ADMIN_PASSWORD" (set di dashboard Cloudflare Pages)

export async function onRequestGet({ env }) {
  const data = await env.BLOCKS_KV.get("blocks");
  return new Response(data || "[]", {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}

export async function onRequestPost({ request, env }) {
  const token = request.headers.get("x-admin-token");

  if (!env.ADMIN_PASSWORD || token !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Password salah" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  const body = await request.text();

  try {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) throw new Error("Harus berupa array");
  } catch (e) {
    return new Response(JSON.stringify({ error: "Format data tidak valid" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  await env.BLOCKS_KV.put("blocks", body);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}