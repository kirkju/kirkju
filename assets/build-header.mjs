// Generates the two profile header variants (dark and light) from one template.
// Usage: node assets/build-header.mjs   (writes header-dark.svg and header-light.svg next to this file)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.argv[2] ?? dirname(fileURLToPath(import.meta.url));

// Palettes taken from the portfolio's own design tokens (globals.css).
const palettes = {
  dark: {
    bg: "#050b18", border: "#1b2b47", heading: "#f3f6fb", muted: "#93a4be",
    accent: "#22d3ee", grid: "rgb(148 163 184 / 0.09)", gridStrong: "rgb(148 163 184 / 0.22)",
    glow: "rgb(34 211 238 / 0.10)",
  },
  light: {
    bg: "#f7f9fc", border: "#dce3ee", heading: "#0b2a5e", muted: "#4a5b73",
    accent: "#0e7490", grid: "rgb(11 42 94 / 0.07)", gridStrong: "rgb(11 42 94 / 0.20)",
    glow: "rgb(14 116 144 / 0.09)",
  },
};

// Typed line: every character gets its own x position and its own delay, so the effect is
// the same in any monospace font and needs no mask over the background.
const TYPED = ".NET · React · Rust · Python · applied AI";
const CHAR_W = 8.4;                       // 14px monospace advance
const TYPED_W = +(TYPED.length * CHAR_W).toFixed(1);
const TYPE_START = 0.9;                   // seconds
const STEP = 0.045;                       // seconds per character
const TYPE_DUR = +(TYPED.length * STEP).toFixed(2);
const typedSpans = [...TYPED]
  .map((ch, i) => (ch === " " ? "" : `<tspan class="ch" x="${(44 + i * CHAR_W).toFixed(1)}" style="animation-delay:${(TYPE_START + i * STEP).toFixed(3)}s">${ch}</tspan>`))
  .join("");

// Observed series (dots), then the forecast that continues from the last one.
const observed = [
  [432, 152], [446.5, 148], [461, 140], [475.5, 131], [490, 135],
  [504.5, 127], [519, 114], [533.5, 105], [548, 96],
];
// What "happened next": three land inside the 80% band, one outside it (inside the 95%).
const later = [[576, 85], [604, 74], [632, 86], [660, 121]];

const svg = (p) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 220" width="720" height="220" role="img" aria-labelledby="t d">
  <title id="t">Alejandro Vargas, Computer Systems Engineer</title>
  <desc id="d">A chart draws a series of observations, then a forecast with its uncertainty bands, and finally the values observed afterwards.</desc>
  <!--
    A forecast, its 80% and 95% intervals, and what happened next.
    One point lands outside the 80% band on purpose: calibrated uncertainty is supposed to miss sometimes.
  -->
  <style>
    .sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    .rise  { animation: rise .7s cubic-bezier(.22,1,.36,1) both; }
    .pop   { transform-box: fill-box; transform-origin: center; animation: pop .45s cubic-bezier(.34,1.56,.64,1) both; }
    .draw  { stroke-dasharray: 1; animation: draw 1.2s cubic-bezier(.65,0,.35,1) both; }
    .fade  { animation: fade .6s ease-out both; }
    .unfold { transform-box: fill-box; transform-origin: 0 50%; animation: unfold 1.2s cubic-bezier(.65,0,.35,1) both; }
    .ch    { animation: show .01s linear both; }
    .caret { animation: caret ${TYPE_DUR}s steps(${TYPED.length}, start) ${TYPE_START}s both, blink 1s steps(1, end) ${(TYPE_START + TYPE_DUR).toFixed(2)}s 5 both, fadeout .4s ease-in ${(TYPE_START + TYPE_DUR + 5).toFixed(2)}s forwards; }
    .pulse { transform-box: fill-box; transform-origin: center; animation: fade .4s ease-out 2.9s both, pulse 2.8s ease-out 3.3s infinite; }
    .egg   { opacity: 0; animation: egg 9s ease-in-out 30s 1 both; }
    @keyframes rise   { from { opacity: 0; transform: translateY(8px); } }
    @keyframes pop    { from { opacity: 0; transform: scale(0); } }
    @keyframes draw   { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @keyframes fade   { from { opacity: 0; } }
    @keyframes unfold { from { opacity: 0; transform: scaleX(0); } }
    @keyframes show   { from { fill-opacity: 0; } }
    @keyframes caret  { from { transform: translateX(0); } to { transform: translateX(${TYPED_W}px); } }
    @keyframes blink  { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes fadeout { to { opacity: 0; } }
    @keyframes pulse  { 0% { transform: scale(1); opacity: .55; } 70%, 100% { transform: scale(3.4); opacity: 0; } }
    @keyframes egg    { 0%, 100% { opacity: 0; } 12%, 88% { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
      .caret, .pulse { display: none; }
    }
  </style>
  <defs>
    <radialGradient id="glow" cx="78%" cy="45%" r="55%">
      <stop offset="0" stop-color="${p.glow}"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect x=".5" y=".5" width="719" height="219" rx="14" fill="${p.bg}" stroke="${p.border}"/>
  <rect x=".5" y=".5" width="719" height="219" rx="14" fill="url(#glow)"/>

  <!-- Name and role -->
  <text class="mono rise" x="44" y="78" font-size="11.5" letter-spacing="1.7" fill="${p.accent}" style="animation-delay:.05s">COMPUTER SYSTEMS ENGINEER</text>
  <text class="sans rise" x="43" y="121" font-size="38" font-weight="600" letter-spacing="-.6" fill="${p.heading}" style="animation-delay:.15s">Alejandro Vargas</text>
  <text class="mono" y="155" font-size="14" fill="${p.muted}">${typedSpans}</text>
  <rect class="caret" x="46" y="142.5" width="2" height="16" rx="1" fill="${p.accent}"/>
  <text class="mono egg" x="44" y="194" font-size="10" fill="${p.muted}">psst: there is a note in this README's source</text>

  <!-- Chart: observations, forecast with 95% and 80% bands, and what was observed afterwards -->
  <g class="fade" style="animation-delay:.25s" stroke="${p.grid}" stroke-width="1">
    <path d="M432 52H676M432 92H676M432 132H676"/>
    <path d="M432 172H676" stroke="${p.gridStrong}"/>
  </g>
  <path class="draw" pathLength="1" style="animation-duration:.9s;animation-delay:.45s" fill="none" stroke="${p.muted}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" d="M${observed.map((o) => o.join(" ")).join("L")}"/>
  ${observed.map(([x, y], i) => `<circle class="pop" style="animation-delay:${(0.45 + i * 0.09).toFixed(2)}s" cx="${x}" cy="${y}" r="2.7" fill="${p.muted}"/>`).join("\n  ")}
  <path class="fade" style="animation-delay:1.3s" d="M548 46V172" stroke="${p.gridStrong}" stroke-width="1" stroke-dasharray="3 4"/>
  <path class="unfold" style="animation-delay:1.5s" fill="${p.accent}" fill-opacity=".10" d="M548 96C568 68 588 46 608 43C632 40 656 46 676 53V141C656 126 632 108 608 98C588 90 568 94 548 96Z"/>
  <path class="unfold" style="animation-delay:1.5s" fill="${p.accent}" fill-opacity=".17" d="M548 96C568 76 588 57 608 55C632 53 656 60 676 68V118C656 106 632 92 608 86C588 82 568 90 548 96Z"/>
  <path class="draw" pathLength="1" style="animation-delay:1.5s" fill="none" stroke="${p.accent}" stroke-width="2" stroke-linecap="round" d="M548 96C566 83 586 70 606 70C630 70 654 80 676 92"/>
  <circle class="pulse" cx="676" cy="92" r="3" fill="${p.accent}"/>
  <circle class="pop" style="animation-delay:2.7s" cx="676" cy="92" r="3" fill="${p.accent}"/>
  ${later.map(([x, y], i) => `<circle class="pop" style="animation-delay:${(3.4 + i * 0.45).toFixed(2)}s" cx="${x}" cy="${y}" r="3" fill="${p.bg}" stroke="${p.heading}" stroke-width="1.5"/>`).join("\n  ")}
</svg>
`;

mkdirSync(outDir, { recursive: true });
for (const [name, p] of Object.entries(palettes)) {
  const file = join(outDir, `header-${name}.svg`);
  writeFileSync(file, svg(p), "utf8");
  console.log("wrote", file);
}
