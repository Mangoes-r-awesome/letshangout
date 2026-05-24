// Avoids visually ambiguous chars (0/O, 1/I/l) so codes are easy to read out loud.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateShortCode(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return out;
}

/** Returns the public URL for a hangout deep link. */
export function hangoutDeepLink(shortCode: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://hangouts.app";
  return `${base}/h/${shortCode}`;
}
