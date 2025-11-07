# Free Cloud Deployment Guide

## Quickest: Railway + Vercel (Both Free)

### Step 1: Deploy Backend to Railway

1. **Sign up at Railway**: https://railway.app
2. **Create new project** → **Deploy from GitHub**
3. **Select this repository**
4. **Configure Service**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Watch Paths: `server/**`
5. **Set Environment Variables**:
   ```
   JWT_SECRET=your-super-secret-jwt-key-12345
   PORT=5000
   ```
6. Railway will auto-deploy and give you a URL like: `https://your-app.railway.app`
7. **Copy this URL** - you'll need it for the frontend

### Step 2: Deploy Frontend to Vercel

1. **Sign up at Vercel**: https://vercel.com
2. **Create new project** → **Import from GitHub**
3. **Select this repository**
4. **Configure Project**:
   - Framework Preset: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. **Add Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
6. Click **Deploy**
7. Get your frontend URL: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

Edit `server/index.js` around line 17:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  credentials: true
}));
```

## Alternative: Render (All Free)

### Backend on Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Settings:
   - Name: `betting-app-backend`
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Root Directory: `server`
5. Add environment variables
6. Deploy

### Frontend on Netlify

1. Go to https://netlify.com
2. New site from Git
3. Connect GitHub
4. Settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
6. Deploy

## Alternative: Cyclic.sh (Simplest)

### Full Stack on Cyclic

1. Go to https://cyclic.sh
2. Connect GitHub
3. Choose this repo
4. Add environment variables
5. Click Deploy
6. Done! One URL for everything

## Environment Variables Needed

### Backend
```
JWT_SECRET=your-secret-key-here
PORT=5000
```

### Frontend
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## Free Hosting Comparison

| Platform | Backend | Frontend | Database | Easiest |
|----------|---------|----------|----------|---------|
| Railway | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| Render | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| Vercel | ❌ | ✅ | ❌ | ⭐⭐ |
| Netlify | ❌ | ✅ | ❌ | ⭐⭐ |
| Cyclic | ✅ | ❌ | ✅ | ⭐⭐⭐⭐ |

## Recommended: Railway + Vercel

**Why?**
- Railway: $5/month free tier, generous limits
- Vercel: Best React hosting, super fast
- Both integrate with GitHub
- Auto-deploy on push
- HTTPS included
- Free forever for small projects

## One-Click Deploy Commands

### Railway Backend
```bash
# Login
railway login

# Deploy
cd server
railway link
railway up
```

### Vercel Frontend
```bash
# Login
npm install -g vercel
vercel login

# Deploy
cd client
vercel --prod
```

## After Deployment

1. Test your backend: `https://your-app.railway.app/api/register`
2. Test your frontend: Visit your Vercel URL
3. Register a new user
4. Login as admin (username: `admin`, password: `admin123`)

## Troubleshooting

### CORS Errors
- Add your frontend URL to CORS origins in `server/index.js`

### Database Issues
- SQLite works but data may reset
- For production: Upgrade to PostgreSQL

### Build Errors
- Check Node.js version (14+ required)
- Ensure all dependencies are in package.json

## Cost Breakdown

All options are **FREE** for:
- Personal projects
- Small websites
- Learning/demos
- Prototypes

Upgrade to paid when you need:
- More resources
- Custom domains
- Production support
- High traffic

---

**Recommended Setup**: Railway (Backend) + Vercel (Frontend)
Both platforms are free, easy to use, and production-ready!
