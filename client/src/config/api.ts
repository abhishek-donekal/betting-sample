// API Configuration
const getApiUrl = () => {
  // Check for production environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // If running on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // For GitHub Pages or Vercel, use environment variable or default backend URL
  if (window.location.hostname.includes('github.io') || window.location.hostname.includes('vercel.app')) {
    // Return environment variable or placeholder
    return process.env.REACT_APP_API_URL || 'https://your-backend-url.herokuapp.com';
  }
  
  // For other production deployments
  return window.location.origin.replace(/(:\d+)?$/, ':5000');
};

const API_BASE_URL = getApiUrl();

export default API_BASE_URL;

