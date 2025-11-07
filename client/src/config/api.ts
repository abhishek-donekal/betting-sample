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
  
  // For GitHub Pages or other static hosting, use a separate backend URL
  // Default to a placeholder - update this with your actual backend URL
  // You can set REACT_APP_API_URL as a GitHub secret in the workflow
  if (window.location.hostname.includes('github.io')) {
    // Return a placeholder - user needs to set REACT_APP_API_URL secret
    return process.env.REACT_APP_API_URL || 'https://your-backend-url.herokuapp.com';
  }
  
  // For other production deployments
  return window.location.origin.replace(/(:\d+)?$/, ':5000');
};

const API_BASE_URL = getApiUrl();

export default API_BASE_URL;

