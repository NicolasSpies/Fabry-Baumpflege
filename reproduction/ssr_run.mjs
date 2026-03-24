import { PRODUCTION_TEMPLATE } from './src/cms/lib/template.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function simulateRender(isVercel, hasDistIndex) {
    let html = PRODUCTION_TEMPLATE;
    const reqHeaders = isVercel ? { 'x-vercel-id': 'test' } : {};
    
    // Logic from api/render.js
    const buildPath = path.resolve(__dirname, './dist/index.html');
    if (hasDistIndex && fs.existsSync(buildPath)) {
        html = fs.readFileSync(buildPath, 'utf8');
    }

    if (reqHeaders['x-vercel-id'] && html.includes('/src/main.jsx')) {
        html = html.replace('<script type="module" src="/src/main.jsx"></script>', '');
    }

    return html;
}

console.log('--- TEST 1: LOCAL DEV ---');
const localHtml = simulateRender(false, false);
console.log('Script tag includes /src/main.jsx:', localHtml.includes('/src/main.jsx') ? 'PRESENT (Correct)' : 'MISSING (Error)');

console.log('\n--- TEST 2: VERCEL with DIST ---');
const vercelDistHtml = simulateRender(true, true);
console.log('Script tag includes assets/index:', vercelDistHtml.includes('/assets/index-') ? 'PRESENT (Correct)' : 'MISSING (Error)');
console.log('Script tag includes /src/main.jsx:', vercelDistHtml.includes('/src/main.jsx') ? 'PRESENT (Error)' : 'MISSING (Correct)');

console.log('\n--- TEST 3: VERCEL without DIST (Fallback) ---');
const vercelFallbackHtml = simulateRender(true, false);
console.log('Script tag includes /src/main.jsx:', vercelFallbackHtml.includes('/src/main.jsx') ? 'PRESENT (Error)' : 'MISSING (Correct)');
