# Vercel Deployment Guide

To fix the "vite: command not found" error, you must set the **Root Directory** in Vercel to `reproduction`.

### Vercel Dashboard Settings:
- **Root Directory**: `reproduction`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Why this fixes the error:
When **Root Directory** is set to `reproduction`, Vercel will install the dependencies (including Vite) directly inside that folder. Currently, it is trying to build from the root without having Vite installed.
