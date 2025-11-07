# ✅ Vercel Settings Checklist

## Critical Settings to Verify

### 1. Root Directory (MOST IMPORTANT!)
**This is usually the problem!**

1. Go to: https://vercel.com/dashboard
2. Click your project: **betting-sample**
3. Go to: **Settings** → **General**
4. Scroll to: **Root Directory**
5. **MUST BE:** `client` (NOT `/` or empty!)
6. If it's wrong, change it to `client` and **Save**

### 2. Build & Development Settings

In the same Settings page, check:

- **Framework Preset:** `Create React App` (or leave blank for auto-detect)
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install` (should be set now via vercel.json)

### 3. Verify vercel.json Location

Make sure `vercel.json` is in the **client** folder:
- ✅ `client/vercel.json` - CORRECT
- ❌ `vercel.json` (root) - WRONG

## Why Install Command Doesn't Auto-Detect

Vercel auto-detects install command by:
1. Finding `package.json` in the Root Directory
2. Running `npm install` automatically

**If Root Directory is wrong, Vercel can't find package.json!**

## Quick Fix Steps

1. **Check Root Directory** (Settings → General)
   - Must be: `client`
   - If wrong, change and save

2. **Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Or wait for automatic deployment from git push

3. **Check Build Logs**
   - Click on the deployment
   - Look for "Installing dependencies" step
   - Should see: `npm install` running
   - Should see: "Installed X packages"

## Still Not Working?

If install command still doesn't run:

1. **Manual Override in Dashboard:**
   - Settings → General → Build & Development Settings
   - Click "Override" next to Install Command
   - Set to: `npm install`
   - Save

2. **Verify package.json exists:**
   - Make sure `client/package.json` exists
   - Should have all dependencies listed

3. **Check deployment logs:**
   - Look for any error messages
   - Share the exact error if it persists

## Expected Build Flow

1. ✅ **Cloning repository**
2. ✅ **Installing dependencies** (`npm install`)
3. ✅ **Building application** (`npm run build`)
4. ✅ **Deploying to Vercel**

If step 2 is missing, Root Directory is likely wrong!

