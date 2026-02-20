# Vercel Deployment Settings

For this project to deploy correctly, use the following settings in the Vercel Dashboard:

- **Root Directory**: `reproduction`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Why this fixes the issue:
The source code for the React app is located in the `reproduction` folder. Setting this as the Root Directory tells Vercel to install dependencies and run the build inside that specific folder.
