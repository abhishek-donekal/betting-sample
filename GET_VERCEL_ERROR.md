# How to Get Vercel Error Details

## Step-by-Step to Find the Error

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **betting-sample**

2. **Go to Deployments Tab**
   - Click **"Deployments"** in the top menu
   - Find the latest deployment (should have a red ❌ or yellow 🟡 icon)

3. **Click on the Failed Deployment**
   - Click on the deployment that failed
   - You'll see the build logs

4. **Find the Error**
   - Scroll through the logs
   - Look for lines in **red** or that say "Error:", "Failed:", or "Command exited"
   - The error is usually near the bottom

5. **Copy the Error Message**
   - Select and copy the entire error message
   - Include a few lines before and after for context
   - Share it here

## Common Error Types

### Build Errors
- "Command exited with code X" - Build command failed
- "Module not found" - Missing dependency
- "SyntaxError" - Code error
- "Type error" - TypeScript error

### Configuration Errors
- "Root Directory not found" - Wrong root directory
- "Build output not found" - Wrong output directory
- "Framework not detected" - Framework preset issue

### Dependency Errors
- "npm ERR!" - npm installation failed
- "Package not found" - Missing package
- "Peer dependency" - Version conflict

## Quick Screenshot
If possible, take a screenshot of:
1. The deployment page showing the error
2. The build logs with the red error message

This will help me diagnose the issue quickly!

