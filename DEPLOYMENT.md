# Vercel Deployment Settings

For a successful deployment, configure the following in the Vercel Project Dashboard:

- **Root Directory**: `reproduction`
- **Framework Preset**: `Vite`
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Why this is required
The application source code lives in the `reproduction` folder. Setting this as the Root Directory ensures Vercel installs dependencies (like Vite) correctly and builds from the right location.
