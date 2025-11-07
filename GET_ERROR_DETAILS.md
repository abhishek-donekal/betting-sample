# How to Get Error Details

## Step-by-Step to Find the Error

1. **Go to Actions Tab**
   - Visit: https://github.com/abhishek-donekal/betting-sample/actions

2. **Find the Failed Workflow**
   - Look for "Deploy to GitHub Pages" with a ❌ red X or 🟡 yellow circle
   - Click on it

3. **Click on the Failed Job**
   - You'll see "build" and "deploy" jobs
   - Click on the one with the ❌ (usually "build" if build fails, or "deploy" if deployment fails)

4. **Expand the Failed Step**
   - Scroll down to see all steps
   - Find the step with ❌ red X
   - Click on it to expand

5. **Copy the Error Message**
   - Look for lines that start with "Error:", "Failed:", or show red text
   - Copy the entire error message
   - Share it here

## Common Error Patterns

### Build Errors
- "npm ERR!" - npm installation issue
- "Module not found" - missing dependency
- "SyntaxError" - code error
- "Type error" - TypeScript error

### Deployment Errors
- "Permission denied" - workflow permissions
- "No deployment found" - GitHub Pages not enabled
- "Artifact not found" - build didn't complete

### Network Errors
- "ECONNREFUSED" - connection issue
- "ETIMEDOUT" - timeout
- "ENOTFOUND" - DNS issue

## Quick Screenshot Guide

If you can, take a screenshot of:
1. The Actions tab showing the failed workflow
2. The expanded error step with the red error message

This will help me diagnose the issue quickly!

