# Deployment Instructions for shubhaj.com/shubspace

## Build the Project

1. Build the static export:
```bash
npm run build
```

This will create an `out` directory with all the static files.

## Deploy to shubhaj.com/shubspace

### Option 1: Using FTP/SFTP

1. Connect to your server using FTP/SFTP
2. Navigate to your web root directory (usually `public_html` or `www`)
3. Create a `shubspace` directory if it doesn't exist
4. Upload the entire contents of the `out` folder to `/shubspace/`

### Option 2: Using Command Line (SSH)

1. Build the project locally:
```bash
npm run build
```

2. Compress the output:
```bash
cd out && tar -czf ../shubspace.tar.gz . && cd ..
```

3. Upload to your server:
```bash
scp shubspace.tar.gz your-username@shubhaj.com:~/
```

4. SSH into your server and extract:
```bash
ssh your-username@shubhaj.com
cd ~/public_html  # or wherever your web root is
mkdir -p shubspace
cd shubspace
tar -xzf ~/shubspace.tar.gz
rm ~/shubspace.tar.gz
```

### Option 3: Using GitHub Actions (Automated)

If your domain is connected to a service like Vercel, Netlify, or GitHub Pages, you can set up automatic deployment.

## Verify Deployment

Once deployed, visit: https://shubhaj.com/shubspace

## Important Notes

- The site is configured to work at the `/shubspace` subdirectory
- All assets and links are relative to this path
- If you need to change the subdirectory, update `basePath` in `next.config.ts` 