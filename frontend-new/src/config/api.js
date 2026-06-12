// Central API base URL — reads from .env (VITE_API_URL)
// In development: http://localhost:5000
// In production: https://vizo-tech.vercel.app
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
