// Each device gets one random token, kept in localStorage. Claims store only
// its SHA-256 hash, so this token is the proof that a claim came from here —
// it lets a guest un-claim their own pick without any account.

const KEY = 'baby-registry-claim-token';

export function getClaimToken(): string {
  let token = localStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(KEY, token);
  }
  return token;
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
