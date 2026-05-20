// Reads Vite env vars. Toggle USE_MOCK via VITE_USE_MOCK=true|false in .env.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() === 'true';
