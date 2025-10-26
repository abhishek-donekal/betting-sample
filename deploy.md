# Deployment Guide

This guide covers multiple deployment options for the Betting App Demo.

## Option 1: Heroku (Recommended - Easiest)

### Backend Deployment to Heroku

1. **Install Heroku CLI**
   - Download from: https://devcenter.heroku.com/articles/heroku-cli

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd server
   heroku create your-betting-app-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-super-secret-jwt-key-for-production
   heroku config:set NODE_ENV=production
   ```

5. **Deploy Backend**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Open Backend**
   ```bash
   heroku open
   ```

### Frontend Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Update API URL**
   - Edit `client/src/contexts/AuthContext.tsx`
   - Replace `axios.defaults.baseURL = 'http://localhost:5000'` with your Heroku backend URL

3. **Deploy Frontend**
   ```bash
   cd client
   vercel --prod
   ```

## Option 2: Railway (Alternative)

### Backend to Railway

1. **Go to Railway.app**
   - Sign up at https://railway.app

2. **Connect GitHub Repository**
   - Connect your GitHub repo
   - Select the `server` folder as root directory

3. **Set Environment Variables**
   - JWT_SECRET=your-super-secret-jwt-key
   - NODE_ENV=production

4. **Deploy**
   - Railway will automatically deploy when you push to main branch

### Frontend to Vercel

1. **Update API URL in frontend**
   - Use the Railway backend URL

2. **Deploy to Vercel**
   ```bash
   cd client
   vercel --prod
   ```

## Option 3: Netlify + Render

### Backend to Render

1. **Go to Render.com**
   - Sign up at https://render.com

2. **Create New Web Service**
   - Connect GitHub repository
   - Select `server` folder
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Set Environment Variables**
   - JWT_SECRET=your-super-secret-jwt-key
   - NODE_ENV=production

### Frontend to Netlify

1. **Go to Netlify.com**
   - Sign up at https://netlify.com

2. **Connect GitHub Repository**
   - Select `client` folder
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Update API URL**
   - Use the Render backend URL

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Frontend
Update the API base URL in `client/src/contexts/AuthContext.tsx`:
```typescript
axios.defaults.baseURL = 'https://your-backend-url.herokuapp.com';
```

## Database Considerations

The app uses SQLite which is file-based. For production, consider:

1. **SQLite (Current)**
   - Good for demo/small apps
   - Data persists on Heroku but may reset on dyno restart

2. **PostgreSQL (Recommended for Production)**
   - More robust for production
   - Heroku Postgres addon available
   - Requires code changes to use pg instead of sqlite3

## Quick Start Commands

### Local Development
```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend
npm run dev
```

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start backend
cd ../server
npm start
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure backend CORS is configured for your frontend domain
   - Update CORS origin in `server/index.js`

2. **Database Issues**
   - SQLite file may not persist on some platforms
   - Consider upgrading to PostgreSQL for production

3. **Environment Variables**
   - Make sure all required env vars are set in production
   - Check Heroku config: `heroku config`

4. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json

### Health Check

Test your deployment:
```bash
# Test backend
curl https://your-backend-url.herokuapp.com/api/profile

# Test frontend
# Visit your frontend URL and try to register/login
```

## Security Notes

1. **Change JWT Secret**
   - Use a strong, random JWT secret in production
   - Never commit secrets to version control

2. **HTTPS Only**
   - All production deployments should use HTTPS
   - Most platforms provide this automatically

3. **Environment Variables**
   - Store sensitive data in environment variables
   - Never hardcode secrets in your code

## Monitoring

1. **Heroku Logs**
   ```bash
   heroku logs --tail
   ```

2. **Vercel Analytics**
   - Available in Vercel dashboard

3. **Railway Logs**
   - Available in Railway dashboard

## Scaling Considerations

1. **Database**
   - Upgrade to PostgreSQL for better performance
   - Consider database connection pooling

2. **Caching**
   - Add Redis for session storage
   - Implement API response caching

3. **CDN**
   - Use CloudFlare or similar for static assets
   - Vercel provides this automatically

---

Choose the deployment option that best fits your needs. Heroku + Vercel is recommended for beginners due to ease of setup.


