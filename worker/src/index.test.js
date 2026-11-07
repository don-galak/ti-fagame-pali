// @vitest-environment node
import { describe, expect, it } from "vitest";
import worker, { isValidBill, newId } from "./index.js";

const ORIGIN = "https://don-galak.github.io";
const BILL = {
  eaters: ["Maria", "Nikos"],
  foodInfo: [{ food: "Pizza", price: 12, people: ["Maria", "Nikos"] }],
};

// In-memory stand-in for the KV namespace.
const makeEnv = () => {
  const store = new Map();
  return {
    ALLOWED_ORIGINS: `${ORIGIN}, http://localhost:3000`,
    SHARES: {
      get: async (key) => (store.has(key) ? store.get(key).value : null),
      put: async (key, value, options) => store.set(key, { value, options }),
    },
    store,
  };
};

const post = (env, body, origin = ORIGIN) =>
  worker.fetch(
    new Request("https://api.test/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(origin ? { Origin: origin } : {}),
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    env
  );

const get = (env, path, origin = ORIGIN) =>
  worker.fetch(
    new Request(`https://api.test${path}`, { headers: { Origin: origin } }),
    env
  );

describe("share worker", () => {
  it("stores a bill and returns it by id", async () => {
    const env = makeEnv();
    const created = await post(env, BILL);
    expect(created.status).toBe(201);
    expect(created.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);

    const { id } = await created.json();
    expect(id).toMatch(/^[a-z0-9]{8}$/);

    const read = await get(env, `/share/${id}`);
    expect(read.status).toBe(200);
    expect(await read.json()).toEqual(BILL);
  });

  it("lets stored bills expire after 30 days", async () => {
    const env = makeEnv();
    const { id } = await (await post(env, BILL)).json();
    expect(env.store.get(id).options).toEqual({
      expirationTtl: 60 * 60 * 24 * 30,
    });
  });

  it("only keeps the bill fields", async () => {
    const env = makeEnv();
    const { id } = await (await post(env, { ...BILL, extra: "x".repeat(50) })).json();
    expect(JSON.parse(env.store.get(id).value)).toEqual(BILL);
  });

  it("accepts the local dev server as an origin", async () => {
    const res = await post(makeEnv(), BILL, "http://localhost:3000");
    expect(res.status).toBe(201);
  });

  it("refuses to create links for other sites", async () => {
    expect((await post(makeEnv(), BILL, "https://evil.example")).status).toBe(403);
    expect((await post(makeEnv(), BILL, null)).status).toBe(403);
  });

  it("rejects bodies that aren't a valid bill", async () => {
    const env = makeEnv();
    expect((await post(env, "not json")).status).toBe(400);
    expect((await post(env, { eaters: ["Maria"] })).status).toBe(400);
    expect(
      (await post(env, { eaters: [1], foodInfo: [] })).status
    ).toBe(400);
    expect(env.store.size).toBe(0);
  });

  it("rejects bills that are too large", async () => {
    const env = makeEnv();
    const huge = { eaters: ["x".repeat(25_000)], foodInfo: [] };
    expect((await post(env, huge)).status).toBe(413);
  });

  it("returns 404 for unknown ids and unknown routes", async () => {
    const env = makeEnv();
    expect((await get(env, "/share/abcd1234")).status).toBe(404);
    expect((await get(env, "/share/NOT-AN-ID")).status).toBe(404);
    expect((await get(env, "/")).status).toBe(404);
  });

  it("answers CORS preflight requests", async () => {
    const res = await worker.fetch(
      new Request("https://api.test/share", {
        method: "OPTIONS",
        headers: { Origin: ORIGIN },
      }),
      makeEnv()
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});

describe("helpers", () => {
  it("generates 8-character lowercase ids", () => {
    const ids = new Set(Array.from({ length: 200 }, newId));
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]{8}$/);
    expect(ids.size).toBe(200);
  });

  it("validates bills, including old links with string prices", () => {
    expect(isValidBill(BILL)).toBe(true);
    expect(
      isValidBill({
        eaters: ["Maria"],
        foodInfo: [{ food: "Pizza", price: "12", people: [] }],
      })
    ).toBe(true);
    expect(isValidBill(null)).toBe(false);
    expect(
      isValidBill({ eaters: [], foodInfo: [{ food: "Pizza", price: "abc", people: [] }] })
    ).toBe(false);
  });
});
