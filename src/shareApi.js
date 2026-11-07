// Talks to the share Worker (see worker/). The URL comes from
// VITE_SHARE_API_URL in .env.development / .env.production.

const SHORT_ID = /^[a-z0-9]{8}$/;

export class ShareNotFoundError extends Error {}

const apiUrl = () =>
  (import.meta.env.VITE_SHARE_API_URL ?? "").replace(/\/+$/, "");

export const isShortId = (value) => SHORT_ID.test(value);

export async function saveBill(bill) {
  if (!apiUrl()) throw new Error("VITE_SHARE_API_URL is not set");
  const response = await fetch(`${apiUrl()}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bill),
  });
  if (!response.ok) throw new Error(`Share API returned ${response.status}`);
  const { id } = await response.json();
  if (!isShortId(id)) throw new Error("Share API returned an invalid id");
  return id;
}

export async function loadBill(id) {
  const response = await fetch(`${apiUrl()}/share/${id}`);
  if (response.status === 404) throw new ShareNotFoundError();
  if (!response.ok) throw new Error(`Share API returned ${response.status}`);
  return response.json();
}
