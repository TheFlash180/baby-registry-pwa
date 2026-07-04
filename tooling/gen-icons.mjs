// Generates the per-item SVG icons into public/icons/.
// Style: soft blush circle background, sepia line work, sage + cream accents —
// matching the invite palette. Run: npm run gen:icons

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

// palette
const SEPIA = '#8A6E4B';
const SAGE = '#A9B79E';
const SAGE_D = '#7E9273';
const CREAM = '#FFFDFA';
const SAND = '#E8D4B8';

const icons = {
  // ---------------- Sleep
  'crib-sheets': `
    <rect x="16" y="34" width="32" height="9" rx="4" fill="${CREAM}"/>
    <rect x="18" y="26" width="28" height="9" rx="4" fill="${SAND}"/>
    <rect x="20" y="18" width="24" height="9" rx="4" fill="${CREAM}"/>
    <path d="M20 47 h24" stroke="${SAGE}" stroke-dasharray="2 4"/>`,
  'sleep-sacks': `
    <path d="M25 18 q7 -6 14 0 q6 16 3 26 q-10 5 -20 0 q-3 -10 3 -26z" fill="${CREAM}"/>
    <path d="M27 24 h10" stroke="${SAGE}"/>
    <path d="M40 32 a5 5 0 1 1 -4 -7 a4 4 0 1 0 4 7z" fill="${SAND}" stroke="none"/>`,
  'sound-machine': `
    <rect x="17" y="24" width="22" height="18" rx="8" fill="${CREAM}"/>
    <circle cx="28" cy="33" r="5" fill="${SAND}"/>
    <path d="M44 28 q4 5 0 10 M48 25 q6 8 0 16" stroke="${SAGE_D}"/>`,
  'night-light': `
    <path d="M36 18 a11 11 0 1 0 8 18 a9 9 0 1 1 -8 -18z" fill="${SAND}"/>
    <rect x="26" y="42" width="12" height="4" rx="2" fill="${CREAM}"/>
    <path d="M20 24 l2 2 M18 34 h3" stroke="${SAGE}"/>`,
  // ---------------- Feeding
  'baby-bottles': `
    <path d="M28 26 h8 l2 6 v14 a4 4 0 0 1 -4 4 h-4 a4 4 0 0 1 -4 -4 v-14 z" fill="${CREAM}"/>
    <path d="M30 20 q2 -4 4 0 l1 6 h-6 z" fill="${SAND}"/>
    <path d="M27 36 h10 M27 41 h10" stroke="${SAGE}"/>`,
  'bottle-brush': `
    <path d="M32 16 q8 0 8 8 q0 7 -8 7 q-8 0 -8 -7 q0 -8 8 -8z" fill="${SAND}"/>
    <path d="M26 20 l12 8 M38 20 l-12 8 M32 15 v16" stroke="${CREAM}"/>
    <path d="M32 31 v14 q0 4 3 4" stroke="${SEPIA}"/>`,
  'burp-cloths': `
    <path d="M18 24 q14 -8 28 0 v6 q-14 8 -28 0 z" fill="${CREAM}"/>
    <path d="M18 30 v10 q14 8 28 0 v-10" fill="${SAND}" stroke="${SEPIA}"/>
    <path d="M26 34 h4 M34 36 h4" stroke="${SAGE}"/>`,
  'nursing-pillow': `
    <path d="M18 36 a14 12 0 1 1 28 0 q-2 6 -8 6 q-6 -8 -12 0 q-6 0 -8 -6z" fill="${SAND}"/>
    <path d="M26 30 q6 -4 12 0" stroke="${CREAM}"/>`,
  'breast-pump': `
    <path d="M22 22 q8 -6 14 2 l-6 6 q-8 -2 -8 -8z" fill="${SAND}"/>
    <path d="M30 30 v6" stroke="${SEPIA}"/>
    <path d="M26 36 h10 l1 4 v6 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 v-6 z" fill="${CREAM}"/>`,
  'milk-storage-bags': `
    <path d="M22 20 h20 v22 a5 5 0 0 1 -5 5 h-10 a5 5 0 0 1 -5 -5 z" fill="${CREAM}"/>
    <path d="M22 24 h20" stroke="${SAGE_D}"/>
    <path d="M24 32 h16 v10 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z" fill="${SAND}" stroke="none"/>`,
  'bibs': `
    <path d="M24 20 a8 8 0 0 0 16 0 q6 4 4 14 q-2 12 -12 12 q-10 0 -12 -12 q-2 -10 4 -14z" fill="${CREAM}"/>
    <path d="M29 34 q3 3 6 0" stroke="${SAGE_D}"/>
    <circle cx="32" cy="29" r="2" fill="${SAND}" stroke="none"/>`,
  'bottle-warmer': `
    <path d="M20 30 h24 v10 a8 8 0 0 1 -8 8 h-8 a8 8 0 0 1 -8 -8 z" fill="${SAND}"/>
    <rect x="28" y="20" width="8" height="14" rx="3" fill="${CREAM}"/>
    <path d="M24 16 q2 -3 0 -6 M32 14 q2 -3 0 -6" stroke="${SAGE}" transform="translate(8 8)"/>`,
  'bottle-sterilizer': `
    <rect x="18" y="26" width="28" height="18" rx="6" fill="${CREAM}"/>
    <rect x="24" y="30" width="6" height="10" rx="2" fill="${SAND}" stroke="none"/>
    <rect x="34" y="30" width="6" height="10" rx="2" fill="${SAND}" stroke="none"/>
    <path d="M26 20 q2 -3 0 -5 M32 19 q2 -3 0 -5 M38 20 q2 -3 0 -5" stroke="${SAGE}"/>`,
  'sippy-cups': `
    <path d="M24 26 h16 v14 a5 5 0 0 1 -5 5 h-6 a5 5 0 0 1 -5 -5 z" fill="${CREAM}"/>
    <path d="M28 26 v-4 a4 4 0 0 1 8 0 v4" fill="${SAND}"/>
    <path d="M24 30 q-6 1 -4 7 q1 3 5 3 M40 30 q6 1 4 7 q-1 3 -5 3" stroke="${SEPIA}"/>`,
  // ---------------- Diapering
  'newborn-diapers': `
    <path d="M18 26 h28 v6 q0 12 -14 14 q-14 -2 -14 -14 z" fill="${CREAM}"/>
    <path d="M18 30 q6 4 10 12 M46 30 q-6 4 -10 12" stroke="${SEPIA}"/>
    <circle cx="32" cy="33" r="2" fill="${SAGE}" stroke="none"/>`,
  'baby-wipes': `
    <rect x="16" y="26" width="32" height="16" rx="7" fill="${SAND}"/>
    <rect x="26" y="22" width="12" height="6" rx="3" fill="${CREAM}"/>
    <path d="M30 22 q4 -6 8 -2" stroke="${SEPIA}" fill="${CREAM}"/>`,
  'rash-cream': `
    <path d="M26 24 h12 v18 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 z" fill="${CREAM}"/>
    <rect x="27" y="17" width="10" height="6" rx="2" fill="${SAND}"/>
    <path d="M29 32 q3 3 6 0" stroke="${SAGE_D}"/>`,
  'changing-pad': `
    <path d="M14 38 q0 -6 6 -6 h24 q6 0 6 6 q0 5 -6 5 h-24 q-6 0 -6 -5z" fill="${CREAM}"/>
    <path d="M14 36 q0 -8 8 -10 M50 36 q0 -8 -8 -10" stroke="${SEPIA}"/>
    <circle cx="32" cy="26" r="3" fill="${SAND}" stroke="none"/>`,
  'diaper-caddy': `
    <path d="M18 28 h28 v12 a5 5 0 0 1 -5 5 h-18 a5 5 0 0 1 -5 -5 z" fill="${SAND}"/>
    <path d="M32 28 v17 M25 28 v17 M39 28 v17" stroke="${CREAM}"/>
    <path d="M24 28 q8 -12 16 0" stroke="${SEPIA}"/>`,
  'wet-bags': `
    <path d="M22 22 h20 v20 a6 6 0 0 1 -6 6 h-8 a6 6 0 0 1 -6 -6 z" fill="${SAGE}"/>
    <path d="M22 27 h20" stroke="${CREAM}" stroke-dasharray="3 3"/>
    <path d="M32 33 q4 5 0 8 q-4 -3 0 -8z" fill="${CREAM}" stroke="none"/>`,
  'diaper-pail': `
    <path d="M22 26 h20 l-2 20 a3 3 0 0 1 -3 3 h-10 a3 3 0 0 1 -3 -3 z" fill="${CREAM}"/>
    <rect x="19" y="20" width="26" height="7" rx="3.5" fill="${SAND}"/>
    <path d="M28 36 h8" stroke="${SAGE}"/>`,
  'diaper-bag': `
    <rect x="18" y="26" width="28" height="18" rx="7" fill="${SAND}"/>
    <path d="M25 26 q0 -9 7 -9 q7 0 7 9" stroke="${SEPIA}"/>
    <rect x="27" y="32" width="10" height="7" rx="3" fill="${CREAM}"/>`,
  // ---------------- On the Go
  'car-seat': `
    <path d="M20 20 q-2 16 4 22 q8 4 16 0 q4 -4 4 -10 l-8 -2 q-2 -8 -8 -10z" fill="${SAND}"/>
    <path d="M20 20 q12 2 16 20" stroke="${CREAM}"/>
    <path d="M18 30 q-4 8 4 14" stroke="${SEPIA}"/>`,
  'stroller': `
    <path d="M18 20 q0 12 10 12 h10 v-12 q10 0 8 8" fill="none"/>
    <path d="M18 20 q0 12 10 12 h10 v-14 a14 14 0 0 1 8 12" fill="${SAND}"/>
    <circle cx="26" cy="42" r="4" fill="${CREAM}"/>
    <circle cx="42" cy="42" r="4" fill="${CREAM}"/>
    <path d="M38 18 l5 -4" stroke="${SEPIA}"/>`,
  'baby-carrier': `
    <path d="M24 18 q8 -4 16 0 l-2 10 q-6 4 -12 0 z" fill="${SAGE}"/>
    <path d="M22 30 q10 6 20 0 l-2 14 q-8 5 -16 0 z" fill="${SAND}"/>
    <circle cx="32" cy="24" r="4" fill="${CREAM}"/>`,
  'rain-cover': `
    <path d="M20 34 a12 12 0 0 1 24 0 z" fill="${CREAM}"/>
    <path d="M24 40 l-2 5 M32 40 l-2 5 M40 40 l-2 5" stroke="${SAGE_D}"/>
    <path d="M26 22 q6 -6 12 0" stroke="${SEPIA}"/>`,
  'backseat-mirror': `
    <ellipse cx="32" cy="32" rx="15" ry="12" fill="${CREAM}"/>
    <circle cx="28" cy="30" r="2" fill="${SEPIA}" stroke="none"/>
    <circle cx="36" cy="30" r="2" fill="${SEPIA}" stroke="none"/>
    <path d="M29 35 q3 3 6 0" stroke="${SAGE_D}"/>
    <path d="M32 20 v-5" stroke="${SEPIA}"/>`,
  // ---------------- Bath & Care
  'hooded-towels': `
    <rect x="18" y="24" width="28" height="20" rx="6" fill="${CREAM}"/>
    <path d="M32 24 l-10 -8 q12 -6 20 0 z" fill="${SAND}"/>
    <circle cx="27" cy="15" r="2.5" fill="${SAND}"/>
    <circle cx="37" cy="15" r="2.5" fill="${SAND}"/>`,
  'washcloths': `
    <rect x="18" y="20" width="20" height="20" rx="5" fill="${SAND}" transform="rotate(-6 28 30)"/>
    <rect x="26" y="26" width="20" height="20" rx="5" fill="${CREAM}"/>
    <path d="M31 32 q5 -3 10 0" stroke="${SAGE}"/>`,
  'baby-wash': `
    <path d="M26 26 h12 v16 a4 4 0 0 1 -4 4 h-4 a4 4 0 0 1 -4 -4 z" fill="${CREAM}"/>
    <path d="M30 26 v-5 h6 l3 3 M33 21 v-4" stroke="${SEPIA}"/>
    <circle cx="24" cy="20" r="2.5" fill="${SAGE}" stroke="none"/>
    <circle cx="20" cy="26" r="1.8" fill="${SAGE}" stroke="none"/>`,
  'nail-care': `
    <path d="M24 18 q8 -4 16 0 l-3 8 q-5 -2 -10 0 z" fill="${SAND}"/>
    <path d="M27 26 v16 a5 5 0 0 0 10 0 v-16" fill="${CREAM}"/>
    <path d="M32 32 v8" stroke="${SAGE}"/>`,
  'nasal-aspirator': `
    <circle cx="26" cy="34" r="10" fill="${SAND}"/>
    <path d="M34 27 l10 -8 q4 -2 3 3 l-6 10" fill="${CREAM}"/>
    <circle cx="26" cy="34" r="4" fill="${CREAM}" stroke="none"/>`,
  'hairbrush': `
    <ellipse cx="30" cy="26" rx="12" ry="8" fill="${SAND}" transform="rotate(-20 30 26)"/>
    <path d="M38 33 l8 12" stroke="${SEPIA}" stroke-width="4"/>
    <path d="M24 24 l-2 -4 M29 22 l-1 -4 M34 22 l1 -4" stroke="${SEPIA}"/>`,
  // ---------------- Play & Development
  'contrast-cards': `
    <rect x="17" y="20" width="18" height="24" rx="4" fill="${CREAM}" transform="rotate(-8 26 32)"/>
    <rect x="29" y="20" width="18" height="24" rx="4" fill="${SAND}"/>
    <circle cx="38" cy="29" r="4" fill="${SEPIA}" stroke="none"/>
    <path d="M34 40 h8" stroke="${SEPIA}"/>`,
  'cloth-books': `
    <path d="M32 22 q-8 -5 -14 0 v20 q6 -4 14 0 z" fill="${CREAM}"/>
    <path d="M32 22 q8 -5 14 0 v20 q-6 -4 -14 0 z" fill="${SAND}"/>
    <path d="M22 28 h6 M36 30 h6" stroke="${SAGE}"/>`,
  'wooden-teethers': `
    <circle cx="32" cy="34" r="11" fill="none" stroke="${SEPIA}" stroke-width="4"/>
    <circle cx="32" cy="19" r="5" fill="${SAND}"/>
    <circle cx="29" cy="15" r="2" fill="${SAND}"/>
    <circle cx="35" cy="15" r="2" fill="${SAND}"/>`,
  'rattles': `
    <circle cx="32" cy="25" r="9" fill="${SAND}"/>
    <path d="M32 34 v12" stroke="${SEPIA}" stroke-width="3.5"/>
    <circle cx="32" cy="48" r="3" fill="${CREAM}"/>
    <circle cx="28" cy="23" r="1.6" fill="${CREAM}" stroke="none"/>
    <circle cx="35" cy="26" r="1.6" fill="${CREAM}" stroke="none"/>`,
  // ---------------- Starting Solids
  'high-chair': `
    <rect x="24" y="16" width="16" height="12" rx="4" fill="${SAND}"/>
    <path d="M20 30 h24 v4 h-24 z" fill="${CREAM}"/>
    <path d="M24 34 l-4 14 M40 34 l4 14 M26 42 h12" stroke="${SEPIA}"/>`,
  'silicone-bibs': `
    <path d="M24 18 a8 8 0 0 0 16 0 q5 4 4 12 q-1 8 -12 9 q-11 -1 -12 -9 q-1 -8 4 -12z" fill="${SAGE}"/>
    <path d="M24 38 h16 v4 q-8 4 -16 0 z" fill="${SAGE_D}" stroke="none"/>`,
  'suction-plates': `
    <ellipse cx="32" cy="32" rx="16" ry="10" fill="${CREAM}"/>
    <path d="M32 24 v16 M24 28 q8 4 16 0" stroke="${SAGE}"/>
    <path d="M24 44 h16" stroke="${SEPIA}"/>`,
  'open-cup': `
    <path d="M24 24 h16 l-2 18 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 z" fill="${SAND}"/>
    <path d="M26 30 h12" stroke="${CREAM}"/>`,
  'straw-cup': `
    <path d="M24 26 h16 l-2 16 a3 3 0 0 1 -3 3 h-6 a3 3 0 0 1 -3 -3 z" fill="${CREAM}"/>
    <path d="M30 26 l6 -12 q3 -2 3 2" stroke="${SAGE_D}"/>
    <path d="M27 32 h10" stroke="${SAND}"/>`,
  'food-maker': `
    <path d="M24 18 h16 v18 a8 8 0 0 1 -16 0 z" fill="${CREAM}"/>
    <rect x="22" y="44" width="20" height="5" rx="2.5" fill="${SAND}"/>
    <path d="M29 24 q3 3 6 0 M28 31 q4 3 8 0" stroke="${SAGE}"/>`,
  // ---------------- Clothing
  'sleepers': `
    <path d="M28 16 h8 l6 6 -4 5 -2 -2 v14 q0 6 -5 6 h-2 q-5 0 -5 -6 v-14 l-2 2 -4 -5 z" fill="${SAND}"/>
    <path d="M32 22 v14" stroke="${CREAM}" stroke-dasharray="2 3"/>
    <path d="M27 45 h4 M33 45 h4" stroke="${SEPIA}"/>`,
  'bodysuits': `
    <path d="M26 16 h12 l8 6 -4 6 -3 -2 v10 l4 6 h-8 l-3 -4 -3 4 h-8 l4 -6 v-10 l-3 2 -4 -6 z" fill="${CREAM}"/>
    <path d="M29 22 q3 3 6 0" stroke="${SAGE}"/>`,
  'socks-mittens': `
    <path d="M20 18 v14 q0 6 6 6 q6 0 6 -6 l-6 -4 v-10 z" fill="${SAND}"/>
    <path d="M36 24 q8 -4 10 4 l-2 10 q-6 4 -10 0 z" fill="${CREAM}"/>
    <path d="M20 22 h6 M38 40 q4 2 6 0" stroke="${SEPIA}"/>`,
  'hats': `
    <path d="M18 38 a14 14 0 0 1 28 0 z" fill="${SAND}"/>
    <rect x="16" y="38" width="32" height="6" rx="3" fill="${CREAM}"/>
    <circle cx="32" cy="20" r="3.5" fill="${SAGE}"/>`,
  'cardigan': `
    <path d="M24 18 h16 l6 8 -4 4 -2 -2 v16 h-16 v-16 l-2 2 -4 -4 z" fill="${SAGE}"/>
    <path d="M32 20 v24" stroke="${CREAM}"/>
    <circle cx="29" cy="28" r="1.4" fill="${CREAM}" stroke="none"/>
    <circle cx="29" cy="34" r="1.4" fill="${CREAM}" stroke="none"/>`,
  'going-home-outfit': `
    <path d="M22 14 h20" stroke="${SEPIA}"/>
    <path d="M32 14 v4" stroke="${SEPIA}"/>
    <path d="M26 18 h12 l6 6 -4 5 -2 -2 v14 h-12 v-14 l-2 2 -4 -5 z" fill="${CREAM}"/>
    <path d="M32 29 c-3 -3 -7 0 -4 4 l4 3 l4 -3 c3 -4 -1 -7 -4 -4z" fill="${SAND}" stroke="none"/>`,
  // ---------------- Health & Safety
  'first-aid-kit': `
    <rect x="18" y="24" width="28" height="20" rx="6" fill="${CREAM}"/>
    <path d="M27 24 q0 -6 5 -6 q5 0 5 6" stroke="${SEPIA}"/>
    <path d="M32 29 v10 M27 34 h10" stroke="${SAGE_D}" stroke-width="3.5"/>`,
  'baby-monitor': `
    <rect x="22" y="22" width="20" height="24" rx="7" fill="${SAND}"/>
    <circle cx="32" cy="32" r="6" fill="${CREAM}"/>
    <circle cx="32" cy="32" r="2" fill="${SEPIA}" stroke="none"/>
    <path d="M46 24 q4 8 0 16" stroke="${SAGE_D}"/>`,
  'humidifier': `
    <path d="M22 30 q0 -8 10 -8 q10 0 10 8 v8 a8 8 0 0 1 -20 0 z" fill="${CREAM}"/>
    <path d="M28 16 q-2 -3 0 -5 M32 15 q-2 -3 0 -5 M36 16 q-2 -3 0 -5" stroke="${SAGE}"/>
    <path d="M27 36 q5 3 10 0" stroke="${SAND}"/>`,
  'grooming-kit': `
    <path d="M18 28 h28 v10 a6 6 0 0 1 -6 6 h-16 a6 6 0 0 1 -6 -6 z" fill="${SAND}"/>
    <path d="M18 28 q14 -8 28 0" stroke="${SEPIA}"/>
    <path d="M26 34 v6 M30 34 v6 M34 34 v6 M38 34 v6" stroke="${CREAM}"/>`,
  'medicine-dispenser': `
    <path d="M24 20 h10 v22 a4 4 0 0 1 -4 4 h-2 a4 4 0 0 1 -4 -4 z" fill="${CREAM}"/>
    <path d="M34 26 h8 M34 33 h6" stroke="${SEPIA}"/>
    <path d="M26 26 h6 M26 32 h6 M26 38 h6" stroke="${SAGE}"/>`,
  // ---------------- Nursery & Extras
  'laundry-hamper': `
    <path d="M20 24 h24 l-3 22 a3 3 0 0 1 -3 3 h-12 a3 3 0 0 1 -3 -3 z" fill="${SAND}"/>
    <path d="M24 24 q0 -6 8 -6 q8 0 8 6" stroke="${SEPIA}"/>
    <path d="M25 32 q7 4 14 0" stroke="${CREAM}"/>`,
  'drawer-organizers': `
    <rect x="17" y="20" width="30" height="24" rx="5" fill="${CREAM}"/>
    <path d="M32 20 v24 M17 32 h30" stroke="${SEPIA}"/>
    <circle cx="25" cy="26" r="1.6" fill="${SAGE}" stroke="none"/>
    <circle cx="39" cy="38" r="1.6" fill="${SAGE}" stroke="none"/>`,
  'bouncer': `
    <path d="M18 22 q14 -6 28 0 q-2 14 -14 14 q-12 0 -14 -14z" fill="${SAND}"/>
    <path d="M20 36 q-4 10 6 12 M44 36 q4 10 -6 12" stroke="${SEPIA}"/>
    <path d="M27 26 q5 4 10 0" stroke="${CREAM}"/>`,
  'milestone-cards': `
    <rect x="20" y="18" width="24" height="28" rx="5" fill="${CREAM}"/>
    <text x="32" y="38" font-family="Georgia, serif" font-size="16" fill="${SEPIA}" text-anchor="middle" stroke="none">1</text>
    <path d="M26 24 q6 -4 12 0" stroke="${SAGE}"/>`,
  'diaper-fund': `
    <rect x="16" y="24" width="32" height="20" rx="6" fill="${SAGE}"/>
    <path d="M16 30 h32" stroke="${CREAM}"/>
    <path d="M32 35 c-3 -3 -7 0 -4 4 l4 3 l4 -3 c3 -4 -1 -7 -4 -4z" fill="${CREAM}" stroke="none"/>`,
  'meal-delivery': `
    <path d="M18 38 a14 12 0 0 1 28 0 z" fill="${CREAM}"/>
    <path d="M14 38 h36" stroke="${SEPIA}"/>
    <circle cx="32" cy="24" r="2.5" fill="${SAND}"/>
    <path d="M24 44 q8 4 16 0" stroke="${SAGE}"/>`,
  // ---------------- fallback
  'gift-box': `
    <rect x="19" y="28" width="26" height="18" rx="4" fill="${CREAM}"/>
    <rect x="17" y="22" width="30" height="7" rx="3.5" fill="${SAND}"/>
    <path d="M32 22 v24" stroke="${SAGE_D}"/>
    <path d="M32 22 q-8 -8 -6 -2 q1 3 6 2 q5 1 6 -2 q2 -6 -6 2z" fill="${SAGE}"/>`,
};

const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#F0E6D6"/>
  <g stroke="${SEPIA}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}
  </g>
</svg>
`;

let count = 0;
for (const [slug, body] of Object.entries(icons)) {
  writeFileSync(join(OUT, `${slug}.svg`), wrap(body));
  count++;
}
console.log(`Wrote ${count} icons to public/icons/`);
