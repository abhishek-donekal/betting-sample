# 🚀 Quick Deployment Guide

## Deploy Backend to Render (FREE)

### Step 1: Deploy Backend
1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select repository: `abhishek-donekal/betting-sample`
4. Configure:
   - **Name**: `betting-app-backend`
   - **Environment**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **"Advanced"** and add Environment Variables:
   ```
   JWT_SECRET=your-super-secret-key-change-this-12345
   PORT=5000
   NODE_ENV=production
   ```
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. **Copy your backend URL** (e.g., `https://betting-app-backend.onrender.com`)

### Step 2: Update GitHub Secret
1. Go to: https://github.com/abhishek-donekal/betting-sample/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `REACT_APP_API_URL`
4. Value: Your Render backend URL (e.g., `https://betting-app-backend.onrender.com`)
5. Click **"Add secret"**

### Step 3: Enable GitHub Pages
1. Go to: https://github.com/abhishek-donekal/betting-sample/settings/pages
2. Under **"Source"**, select: **"GitHub Actions"**
3. Save

### Step 4: Trigger Deployment
The GitHub Actions workflow will automatically run and deploy your frontend!

## Your App URLs

- **Frontend**: https://abhishek-donekal.github.io/betting-sample
- **Backend**: https://your-backend-url.onrender.com

## Test Your Deployment

1. Visit your frontend URL
2. Register a new user
3. Login and start betting!

## Alternative: Railway (Easier, but requires credit card)

1. Go to https://railway.app
2. Sign up (free tier available)
3. New Project → Deploy from GitHub
4. Select your repo
5. Add Service → Select `server` folder
6. Add environment variables
7. Deploy!

---

**Need help?** Check the Actions tab for deployment logs.

