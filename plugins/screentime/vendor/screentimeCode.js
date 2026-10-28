/**
 * Mint screentime credit codes (Node 18+, ESM, no dependencies).
 *
 * SERVER-SIDE ONLY: never ship the secret to a browser or app bundle, or a
 * kid can mint unlimited codes. kid must be a pool name from config.yaml;
 * minutes 1-240 (the screentime server rejects anything else).
 *
 * Format: <minutes>-<nonce>-<sig>
 *   nonce = 6 random chars of A-Z2-7, single use
 *   sig   = base32(HMAC-SHA256(secret, "<kid>:<minutes>:<nonce>"))[:8]
 *
 * Test vector: sign("test-secret", "jayden", 15, "ABCDEF") === "YB4NJCA4"
 *   -> code 15-ABCDEF-YB4NJCA4
 *
 * CLI: node screentimeCode.js <secret> <kid> <minutes> [nonce]
 */
import { createHmac, randomInt } from "node:crypto";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const CLAIM_BASE = "http://screentime.lan/claim";

/** @param {Uint8Array} buf @returns {string} */
function base32(buf) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = ((value << 8) | byte) & 0xfff; // keep only the bits not yet emitted
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out; // trailing partial group unused: we only take 8 chars
}

/**
 * @param {string} secret @param {string} kid
 * @param {number} minutes @param {string} nonce
 * @returns {string}
 */
export function sign(secret, kid, minutes, nonce) {
  const mac = createHmac("sha256", secret).update(`${kid}:${minutes}:${nonce}`).digest();
  return base32(mac).slice(0, 8);
}

/**
 * @param {string} secret @param {string} kid @param {number} minutes
 * @param {string} [nonce] fixed nonce, for tests only
 * @returns {string}
 */
export function makeCode(secret, kid, minutes, nonce) {
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
    throw new RangeError("minutes must be an integer 1-240");
  }
  const n = nonce ?? Array.from({ length: 6 }, () => B32[randomInt(32)]).join("");
  return `${minutes}-${n}-${sign(secret, kid, minutes, n)}`;
}

/** @param {string} kid @param {string} code @returns {string} */
export function claimUrl(kid, code) {
  return `${CLAIM_BASE}?${new URLSearchParams({ kid, code })}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [secret, kid, minutes, nonce] = process.argv.slice(2);
  if (!minutes) {
    console.error("usage: node screentimeCode.js <secret> <kid> <minutes> [nonce]");
    process.exit(1);
  }
  const code = makeCode(secret, kid, Number(minutes), nonce);
  console.log(code);
  console.log(claimUrl(kid, code));
}
