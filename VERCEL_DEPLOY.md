# 🚀 Deploy to Vercel - Step by Step Guide

## Quick Deploy (5 minutes)

### Step 1: Sign Up / Login to Vercel
1. Go to: https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Repository
1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find and click **"betting-sample"** repository
4. Click **"Import"**

### Step 3: Configure Project Settings
Vercel should auto-detect your React app, but verify these settings:

**Framework Preset:** `Create React App` (should be auto-detected)

**Root Directory:** 
- Click **"Edit"** next to Root Directory
- Change from `/` to `client`
- Click **"Continue"**

**Build and Output Settings:**
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `build` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

### Step 4: Add Environment Variables (Optional)
If you have a backend deployed, add it here:

1. Scroll down to **"Environment Variables"**
2. Click **"Add"**
3. **Key:** `REACT_APP_API_URL`
4. **Value:** Your backend URL (e.g., `https://your-backend.onrender.com`)
5. Click **"Add"**

### Step 5: Deploy!
1. Click **"Deploy"** button (bottom right)
2. Wait 2-3 minutes for deployment
3. You'll see a success message with your live URL!

## Your App Will Be Live At:
**https://betting-sample-[random].vercel.app**

Or you can set a custom domain later!

## After Deployment

### Update Backend CORS (if you have a backend)
If you deployed a backend, update its CORS settings to allow your Vercel URL:

```javascript
// In server/index.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'  // Add your Vercel URL here
  ],
  credentials: true
}));
```

### Automatic Deployments
- Every push to `master` branch = automatic deployment
- Vercel creates a preview for every pull request
- All deployments are free!

## Troubleshooting

### Build Fails
- Check the deployment logs in Vercel dashboard
- Make sure Root Directory is set to `client`
- Verify all dependencies are in `package.json`

### App Shows but API Calls Fail
- Add `REACT_APP_API_URL` environment variable in Vercel
- Update backend CORS to include your Vercel URL

### 404 Errors on Routes
- The `vercel.json` file handles this automatically
- If issues persist, check the rewrites configuration

## Benefits of Vercel
✅ **Free forever** for personal projects  
✅ **No billing required**  
✅ **Automatic HTTPS**  
✅ **Global CDN** (super fast!)  
✅ **Automatic deployments** on git push  
✅ **Preview deployments** for PRs  
✅ **Custom domains** support  

## Next Steps
1. Deploy your backend (Render, Railway, or Heroku)
2. Add backend URL as `REACT_APP_API_URL` in Vercel
3. Update backend CORS settings
4. Share your live app URL!

---

**Need help?** Check Vercel dashboard → Your Project → Deployments → View logs

