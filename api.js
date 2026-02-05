const isProduction = process.env.NODE_ENV === 'production';

// Use your deployed server URL in production and localhost for development
const API_URL = isProduction
  ? 'https://mygarage-server.onrender.com'
  : 'http://localhost:8080';

export default API_URL;
