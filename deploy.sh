#!/bin/bash

echo "🚀 Building S(h)ubspace for production..."
npm run build

if [ -d "out" ]; then
    echo "✅ Build successful! Files are in the 'out' directory"
    echo ""
    echo "📦 To deploy to shubhaj.com/shubspace:"
    echo "1. Upload all files from the 'out' folder to your server's /shubspace directory"
    echo "2. Or use: scp -r out/* username@shubhaj.com:/path/to/public_html/shubspace/"
    echo ""
    echo "🌐 Your site will be available at: https://shubhaj.com/shubspace"
else
    echo "❌ Build failed. Please check for errors above."
fi 