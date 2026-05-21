// Reads Vite env vars. Toggle USE_MOCK via VITE_USE_MOCK=true|false in .env.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true';

// Some backends (the upstream Vercel deployment) don't expose the Excel
// export endpoint. Default to off so the button hides; flip to "true" when
// running against a backend that has it.
export const FEATURE_EXPORT =
  (import.meta.env.VITE_FEATURE_EXPORT ?? 'false').toLowerCase() === 'true';
