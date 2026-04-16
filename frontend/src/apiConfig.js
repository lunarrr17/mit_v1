/**
 * Base URL for auth gateway requests.
 * - Dev (Vite): same-origin proxy at /auth-gateway → strips to Flask on :5002
 * - Prod / preview: direct http://127.0.0.1:5002 unless VITE_AUTH_GATEWAY_URL is set
 *
 * VITE_AUTH_GATEWAY_URL must be the server root only, e.g. http://127.0.0.1:5002
 * (not .../auth-gateway — that caused Flask 404s).
 */
export function getAuthGatewayBase() {
  let raw = import.meta.env.VITE_AUTH_GATEWAY_URL?.trim();
  if (raw) {
    raw = raw.replace(/\/$/, '');
    if (raw.endsWith('/auth-gateway')) {
      raw = raw.slice(0, -'/auth-gateway'.length);
    }
    return raw;
  }
  if (import.meta.env.DEV) {
    return '/auth-gateway';
  }
  return 'http://127.0.0.1:5002';
}
