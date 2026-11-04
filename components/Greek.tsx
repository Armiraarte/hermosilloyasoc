import React, { useId } from 'react';

// Ilustraciones SVG propias de inspiracion griega clasica. Todas usan currentColor, asi que
// el color y la opacidad se controlan con clases de Tailwind (por ejemplo text-platinum-500/40).
// Son decorativas: aria-hidden y sin interaccion.

interface GlyphProps {
  className?: string;
}

/* ------------------------------------------------------------------
   Emblemas (caja de 64x64): balanza de Temis, lechuza de Atenea,
   rollo de leyes de Solon, corona de laurel y columna.
------------------------------------------------------------------- */

const ScalesGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="8" r="2.5" />
    <path d="M32 10.5V54" />
    <path d="M22 56H42M25 54H39" />
    <path d="M10 17H54" />
    <path d="M10 17L4 40M10 17L16 40M54 17L48 40M54 17L60 40" />
    <path d="M2 40Q10 50 18 40ZM46 40Q54 50 62 40Z" />
  </g>
);

const OwlGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 8C20 8 14 18 14 30C14 46 22 58 32 58C42 58 50 46 50 30C50 18 44 8 32 8Z" />
    <path d="M17 15L12 6L23 11M47 15L52 6L41 11" />
    <circle cx="24" cy="27" r="7.5" />
    <circle cx="40" cy="27" r="7.5" />
    <circle cx="24" cy="27" r="2.6" fill="currentColor" />
    <circle cx="40" cy="27" r="2.6" fill="currentColor" />
    <path d="M32 30L28.5 37L32 41L35.5 37Z" />
    <path d="M22 46L27 50L32 46L37 50L42 46M25 53L29 56L32 53L35 56L39 53" />
    <path d="M26 58V61M32 58V61M38 58V61" />
  </g>
);

const ScrollGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 14H46V50H18Z" />
    <path d="M14 10C14 7 22 7 22 10V14M14 10C14 13 18 14 18 14" />
    <path d="M50 54C50 57 42 57 42 54V50M50 54C50 51 46 50 46 50" />
    <path d="M24 22H40M24 28H40M24 34H40M24 40H33" />
  </g>
);

const LaurelGlyph: React.FC = () => {
  const leaves: React.ReactNode[] = [];
  for (let i = 0; i < 9; i += 1) {
    const t = i / 8;
    const angle = ((92 + t * 150) * Math.PI) / 180;
    const x = 32 + 21 * Math.cos(angle);
    const y = 34 + 21 * Math.sin(angle);
    const rotation = (angle * 180) / Math.PI + 180;
    const size = 0.9 - t * 0.2;
    [-26, 26].forEach((tilt) => {
      leaves.push(
        <path
          key={`${i}-${tilt}`}
          d="M0 0C4 -4 4 -10 0 -14C-4 -10 -4 -4 0 0Z"
          transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(rotation + tilt).toFixed(1)}) scale(${size.toFixed(2)})`}
        />
      );
    });
  }
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <g>{leaves}</g>
      <g transform="translate(64 0) scale(-1 1)">{leaves}</g>
      <path d="M28 56H36M32 52V58" />
    </g>
  );
};

const ColumnGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 8H50V13H14ZM18 13H46C46 18 43 20 41 21H23C21 20 18 18 18 13Z" />
    <path d="M23 21V51M29 21V51M35 21V51M41 21V51" />
    <path d="M16 51H48V55H16ZM12 55H52V59H12Z" />
  </g>
);

const GavelGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <g transform="rotate(-32 28 32)">
      <rect x="6" y="8" width="32" height="16" rx="2.5" />
      <path d="M13 8V24M31 8V24" />
      <rect x="19" y="24" width="6" height="28" rx="2" />
    </g>
    <rect x="34" y="52" width="26" height="6" rx="1.5" />
  </g>
);

const ShieldGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="25" />
    <circle cx="32" cy="32" r="19" />
    <circle cx="32" cy="32" r="5" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <path
          key={i}
          d={`M${(32 + 9 * Math.cos(a)).toFixed(1)} ${(32 + 9 * Math.sin(a)).toFixed(1)}L${(32 + 19 * Math.cos(a)).toFixed(1)} ${(32 + 19 * Math.sin(a)).toFixed(1)}`}
        />
      );
    })}
  </g>
);

const AmphoraGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M26 6H38M27 6V13C27 16 19 19 19 31C19 45 26 55 32 58C38 55 45 45 45 31C45 19 37 16 37 13V6" />
    <path d="M27 10C20 10 17 16 21 22M37 10C44 10 47 16 43 22" />
    <path d="M20 29H44M21 36H43" />
    <path d="M26 58H38" />
  </g>
);

const QuillGlyph: React.FC = () => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M52 6C32 10 20 26 16 48L19 50C37 46 51 34 55 14Z" />
    <path d="M17 49L9 59" />
    <path d="M24 42C32 32 41 22 49 13" />
  </g>
);

const GLYPHS = [ScalesGlyph, OwlGlyph, ScrollGlyph, LaurelGlyph, ColumnGlyph, GavelGlyph, ShieldGlyph, AmphoraGlyph, QuillGlyph];

const GlyphSvg: React.FC<GlyphProps & { glyph: React.FC }> = ({ className, glyph: Glyph }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className={`greek-svg ${className ?? ''}`} aria-hidden="true">
    <Glyph />
  </svg>
);

export const Scales: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={ScalesGlyph} className={className} />;
export const Owl: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={OwlGlyph} className={className} />;
export const Scroll: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={ScrollGlyph} className={className} />;
export const Laurel: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={LaurelGlyph} className={className} />;
export const Column64: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={ColumnGlyph} className={className} />;
export const Gavel: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={GavelGlyph} className={className} />;
export const Shield: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={ShieldGlyph} className={className} />;
export const Amphora: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={AmphoraGlyph} className={className} />;
export const Quill: React.FC<GlyphProps> = ({ className }) => <GlyphSvg glyph={QuillGlyph} className={className} />;

// Emblema por indice (cicla entre todos): se usa en el tímpano de las tarjetas de materias.
export const Emblem: React.FC<GlyphProps & { index: number }> = ({ index, className }) => (
  <GlyphSvg glyph={GLYPHS[index % GLYPHS.length]} className={className} />
);

/* ------------------------------------------------------------------
   Columna doriga: capitel (abaco + equino), fuste acanalado y estilobato.
------------------------------------------------------------------- */

const FLUTE_ANGLES = [-72, -48, -24, 0, 24, 48, 72];

export const Column: React.FC<GlyphProps> = ({ className }) => {
  const gradientId = useId();

  return (
    <svg
      viewBox="-10 0 120 560"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      preserveAspectRatio="xMidYMax meet"
      className={`greek-svg ${className ?? ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.02" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="0.74" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* capitel */}
      <rect x="8" y="0" width="84" height="13" />
      <path d="M14 13H86C86 25 80 31 74 33H26C20 31 14 25 14 13Z" />
      <path d="M27 37H73M27 41H73" />

      {/* fuste */}
      <path d="M27 43H73L80 520H20Z" fill={`url(#${gradientId})`} />
      {FLUTE_ANGLES.map((angle) => {
        const s = Math.sin((angle * Math.PI) / 180);
        return <path key={angle} d={`M${(50 + 23 * s).toFixed(1)} 46L${(50 + 30 * s).toFixed(1)} 518`} strokeOpacity="0.5" />;
      })}

      {/* estilobato */}
      <rect x="6" y="520" width="88" height="10" />
      <rect x="-2" y="530" width="104" height="10" />
      <rect x="-10" y="540" width="120" height="14" />
    </svg>
  );
};

/* ------------------------------------------------------------------
   Fronton: cornisa con dentellones y tímpano con balanza.
------------------------------------------------------------------- */

export const Pediment: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 600 132" fill="none" stroke="currentColor" strokeWidth="1" className={`greek-svg ${className ?? ''}`} aria-hidden="true">
    <path d="M2 112L300 10L598 112Z" />
    <path d="M36 104L300 24L564 104Z" strokeOpacity="0.5" />
    <rect x="0" y="112" width="600" height="18" />
    {Array.from({ length: 48 }).map((_, i) => (
      <rect key={i} x={7 + i * 12.3} y="116" width="6" height="10" strokeOpacity="0.55" />
    ))}
    <g transform="translate(272 52) scale(0.9)">
      <ScalesGlyph />
    </g>
  </svg>
);

/* ------------------------------------------------------------------
   Friso dorico: triglifos alternados con metopas que llevan emblemas.
------------------------------------------------------------------- */

const TRIGLYPH = 40;
const METOPE = 92;
const UNIT = TRIGLYPH + METOPE;
const UNITS = 16;
const FRIEZE_WIDTH = UNITS * UNIT + TRIGLYPH;

export const Frieze: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`relative h-[84px] w-full overflow-hidden ${className ?? ''}`} aria-hidden="true">
    <svg
      viewBox={`0 0 ${FRIEZE_WIDTH} 84`}
      width={FRIEZE_WIDTH}
      height="84"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="greek-svg absolute left-1/2 top-0 max-w-none -translate-x-1/2"
    >
      <rect x="0" y="0" width={FRIEZE_WIDTH} height="9" strokeOpacity="0.7" />
      <rect x="0" y="72" width={FRIEZE_WIDTH} height="6" strokeOpacity="0.7" />
      {Array.from({ length: UNITS + 1 }).map((_, i) => {
        const x = i * UNIT;
        return (
          <g key={i}>
            <rect x={x} y="9" width={TRIGLYPH} height="63" />
            <path d={`M${x + 13.3} 9V68M${x + 26.6} 9V68`} strokeOpacity="0.55" />
            {[0, 1, 2].map((g) => (
              <circle key={g} cx={x + 7 + g * 13} cy="76" r="1.6" fill="currentColor" stroke="none" opacity="0.6" />
            ))}
            {i < UNITS && (
              <g>
                <rect x={x + TRIGLYPH} y="9" width={METOPE} height="63" strokeOpacity="0.35" />
                <g transform={`translate(${x + TRIGLYPH + METOPE / 2 - 24} 16) scale(0.75)`} strokeWidth="1.8">
                  {React.createElement(GLYPHS[i % GLYPHS.length])}
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  </div>
);

/* ------------------------------------------------------------------
   Ornamento de titulo: filete, rombo y filete.
------------------------------------------------------------------- */

export const Ornament: React.FC<{ align?: 'center' | 'left'; className?: string }> = ({ align = 'center', className }) => (
  <div
    className={`flex items-center gap-3 text-platinum-500 ${align === 'center' ? 'justify-center' : 'justify-start'} ${className ?? ''}`}
    aria-hidden="true"
  >
    {align === 'center' && <span className="h-px w-14 bg-gradient-to-r from-transparent to-current"></span>}
    <span className="block h-2 w-2 rotate-45 border border-current"></span>
    <span className="h-px w-14 bg-gradient-to-r from-current to-transparent"></span>
  </div>
);
