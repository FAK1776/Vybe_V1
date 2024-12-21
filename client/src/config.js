const config = {
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://vybe-api.sq1776.workers.dev'
    : 'http://localhost:8787'
};

export default config; 