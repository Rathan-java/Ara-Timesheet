// Reads Vite env vars. Toggle USE_MOCK via VITE_USE_MOCK=true|false in .env.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true';

// Azure backend now exposes /api/export/tasks.xlsx (PR #6), so the button
// is on by default. Set VITE_FEATURE_EXPORT=false in the env to hide it
// when pointing at a backend that lacks the endpoint.
export const FEATURE_EXPORT =
  (import.meta.env.VITE_FEATURE_EXPORT ?? 'true').toLowerCase() === 'true';
