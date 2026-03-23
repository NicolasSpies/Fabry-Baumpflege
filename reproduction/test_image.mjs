import { normalizeCmsImage } from './src/cms/lib/cms.js';
const image = {
  "id": 50,
  "url": "https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/A6409901.webp",
  "variants": {
    "original": "https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/A6409901.webp",
    "cc-480": "https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/A6409901-480.webp",
    "cc-768": "https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/A6409901-768.webp",
    "cc-1280": "https://cms.fabry-baumpflege.be/wp-content/uploads/2026/03/A6409901-1280.webp"
  }
};
console.log(JSON.stringify(normalizeCmsImage(image), null, 2));
