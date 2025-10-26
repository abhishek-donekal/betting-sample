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
  
  // For production deployments, use the deployed backend URL
  // This will be set via environment variable in production
  return window.location.origin.replace(/(:\d+)?$/, ':5000');
};

const API_BASE_URL = getApiUrl();

export default API_BASE_URL;

