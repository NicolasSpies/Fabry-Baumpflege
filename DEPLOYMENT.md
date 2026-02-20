# Vercel Deployment Guide

To deploy this project to Vercel, use the following settings in the Vercel Dashboard:

- **Framework Preset**: Vite
- **Root Directory**: `reproduction`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (default)

### Alternative (Root Deployment)
If you deploy from the repository root (`./`), the included `vercel.json` and `package.json` will automatically handle the build delegation to the `reproduction` folder.
