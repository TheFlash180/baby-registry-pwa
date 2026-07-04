// Hand-drawn-style SVG motifs: teddy bear mascot, watercolor floral sprays,
// and the little sage heart used in dividers. All colors from the palette.

export function TeddyBear({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {/* ears */}
      <circle cx="30" cy="26" r="12" fill="#c9a97e" />
      <circle cx="70" cy="26" r="12" fill="#c9a97e" />
      <circle cx="30" cy="26" r="6" fill="#e8d4b8" />
      <circle cx="70" cy="26" r="6" fill="#e8d4b8" />
      {/* head */}
      <ellipse cx="50" cy="40" rx="26" ry="24" fill="#d4b48c" />
      {/* muzzle */}
      <ellipse cx="50" cy="48" rx="13" ry="10" fill="#efdfc6" />
      <ellipse cx="50" cy="44" rx="4" ry="3" fill="#8a6e4b" />
      <path d="M50 47 v4 M50 51 q-4 4 -8 1 M50 51 q4 4 8 1" stroke="#8a6e4b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="40" cy="36" r="2.6" fill="#5a4d40" />
      <circle cx="60" cy="36" r="2.6" fill="#5a4d40" />
      {/* body */}
      <ellipse cx="50" cy="76" rx="22" ry="18" fill="#d4b48c" />
      <ellipse cx="50" cy="79" rx="12" ry="10" fill="#efdfc6" />
      {/* arms */}
      <ellipse cx="27" cy="72" rx="7" ry="10" fill="#c9a97e" transform="rotate(18 27 72)" />
      <ellipse cx="73" cy="72" rx="7" ry="10" fill="#c9a97e" transform="rotate(-18 73 72)" />
      {/* bow */}
      <path d="M50 58 l-9 -5 q-3 5 0 10 z M50 58 l9 -5 q3 5 0 10 z" fill="#a9b79e" />
      <circle cx="50" cy="58" r="3" fill="#7e9273" />
    </svg>
  );
}

export function FloralCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <g fill="none" strokeLinecap="round">
        {/* main stem arching from the corner */}
        <path d="M118 6 Q80 26 58 62 Q46 84 44 108" stroke="#7e9273" strokeWidth="2" opacity="0.8" />
        <path d="M116 20 Q88 44 76 80" stroke="#a9b79e" strokeWidth="1.8" opacity="0.8" />
        {/* leaves — soft watercolor blobs */}
        <g fill="#a9b79e" stroke="none" opacity="0.75">
          <ellipse cx="96" cy="22" rx="10" ry="4.5" transform="rotate(-32 96 22)" />
          <ellipse cx="82" cy="38" rx="10" ry="4.5" transform="rotate(-48 82 38)" />
          <ellipse cx="68" cy="55" rx="9" ry="4" transform="rotate(-60 68 55)" />
          <ellipse cx="57" cy="76" rx="9" ry="4" transform="rotate(-72 57 76)" />
        </g>
        <g fill="#7e9273" stroke="none" opacity="0.6">
          <ellipse cx="104" cy="34" rx="8" ry="3.6" transform="rotate(-40 104 34)" />
          <ellipse cx="90" cy="56" rx="8" ry="3.6" transform="rotate(-55 90 56)" />
          <ellipse cx="80" cy="74" rx="7" ry="3.2" transform="rotate(-66 80 74)" />
        </g>
        {/* small blush flowers */}
        <g fill="#e8d4b8" stroke="none">
          <circle cx="60" cy="42" r="5" />
          <circle cx="49" cy="92" r="6" />
          <circle cx="98" cy="66" r="4.5" />
        </g>
        <g fill="#8a6e4b" stroke="none" opacity="0.85">
          <circle cx="60" cy="42" r="1.8" />
          <circle cx="49" cy="92" r="2.2" />
          <circle cx="98" cy="66" r="1.6" />
        </g>
      </g>
    </svg>
  );
}

export function Heart({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 20 C6 15 2.5 11.5 2.5 8 a4.8 4.8 0 0 1 9.5 -1 a4.8 4.8 0 0 1 9.5 1 c0 3.5 -3.5 7 -9.5 12z"
        fill="none"
        stroke="#a9b79e"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartDivider() {
  return (
    <div className="heart-divider" aria-hidden="true">
      <Heart />
    </div>
  );
}
