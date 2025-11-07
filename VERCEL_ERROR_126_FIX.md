# Fix Vercel Error 126 - Command Cannot Execute

## The Problem
Error 126 means "Command invoked cannot execute" - `npm run build` can't be executed.

## Most Common Cause: Wrong Root Directory

**This is almost always the issue!**

### Fix Root Directory in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Click your project: **betting-sample**
3. Go to: **Settings** → **General**
4. Find: **Root Directory**
5. **MUST BE:** `client` (NOT `/` or empty!)
6. If it's wrong:
   - Change it to: `client`
   - Click **Save**
   - Redeploy

## Why Error 126 Happens

When Root Directory is wrong:
- Vercel runs commands from the wrong folder
- Can't find `package.json`
- Can't find `node_modules`
- `npm` command fails with error 126

## Solution 1: Remove buildCommand from vercel.json

I've removed `buildCommand` from `vercel.json`. Vercel will:
- Auto-detect Create React App
- Use the `build` script from `package.json`
- Run `npm run build` automatically

## Solution 2: Manual Fix in Dashboard

If auto-detect doesn't work:

1. **Settings** → **General** → **Build & Development Settings**
2. Click **"Override"** to enable custom settings
3. Set:
   - **Root Directory:** `client` ⚠️ CRITICAL!
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** (leave empty for auto-detect)
   - **Framework Preset:** `Create React App`
4. Click **Save**
5. **Redeploy**

## Solution 3: Verify File Structure

Make sure your files are in the right place:
```
betting-sample/
├── client/
│   ├── package.json ✅
│   ├── package-lock.json ✅
│   ├── vercel.json ✅
│   └── src/
└── server/
```

## Verification Checklist

Before redeploying, verify:

- [ ] Root Directory = `client` in Vercel dashboard
- [ ] `client/package.json` exists
- [ ] `client/package-lock.json` exists
- [ ] `client/vercel.json` exists
- [ ] `package.json` has `"build": "react-scripts build"` script
- [ ] `package.json` has `react-scripts` in dependencies

## After Fixing

1. **Redeploy** in Vercel dashboard
2. **Check build logs** - should see:
   - ✅ "Installing dependencies"
   - ✅ "Building application"
   - ✅ "Build completed"

## Still Not Working?

If error 126 persists:
1. Share the full build log from Vercel
2. Verify Root Directory is exactly `client` (case-sensitive)
3. Try deleting the project and re-importing from GitHub

