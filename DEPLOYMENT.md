# Deployment Guide for GitHub Pages

This guide explains how to deploy the betting app frontend to GitHub Pages.

## Prerequisites

1. Your code is already pushed to GitHub (✅ Done)
2. You have a backend server deployed somewhere (Heroku, Railway, Render, etc.)

## Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/abhishek-donekal/betting-sample
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Save the settings

## Step 2: Set Backend URL (Optional but Recommended)

If you have a backend deployed, set it as a GitHub secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `REACT_APP_API_URL`
4. Value: Your backend URL (e.g., `https://your-app.herokuapp.com`)
5. Click **Add secret**

This will be used during the build process to configure the API endpoint.

## Step 3: Trigger Deployment

The GitHub Actions workflow will automatically run when you:
- Push to the `master` branch
- Or manually trigger it from the **Actions** tab

## Step 4: Access Your App

Once deployed, your app will be available at:
**https://abhishek-donekal.github.io/betting-sample**

## Backend Deployment

Since GitHub Pages only hosts static files, you need to deploy your backend separately. Options:

### Option 1: Heroku
```bash
cd server
heroku create your-app-name
git subtree push --prefix server heroku main
```

### Option 2: Railway
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub
4. Select the `server` folder

### Option 3: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`

## Troubleshooting

### App shows but API calls fail
- Make sure you've set the `REACT_APP_API_URL` secret with your backend URL
- Check that your backend CORS settings allow requests from `https://abhishek-donekal.github.io`

### 404 errors on page refresh
- The `404.html` file handles this, but make sure it's in the `client/public/` folder

### Build fails
- Check the Actions tab for error logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
cd client
npm install
npm run build
# Then upload the build folder contents to GitHub Pages
```

