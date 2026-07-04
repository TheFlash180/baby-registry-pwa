// Renders the teddy bear mascot to pwa-192.png / pwa-512.png.
// Run once: npm run gen:pwa-icons (output is committed).

import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Teddy on the warm ivory background, centered with breathing room so the
// maskable variant crops safely.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#F7F1E7"/>
  <g transform="translate(14 12) scale(0.72)">
    <circle cx="30" cy="26" r="12" fill="#c9a97e"/>
    <circle cx="70" cy="26" r="12" fill="#c9a97e"/>
    <circle cx="30" cy="26" r="6" fill="#e8d4b8"/>
    <circle cx="70" cy="26" r="6" fill="#e8d4b8"/>
    <ellipse cx="50" cy="40" rx="26" ry="24" fill="#d4b48c"/>
    <ellipse cx="50" cy="48" rx="13" ry="10" fill="#efdfc6"/>
    <ellipse cx="50" cy="44" rx="4" ry="3" fill="#8a6e4b"/>
    <path d="M50 47 v4 M50 51 q-4 4 -8 1 M50 51 q4 4 8 1" stroke="#8a6e4b" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="40" cy="36" r="2.6" fill="#5a4d40"/>
    <circle cx="60" cy="36" r="2.6" fill="#5a4d40"/>
    <ellipse cx="50" cy="76" rx="22" ry="18" fill="#d4b48c"/>
    <ellipse cx="50" cy="79" rx="12" ry="10" fill="#efdfc6"/>
    <ellipse cx="27" cy="72" rx="7" ry="10" fill="#c9a97e" transform="rotate(18 27 72)"/>
    <ellipse cx="73" cy="72" rx="7" ry="10" fill="#c9a97e" transform="rotate(-18 73 72)"/>
    <path d="M50 58 l-9 -5 q-3 5 0 10 z M50 58 l9 -5 q3 5 0 10 z" fill="#a9b79e"/>
    <circle cx="50" cy="58" r="3" fill="#7e9273"/>
  </g>
</svg>`;

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(OUT, `pwa-${size}.png`));
  console.log(`wrote pwa-${size}.png`);
}
