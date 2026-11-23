/**
 * Authoritative API base URL
 * - In Vercel / Production: Uses relative '/api' on the same domain or custom VITE_API_URL
 * - In Local Development: Falls back to '/api' (proxied by Vite) or configured VITE_API_URL
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
