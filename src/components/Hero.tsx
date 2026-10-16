import type { ReactNode } from 'react'

const V = { teal: 'var(--teal)', paper: 'var(--paper)', accent: 'var(--accent)', gold: 'var(--gold)', ink: '#1F1A17', night: '#2A2420' }
const f = (c: string, o?: number) => ({ fill: c, fillOpacity: o })
const s = (c: string, w = 3) => ({ stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

/** Shared weave patterns. Render once near the top of the page. */
export function WeaveDefs() {
  const tile = (id: string, base: string, size: number, shade: string, op: number) => (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <rect width={size} height={size} style={f(base)} />
      <rect width={size / 2} height={size / 2} style={f(shade, op)} />
      <rect x={size / 2} y={size / 2} width={size / 2} height={size / 2} style={f(shade, op)} />
    </pattern>
  )
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {tile('wv-teal', V.teal, 24, '#fff', 0.09)}
        {tile('wv-gold', V.gold, 16, '#000', 0.13)}
        {tile('wv-red', V.accent, 16, '#000', 0.15)}
        {tile('wv-paper', V.paper, 14, '#000', 0.07)}
        {tile('wv-night', V.night, 20, '#fff', 0.06)}
      </defs>
    </svg>
  )
}

const art: Record<string, () => ReactNode> = {
  // 1 Retirement Plan, Yarn?: house-shaped piggy bank, thread to a small figure with a pabaon bag
  piggy: () => (
    <>
      <rect width="800" height="450" fill="url(#wv-teal)" />
      <circle cx="620" cy="120" r="68" style={f(V.gold)} />
      <path d="M0 365C200 335 330 405 520 365S760 345 800 355V450H0Z" style={f('#000', 0.22)} />
      <g transform="translate(130 112)">
        <polygon points="0,112 150,0 300,112" fill="url(#wv-red)" />
        <rect x="20" y="112" width="260" height="146" rx="6" style={f(V.paper)} />
        <rect x="120" y="172" width="60" height="86" style={f(V.teal)} />
        <rect x="52" y="142" width="46" height="44" style={f(V.gold)} />
        <rect x="202" y="142" width="46" height="44" style={f(V.gold)} />
        <rect x="128" y="-2" width="44" height="8" rx="4" style={f('#000', 0.5)} />
      </g>
      <path d="M440 305C520 250 560 335 640 295S705 275 695 305" style={{ ...s(V.paper, 3), strokeDasharray: '2 9' }} />
      <g transform="translate(652 258)">
        <circle cx="24" cy="14" r="14" style={f(V.paper)} />
        <path d="M2 104C2 52 46 52 46 104Z" style={f(V.paper)} />
        <rect x="-12" y="66" width="28" height="32" rx="5" fill="url(#wv-red)" />
      </g>
    </>
  ),
  // 2 Utang na loob: open palm and lantern
  lantern: () => (
    <>
      <rect width="800" height="450" style={f(V.teal)} />
      <g style={s('#fff', 1.5)} opacity=".13"><path d="M0 60H800M0 110H800M0 160H800M0 210H800" /></g>
      <circle cx="400" cy="200" r="160" style={f(V.gold, 0.18)} />
      <circle cx="400" cy="200" r="98" style={f(V.gold, 0.34)} />
      <rect x="372" y="150" width="56" height="88" rx="14" style={f(V.gold)} />
      <rect x="386" y="128" width="28" height="24" rx="4" style={f(V.paper)} />
      <circle cx="400" cy="194" r="14" style={f(V.paper)} />
      <path d="M170 420C250 335 330 304 400 316C470 304 550 335 630 420Z" fill="url(#wv-red)" />
      <path d="M296 334C340 282 460 282 504 334" style={s(V.paper, 10)} opacity=".9" />
      <path d="M40 400H290M510 400H760" style={s(V.paper, 2)} opacity=".45" />
    </>
  ),
  // 3 Kapwa: interlocking woven rings
  kapwa: () => (
    <>
      <rect width="800" height="450" style={f(V.paper)} />
      <rect width="800" height="450" fill="url(#wv-paper)" />
      {[
        [280, 225, 'url(#wv-teal)'],
        [400, 225, 'url(#wv-red)'],
        [520, 225, 'url(#wv-gold)'],
      ].map(([x, y, fill], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="118" style={{ fill: fill as string, fillOpacity: 0.92 }} />
      ))}
      {[280, 400, 520].map((x) => (
        <circle key={x} cx={x} cy="225" r="118" style={s(V.ink, 2)} opacity=".6" />
      ))}
      <circle cx="400" cy="225" r="26" style={f(V.paper)} />
      <circle cx="400" cy="225" r="10" style={f(V.accent)} />
    </>
  ),
  // 4 Gratitude isn't a receipt: receipt strip folding into a crane
  receipt: () => (
    <>
      <rect width="800" height="450" style={f(V.paper)} />
      <rect width="800" height="450" fill="url(#wv-paper)" />
      <g transform="translate(110 40)">
        <path d="M0 0H170V330l-14-12-14 12-14-12-14 12-14-12-14 12-14-12-14 12-14-12-14 12-14-12-14 12-14-12V0Z" style={f('#fff')} />
        <path d="M0 0H170V330" style={s(V.ink, 2)} opacity=".25" />
        {[40, 66, 92, 118, 144, 170].map((y) => (
          <path key={y} d={`M22 ${y}H${y % 52 ? 120 : 148}`} style={s(V.ink, 3)} opacity=".35" />
        ))}
        <path d="M22 230H148" style={s(V.accent, 4)} />
      </g>
      <path d="M330 250C400 220 440 180 470 180" style={{ ...s(V.accent, 3), strokeDasharray: '2 9' }} />
      <g transform="translate(470 110)">
        <polygon points="0,90 140,0 280,90 140,170" fill="url(#wv-teal)" />
        <polygon points="140,0 200,-60 190,20" style={f(V.gold)} />
        <polygon points="140,170 140,90 280,90" style={f('#000', 0.2)} />
        <polygon points="0,90 140,90 140,170" style={f('#fff', 0.12)} />
        <polygon points="280,90 330,60 300,110" style={f(V.accent)} />
      </g>
    </>
  ),
  // 5 Pananagutan: doorway, slippers, thread to a bag
  door: () => (
    <>
      <rect width="800" height="450" style={f(V.teal)} />
      <rect x="0" y="330" width="800" height="120" fill="url(#wv-night)" />
      <rect x="260" y="60" width="200" height="280" rx="4" style={f(V.paper)} />
      <rect x="282" y="82" width="156" height="258" style={f(V.gold, 0.9)} />
      <circle cx="414" cy="215" r="7" style={f(V.ink)} />
      <path d="M262 340H460" style={s(V.ink, 4)} />
      <g transform="translate(250 336)">
        <ellipse cx="30" cy="12" rx="30" ry="9" fill="url(#wv-red)" />
        <ellipse cx="82" cy="14" rx="26" ry="8" fill="url(#wv-red)" />
      </g>
      <path d="M414 215C500 240 560 300 640 330" style={s(V.paper, 3)} />
      <g transform="translate(618 318)">
        <rect x="0" y="6" width="56" height="52" rx="8" fill="url(#wv-red)" />
        <path d="M12 8C12-8 44-8 44 8" style={s(V.paper, 4)} />
      </g>
      <circle cx="650" cy="90" r="40" style={f(V.gold, 0.9)} />
    </>
  ),
  // 6 Filial piety travels: one thread across two coasts
  map: () => (
    <>
      <rect width="800" height="450" style={f(V.teal)} />
      <g style={s('#fff', 1)} opacity=".15">{[90, 180, 270, 360].map((y) => <path key={y} d={`M0 ${y}H800`} />)}{[160, 320, 480, 640].map((x) => <path key={x} d={`M${x} 0V450`} />)}</g>
      <path d="M60 330l40-50 36 20 20-44 44 24 18 52 -30 40 -60 6 -40-20z" fill="url(#wv-gold)" />
      <path d="M130 372l20 14 -8 22 -22-10z M200 350l22 10-6 20-20-8z" fill="url(#wv-gold)" />
      <path d="M560 120l60-30 90 20 20 60-30 70-70 30-80-30-20-60z" fill="url(#wv-paper)" />
      <path d="M140 296C260 90 480 60 590 140" style={s(V.accent, 5)} />
      <circle cx="140" cy="296" r="9" style={f(V.paper)} /><circle cx="590" cy="140" r="9" style={f(V.paper)} />
      <g transform="translate(120 258)"><polygon points="0,26 20,6 40,26" style={f(V.paper)} /><rect x="6" y="26" width="28" height="18" style={f(V.paper)} /></g>
      <g transform="translate(570 100)"><polygon points="0,26 20,6 40,26" style={f(V.accent)} /><rect x="6" y="26" width="28" height="18" style={f(V.accent)} /></g>
    </>
  ),
  // 7 When gratitude becomes pressure: thread pulled taut, beginning to fray
  taut: () => (
    <>
      <rect width="800" height="450" style={f(V.night)} />
      <rect x="0" y="300" width="800" height="150" fill="url(#wv-teal)" opacity=".85" />
      <circle cx="140" cy="205" r="56" fill="url(#wv-red)" />
      <circle cx="660" cy="205" r="56" fill="url(#wv-gold)" />
      <path d="M196 205H340" style={s(V.paper, 5)} />
      <path d="M340 205l11-7 11 11 12-11 9 8" style={s(V.paper, 3)} />
      <path d="M382 205l10 0M420 205l10 0" style={s(V.paper, 3)} opacity=".6" />
      <path d="M442 205l8 5 10-10 12 8 12-7H604" style={s(V.paper, 5)} />
      <path d="M362 210l-14 24M384 200l8-26M418 210l-10 26" style={s(V.paper, 2)} opacity=".7" />
    </>
  ),
  // 8 What parents expect, what children hear: two overlapping speech shapes in different weaves
  bubbles: () => (
    <>
      <rect width="800" height="450" style={f(V.paper)} />
      <rect width="800" height="450" fill="url(#wv-paper)" />
      <g>
        <path d="M120 90h300a30 30 0 0130 30v150a30 30 0 01-30 30H260l-70 60 8-60h-78a30 30 0 01-30-30V120a30 30 0 0130-30z" fill="url(#wv-teal)" />
        <path d="M380 150h300a30 30 0 0130 30v150a30 30 0 01-30 30h-62l8 60-70-60H380a30 30 0 01-30-30V180a30 30 0 0130-30z" fill="url(#wv-gold)" style={{ fillOpacity: 0.95 }} />
        <path d="M350 180v150a30 30 0 0030 30h70V180z" fill="url(#wv-red)" opacity=".0" />
        <ellipse cx="400" cy="235" rx="60" ry="76" style={f(V.accent, 0.9)} />
      </g>
      <g style={s(V.paper, 6)}><path d="M170 150H370M170 190H330M170 230H350" /></g>
      <g style={s(V.ink, 5)} opacity=".7"><path d="M470 210H640M470 250H610M470 290H630" /></g>
    </>
  ),
  // 9 Two ideas, one question: two woven circles, double arrow, scatter of rice-grain dots
  link: () => (
    <>
      <rect width="800" height="450" style={f(V.teal)} />
      <circle cx="220" cy="150" r="82" fill="url(#wv-paper)" />
      <circle cx="580" cy="150" r="82" fill="url(#wv-gold)" />
      <path d="M318 150H482M318 150l20-14M318 150l20 14M482 150l-20-14M482 150l-20 14" style={s(V.paper, 4)} />
      <text x="400" y="132" textAnchor="middle" style={{ fill: V.paper, font: '600 16px var(--font-ui)', letterSpacing: '.12em' }}>r ?</text>
      {Array.from({ length: 46 }, (_, i) => {
        const t = i / 45
        const x = 120 + t * 560
        const y = 390 - t * 140 + Math.sin(i * 12.9898) * 34
        return <ellipse key={i} cx={x} cy={y} rx="8" ry="4.5" transform={`rotate(-25 ${x} ${y})`} style={f(i % 3 ? V.paper : V.gold)} />
      })}
      <path d="M120 410H690M120 410V290" style={s(V.paper, 2)} opacity=".5" />
    </>
  ),
  // 10 What the numbers can tell us: a loom with an unfinished weave
  loom: () => (
    <>
      <rect width="800" height="450" style={f(V.paper)} />
      <rect width="800" height="450" fill="url(#wv-paper)" />
      <rect x="130" y="50" width="540" height="350" rx="6" style={s(V.ink, 6)} />
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${160 + i * 23.5} 56V394`} style={s(V.ink, 1.5)} opacity=".55" />)}
      <rect x="136" y="260" width="528" height="134" fill="url(#wv-red)" />
      <rect x="136" y="200" width="528" height="60" fill="url(#wv-gold)" />
      <rect x="136" y="150" width="528" height="50" fill="url(#wv-teal)" />
      <path d="M136 150H664" style={s(V.ink, 3)} opacity=".6" />
      <path d="M400 150C440 110 520 100 560 70" style={{ ...s(V.accent, 5), strokeDasharray: '2 10' }} />
      <rect x="520" y="56" width="90" height="22" rx="11" style={f(V.accent)} />
    </>
  ),
}

export const HERO_IDS = Object.keys(art)

export function Hero({ id, className, label }: { id: string; className?: string; label?: string }) {
  const draw = art[id] ?? art.lantern
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {draw()}
    </svg>
  )
}

/** The ampersand mark used in the header and favicon. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="15" style={f(V.teal)} />
      <path d="M21 23c-6 0-10-3-10-6.5 0-2.4 2-3.7 4-4.5 2.2-.9 3.5-2 3.5-3.6 0-1.4-1-2.3-2.4-2.3s-2.4 1-2.4 2.3c0 3 4 7.3 7.3 10.6" style={{ ...s('var(--teal-ink)', 2) }} />
      <circle cx="21" cy="23" r="1.6" style={f(V.gold)} />
    </svg>
  )
}
