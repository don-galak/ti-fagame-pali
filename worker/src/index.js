// Share API for Ti fagame pali.
//
//   POST /share      body: { eaters, foodInfo }  ->  201 { id }
//   GET  /share/:id                              ->  200 { eaters, foodInfo } | 404
//
// Bills live in Workers KV and expire on their own after TTL_SECONDS.

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const ID_LENGTH = 8;
const MAX_BODY_BYTES = 20_000;
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const ID_PATH = new RegExp(`^/share/([a-z0-9]{${ID_LENGTH}})$`);

export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

export function isValidBill(bill) {
  return (
    bill !== null &&
    typeof bill === "object" &&
    Array.isArray(bill.eaters) &&
    bill.eaters.every((e) => typeof e === "string") &&
    Array.isArray(bill.foodInfo) &&
    bill.foodInfo.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof item.food === "string" &&
        Number.isFinite(Number(item.price)) &&
        Array.isArray(item.people)
    )
  );
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins(env).includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });

async function createShare(request, env, cors) {
  // Only the app's own pages may create links.
  const origin = request.headers.get("Origin");
  if (!origin || !allowedOrigins(env).includes(origin)) {
    return json({ error: "Origin not allowed" }, 403, cors);
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
    return json({ error: "Bill is too large" }, 413, cors);
  }

  let bill;
  try {
    bill = JSON.parse(body);
  } catch {
    return json({ error: "Body must be JSON" }, 400, cors);
  }
  if (!isValidBill(bill)) {
    return json({ error: "Invalid bill" }, 400, cors);
  }

  const stored = JSON.stringify({ eaters: bill.eaters, foodInfo: bill.foodInfo });

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    if ((await env.SHARES.get(id)) !== null) continue; // extremely unlikely
    await env.SHARES.put(id, stored, { expirationTtl: TTL_SECONDS });
    return json({ id }, 201, cors);
  }
  return json({ error: "Could not create a link, try again" }, 500, cors);
}

async function readShare(id, env, cors) {
  const stored = await env.SHARES.get(id);
  if (stored === null) {
    return json({ error: "Not found" }, 404, cors);
  }
  return new Response(stored, {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method === "POST" && pathname === "/share") {
      return createShare(request, env, cors);
    }
    const match = pathname.match(ID_PATH);
    if (request.method === "GET" && match) {
      return readShare(match[1], env, cors);
    }
    return json({ error: "Not found" }, 404, cors);
  },
};
