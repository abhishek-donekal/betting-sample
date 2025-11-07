# Fix Vercel Install Command Issue

## The Problem
Vercel install command not working - dependencies not installing.

## Solutions

### Solution 1: Let Vercel Auto-Detect (Recommended)
I've removed the custom `installCommand` from `vercel.json`. Vercel will automatically:
- Detect `package.json` in the `client` folder
- Run `npm install` automatically
- This is the most reliable method

### Solution 2: Manual Fix in Vercel Dashboard

If Solution 1 doesn't work:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click your project: **betting-sample**

2. **Go to Settings → General**
   - Scroll to **Build & Development Settings**

3. **Override Install Command**
   - Click **"Override"** next to Install Command
   - Set to: `npm install`
   - Or try: `npm ci` (if package-lock.json exists)
   - Click **Save**

4. **Verify Root Directory**
   - Make sure **Root Directory** is set to: `client`
   - This is CRITICAL!

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment

### Solution 3: Check Root Directory

**Most Common Issue:** Root Directory is wrong!

1. Settings → General → Root Directory
2. Should be: `client` (NOT `/` or empty)
3. If wrong, change it to `client` and save
4. Redeploy

### Solution 4: Verify package.json Location

Make sure `package.json` is in the `client` folder:
- ✅ `client/package.json` - CORRECT
- ❌ `package.json` (root) - WRONG

## Why Install Command Fails

Common reasons:
1. **Root Directory wrong** - Vercel can't find package.json
2. **package-lock.json missing** - Run `npm install` locally and commit it
3. **Network issues** - Rare, but can happen
4. **Node version mismatch** - Vercel uses Node 18 by default (should be fine)

## Verification Steps

After fixing:

1. Check deployment logs in Vercel
2. Look for "Installing dependencies" step
3. Should see: `npm install` or `npm ci` running
4. Should see: "Installed X packages"
5. Then: "Building..." step should start

## Still Not Working?

If install still fails:
1. Share the exact error from Vercel build logs
2. Check if Root Directory is `client`
3. Verify `package.json` exists in `client/` folder
4. Try removing `installCommand` entirely (let Vercel auto-detect)

