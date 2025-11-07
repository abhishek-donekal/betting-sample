# 🔧 GitHub Pages Deployment Troubleshooting

## Quick Checklist

### ✅ Step 1: Verify GitHub Pages is Enabled
1. Go to: https://github.com/abhishek-donekal/betting-sample/settings/pages
2. **Source** must be set to: **"GitHub Actions"** (NOT "Deploy from a branch")
3. If you see "Your site is live at...", that's good!
4. If you see "GitHub Actions" option, select it and save

### ✅ Step 2: Check Workflow Status
1. Go to: https://github.com/abhishek-donekal/betting-sample/actions
2. Look for "Deploy to GitHub Pages" workflow
3. Click on the latest run to see details
4. Check if it's:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed (check logs)
   - 🟡 Yellow circle = Running

### ✅ Step 3: Common Errors & Fixes

#### Error: "Workflow not found" or "No workflows"
**Fix:** 
- Make sure `.github/workflows/deploy.yml` exists in your repo
- Check that you're on the `master` branch
- Try pushing again: `git push origin master`

#### Error: "Build failed" or "npm install failed"
**Fix:**
- Check the Actions logs for specific error
- Common issues:
  - Missing `package-lock.json` → Run `npm install` in client folder locally
  - Node version mismatch → Already set to Node 18
  - Network issues → Retry the workflow

#### Error: "Permission denied" or "pages: write"
**Fix:**
- Go to: Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"
- Save

#### Error: "No deployment found" or "Deploy job skipped"
**Fix:**
- Make sure GitHub Pages source is set to "GitHub Actions"
- The deploy job only runs if build succeeds
- Check build job logs first

#### Error: "Build directory not found"
**Fix:**
- The build step failed before creating the directory
- Check build logs for TypeScript/compilation errors
- Try building locally: `cd client && npm run build`

#### Error: "404 on site" or "Page not found"
**Fix:**
- Wait 5-10 minutes after deployment (DNS propagation)
- Clear browser cache
- Check that `.nojekyll` file exists in build
- Verify the URL: `https://abhishek-donekal.github.io/betting-sample`

## Manual Steps to Fix

### Option 1: Re-enable GitHub Pages
1. Go to Settings → Pages
2. Change source to "None" (disable)
3. Save
4. Change back to "GitHub Actions"
5. Save again

### Option 2: Manually Trigger Workflow
1. Go to: https://github.com/abhishek-donekal/betting-sample/actions
2. Click "Deploy to GitHub Pages" in left sidebar
3. Click "Run workflow" button
4. Select "master" branch
5. Click "Run workflow"

### Option 3: Check Repository Settings
1. Settings → Actions → General
2. Ensure "Allow all actions and reusable workflows" is enabled
3. Under "Workflow permissions", select "Read and write permissions"
4. Save

## Still Not Working?

### Get Detailed Error Info
1. Go to Actions tab
2. Click on the failed workflow
3. Click on the failed job (red X)
4. Expand each step to see error messages
5. Copy the error message and share it

### Alternative: Use Vercel (Easier)
If GitHub Pages continues to fail, Vercel is often easier:
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import repository
4. Set root directory to `client`
5. Deploy!

## Test Locally First
Before deploying, test the build locally:
```bash
cd client
npm install
npm run build
```
If this fails, fix the errors first before deploying.

