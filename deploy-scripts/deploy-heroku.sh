#!/bin/bash

# Heroku Deployment Script for Betting App Backend

echo "🚀 Starting Heroku deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku first:"
    heroku login
fi

# Navigate to server directory
cd server

# Create Heroku app (if it doesn't exist)
echo "📦 Creating Heroku app..."
heroku create betting-app-backend-$(date +%s) || echo "App may already exist"

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Heroku deployment"
fi

# Add Heroku remote
echo "🔗 Adding Heroku remote..."
heroku git:remote -a $(heroku apps --json | jq -r '.[0].name')

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"
git push heroku main

# Open the app
echo "🌐 Opening deployed app..."
heroku open

echo "✅ Deployment complete!"
echo "📋 Your backend URL: $(heroku apps:info --json | jq -r '.[0].web_url')"
echo "🔑 Don't forget to update your frontend with the new API URL!"

