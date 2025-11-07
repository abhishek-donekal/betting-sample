# 🔧 Fix for Vercel Build Error 127

## The Problem
Error 127 means "command not found" - Vercel can't find `react-scripts`.

## The Solution

### Option 1: Update Vercel Project Settings (Recommended)

1. Go to your Vercel dashboard
2. Click on your project: **betting-sample**
3. Go to **Settings** → **General**
4. Scroll to **Build & Development Settings**

**Update these settings:**

- **Root Directory:** `client` ✅ (should already be set)
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`
- **Framework Preset:** `Create React App`

5. Click **Save**

6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment
8. Or push a new commit to trigger a new deployment

### Option 2: Check Root Directory

**IMPORTANT:** Make sure Root Directory is set to `client` (not `/` or empty)

1. Settings → General → Root Directory
2. Should be: `client`
3. If it's `/`, change it to `client` and save

### Option 3: Manual Fix in Vercel Dashboard

If the above doesn't work:

1. Go to **Settings** → **General**
2. Under **Build & Development Settings**, click **Override**
3. Set:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
4. Save and redeploy

## Why This Happens

Error 127 occurs when:
- Dependencies aren't installed (node_modules missing)
- Build command runs before `npm install`
- Root directory is wrong
- Package.json is in wrong location

## Verification

After updating settings, check the deployment logs:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check the **Build Logs**
4. You should see:
   - ✅ `npm install` running
   - ✅ Installing dependencies
   - ✅ `npm run build` running
   - ✅ Build successful

## Still Not Working?

If it still fails:
1. Check if `package-lock.json` exists in `client/` folder
2. Make sure `react-scripts` is in `package.json` dependencies
3. Try deleting `node_modules` locally and running `npm install` in client folder
4. Commit and push the updated `package-lock.json`

