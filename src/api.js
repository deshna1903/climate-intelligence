// Use one configurable backend for all dashboard pages.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://climateiq-backend.onrender.com").replace(/\/$/, "");
