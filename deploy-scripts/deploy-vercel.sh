#!/bin/bash

# Vercel Deployment Script for Betting App Frontend

echo "🚀 Starting Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Navigate to client directory
cd client

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    echo "REACT_APP_API_URL=https://your-backend-url.herokuapp.com" > .env
    echo "⚠️  Please update the API URL in .env file with your actual backend URL"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your frontend is now live on Vercel!"
echo "📋 Don't forget to update the API URL in your .env file if needed."

