// Credentials are stored as SHA-256 hashes — never as plaintext.
// Default: username = workshop  /  password = GlobeLife
// To change: run `node -e "require('crypto').createHash('sha256').update('yourvalue').digest('hex') |> console.log"` and replace the hashes below.
// Then redeploy. Optionally set VITE_USERNAME_HASH and VITE_PASSWORD_HASH as GitHub repo secrets and
// reference them in vite.config.js define{} to avoid committing hashes to source.

export const USERNAME_HASH = import.meta.env.VITE_USERNAME_HASH ||
  'ad15e8b1e00bdf1b72129f8152cca4c12e5880c381d3da03773714959bd458ab'

export const PASSWORD_HASH = import.meta.env.VITE_PASSWORD_HASH ||
  '6404b98400919dcb1807f57fa3dd2b4eead57045f66d313f738301d8ffbc2def'

const SESSION_KEY = 'bob-lab-auth'

export async function sha256(str) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(str)
  )
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkCredentials(username, password) {
  const [uHash, pHash] = await Promise.all([sha256(username), sha256(password)])
  return uHash === USERNAME_HASH && pHash === PASSWORD_HASH
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function setAuthenticated() {
  sessionStorage.setItem(SESSION_KEY, 'true')
}

export function clearAuthenticated() {
  sessionStorage.removeItem(SESSION_KEY)
}
