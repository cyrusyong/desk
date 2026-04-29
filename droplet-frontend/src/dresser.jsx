/* global React */
const { useMemo } = React;

/* =========================================================
   Pixel-art primitive
   ========================================================= */
function PixelMap({ map, palette, px = 6, style = {}, className = "" }) {
  const rows = map;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const cells = [];
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === " " || c === "." || !palette[c]) continue;
      cells.push(
        <div
          key={y * 1000 + x}
          className="px"
          style={{
            left: x * px,
            top: y * px,
            width: px,
            height: px,
            background: palette[c],
          }}
        />,
      );
    }
  }
  return (
    <div
      className={`pixel-stage ${className}`}
      style={{
        position: "absolute",
        width: w * px,
        height: h * px,
        ...style,
      }}
    >
      {cells}
    </div>
  );
}

/* =========================================================
   USPS-style blue collection box
   Palette letters:
     A = darkest outline (near-black)
     B = deep navy shadow
     C = mid blue (body shadow)
     D = USPS blue (main body)
     E = light blue (highlight)
     H = pale-blue rim highlight
     S = floor shadow
     K = slot/cavity black
     M = chrome handle
     N = chrome shadow
     W = white placard
     R = red (eagle accent / arrow)
     L = label text dark
     T = top hood dark
     P = paper interior (visible mail)
   ========================================================= */
const boxPalette = {
  A: "#0a1422",
  B: "#0f3b6e",
  C: "#1a5da8",
  D: "#2477c9",
  E: "#4a99e2",
  H: "#a9d3f5",
  S: "rgba(10,20,34,0.35)",
  K: "#070d18",
  M: "#dadfe6",
  N: "#7d8896",
  W: "#f4ecd6",
  R: "#c8423a",
  L: "#1b2a3a",
  T: "#0d2c52",
  P: "var(--paper-file)",
  G: "var(--accent)",
};

/* Carcass = mailbox body WITH the door slot cut out (door face animates separately).
   60 wide x 92 tall. Door occupies a tilted-down rectangle near top of front. */
function buildCarcass() {
  const W = 60;
  const Ht = 92;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => {
    if (y >= 0 && y < Ht && x >= 0 && x < W) rows[y][x] = c;
  };
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);
  const vline = (x, y, h, c) => rect(x, y, 1, h, c);

  // ----- HOOD (top sloped piece) -----
  // Hood shape: trapezoidal, peaks slightly back-left
  // top row narrowest, widens going down
  // hood spans y:0..14, x: shifts in
  for (let y = 0; y < 14; y++) {
    const inset = Math.max(0, 6 - y); // narrower at top
    const left = 8 + inset;
    const right = 52 - inset;
    rect(left, y, right - left + 1, 1, "T");
  }
  // hood front face shading
  for (let y = 4; y < 14; y++) {
    const inset = Math.max(0, 6 - y);
    const left = 8 + inset + 1;
    const right = 52 - inset - 1;
    if (right >= left) rect(left, y, right - left + 1, 1, "B");
  }
  // hood top highlight strip
  for (let y = 0; y < 4; y++) {
    const inset = Math.max(0, 6 - y);
    const left = 8 + inset + 1;
    const right = 52 - inset - 1;
    if (right >= left) rect(left, y, right - left + 1, 1, "C");
  }
  // little hood front lip (overhanging body)
  hline(7, 13, 46, "A");
  hline(8, 12, 44, "A");

  // ----- BODY -----
  // body x:8..51 y:14..82
  rect(8, 14, 44, 68, "D");
  // outline
  vline(7, 14, 68, "A");
  vline(52, 14, 68, "A");
  hline(7, 82, 46, "A");
  // left highlight
  vline(8, 14, 68, "E");
  vline(9, 14, 68, "E");
  // right shadow
  vline(51, 14, 68, "B");
  vline(50, 14, 68, "C");
  // subtle horizontal panel seam
  hline(10, 48, 40, "C");
  hline(10, 49, 40, "B");

  // rivets along edges (small dark dots)
  for (let y = 18; y < 80; y += 8) {
    set(10, y, "B");
    set(49, y, "B");
    set(10, y + 1, "H");
    set(49, y + 1, "H");
  }

  // ----- DOOR CAVITY (where the pull-down door sits when closed) -----
  // cavity x:13..46 y:18..36 — black opening behind door
  rect(13, 18, 34, 19, "K");
  // cavity rim
  rect(12, 17, 36, 1, "A");
  rect(12, 37, 36, 1, "A");
  vline(12, 17, 21, "A");
  vline(47, 17, 21, "A");
  // inner top shadow inside cavity (mail interior peek)
  rect(14, 19, 32, 2, "B");

  // ----- USPS PLACARD -----
  // white panel below the door with stylized "U.S. MAIL"
  rect(14, 42, 32, 8, "W");
  rect(13, 42, 1, 8, "A");
  rect(46, 42, 1, 8, "A");
  rect(14, 41, 32, 1, "A");
  rect(14, 50, 32, 1, "A");
  // approximate "U.S. MAIL" via blocks (stylized, not a real logo)
  // U
  rect(16, 44, 1, 4, "L"); rect(18, 44, 1, 4, "L"); rect(17, 47, 1, 1, "L");
  // .
  rect(20, 47, 1, 1, "L");
  // S
  rect(22, 44, 3, 1, "L"); rect(22, 45, 1, 1, "L");
  rect(22, 46, 3, 1, "L"); rect(24, 47, 1, 1, "L"); rect(22, 47, 3, 1, "L");
  // gap
  // M
  rect(27, 44, 1, 4, "L"); rect(31, 44, 1, 4, "L");
  set(28, 45, "L"); set(30, 45, "L"); set(29, 46, "L");
  // A
  rect(33, 45, 1, 3, "L"); rect(36, 45, 1, 3, "L");
  rect(34, 44, 2, 1, "L"); rect(34, 46, 2, 1, "L");
  // I
  rect(38, 44, 1, 4, "L");
  // L
  rect(40, 44, 1, 4, "L"); rect(41, 47, 2, 1, "L");

  // tiny red eagle accent dot above placard
  rect(28, 39, 4, 1, "R");
  set(27, 40, "R"); set(32, 40, "R");

  // ----- COLLECTION SCHEDULE PANEL (tiny rectangle under placard) -----
  rect(18, 56, 24, 14, "B");
  rect(19, 57, 22, 12, "C");
  // "schedule" lines
  for (let i = 0; i < 4; i++) {
    rect(21, 59 + i * 2, 18, 1, "H");
  }

  // ----- FEET -----
  rect(10, 82, 6, 4, "B");
  rect(10, 82, 6, 1, "A");
  rect(44, 82, 6, 4, "B");
  rect(44, 82, 6, 1, "A");
  // left-foot highlight
  rect(11, 83, 1, 2, "C");
  rect(45, 83, 1, 2, "C");

  // ----- FLOOR SHADOW -----
  rect(4, 86, 52, 2, "S");
  rect(2, 87, 56, 1, "S");

  return rows.map((r) => r.join(""));
}

/* DOOR FACE — pull-down hinged door. 36 wide x 21 tall.
   When openAmount=1 it rotates forward+down on bottom hinge so its top edge tilts toward the viewer,
   revealing the cavity behind. */
function buildDoorFace() {
  const W = 36;
  const Ht = 21;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);
  const vline = (x, y, h, c) => rect(x, y, 1, h, c);

  // outline
  rect(0, 0, W, Ht, "A");
  // body (slightly darker blue than mailbox to read as a separate plane)
  rect(1, 1, W - 2, Ht - 2, "C");
  rect(2, 2, W - 4, Ht - 4, "D");
  // top edge highlight (this is the lip the user pulls)
  hline(1, 1, W - 2, "E");
  hline(2, 2, W - 4, "H");
  // left highlight, right shadow
  vline(2, 2, Ht - 4, "E");
  vline(W - 3, 2, Ht - 4, "B");
  hline(2, Ht - 3, W - 4, "B");

  // chrome handle (centered, top third) — a horizontal pull bar
  rect(11, 5, 14, 3, "A");
  rect(12, 6, 12, 1, "M");
  rect(12, 7, 12, 1, "N");
  // little screw highlights
  set(12, 6, "H");
  set(23, 6, "H");

  // engraved arrow pointing into slot
  // small horizontal slit just below handle
  rect(8, 11, 20, 2, "A");
  rect(9, 11, 18, 1, "K");
  rect(9, 12, 18, 1, "K");
  // arrow "MAIL >" hint (just a tiny chevron)
  rect(15, 15, 6, 1, "B");
  set(20, 14, "B"); set(20, 16, "B");
  set(21, 15, "B");

  // hinge dots at bottom corners (visible on door)
  set(2, Ht - 2, "M");
  set(W - 3, Ht - 2, "M");

  return rows.map((r) => r.join(""));
}

const CARCASS = buildCarcass();
const DOOR_FACE = buildDoorFace();

/* Interior view — mail visible inside cavity when door is open.
   Sized to fill the cavity (32 wide x 17 tall ~ x:14..46 y:18..35 in carcass).
   Shows stacked envelopes/files growing with fileCount. */
function buildInterior(fileCount) {
  const W = 32;
  const Ht = 17;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };

  // dark cavity
  rect(0, 0, W, Ht, "K");
  // back wall lighter
  rect(2, 1, W - 4, Ht - 6, "B");
  // floor of cavity
  rect(2, Ht - 5, W - 4, 4, "T");

  // stack of envelopes — heights grow with fileCount, capped
  const visible = Math.min(fileCount, 6);
  for (let i = 0; i < visible; i++) {
    const y = Ht - 5 - i; // each envelope 1px taller stack
    const x = 4 + (i % 2) * 2;
    const w = W - 8 - (i % 3);
    rect(x, y, w, 1, "P");
    set(x, y, "A");
    set(x + w - 1, y, "A");
    // little stamp corner
    set(x + w - 2, y, "G");
  }

  return rows.map((r) => r.join(""));
}

/* =========================================================
   Mailbox component (drop-in replacement for Dresser)
   ========================================================= */
function Dresser({ openAmount = 0, fileCount = 0, shaking = false, px = 6, hoverOpen = false, onDoorClick }) {
  const carcassMap = useMemo(() => CARCASS, []);
  const doorMap = useMemo(() => DOOR_FACE, []);
  const interiorMap = useMemo(() => buildInterior(fileCount), [fileCount]);

  // door origin in carcass coords: x=12, y=17 (closed flush)
  // door is 36w x 21h; pivot on bottom edge so it tilts forward+down
  const doorX = 12 * px;
  const doorY = 17 * px;

  const t = openAmount;
  // forward tilt: rotate around bottom edge. Cap at ~55° so it reads as hinged,
  // not detached. No vertical translation — pivot stays planted on the cavity lip.
  const rot = Math.max(t * 55, hoverOpen ? 14 : 0);
  const ty = 0;

  return (
    <div
      className={`scene ${shaking ? "shaking" : ""}`}
      style={{
        width: 60 * px,
        height: 96 * px,
        perspective: 600,
      }}
    >
      {/* carcass (back layer with cavity exposed) */}
      <PixelMap map={carcassMap} palette={boxPalette} px={px} />

      {/* interior — sits inside cavity */}
      <div
        style={{
          position: "absolute",
          left: 14 * px,
          top: 18 * px,
          opacity: t > 0.05 ? 1 : 0,
          transition: "opacity 0.18s",
        }}
      >
        <PixelMap map={interiorMap} palette={boxPalette} px={px} />
      </div>

      {/* hinge band — a fixed dark strip along the bottom of the door cavity
          so the eye reads the rotating door as still attached at its hinge. */}
      <div
        style={{
          position: "absolute",
          left: doorX,
          top: doorY + 20 * px,
          width: 36 * px,
          height: 1 * px,
          background: "#0a1422",
          zIndex: 1,
        }}
      />

      {/* door face — pivots on bottom edge, falling toward viewer */}
      <div
        onClick={(e) => {
          if (onDoorClick) {
            e.stopPropagation();
            onDoorClick();
          }
        }}
        style={{
          position: "absolute",
          left: doorX,
          top: doorY,
          width: 36 * px,
          height: 21 * px,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 100%",
          transform: `rotateX(${rot}deg)`,
          transition: "transform 0.4s cubic-bezier(.22,1.2,.36,1)",
          filter: t > 0.05 || hoverOpen ? "brightness(1.05)" : "none",
          zIndex: 2,
          cursor: onDoorClick ? "pointer" : "default",
        }}
      >
        <PixelMap
          map={doorMap}
          palette={boxPalette}
          px={px}
          style={{ position: "absolute", left: 0, top: 0 }}
        />
      </div>

      {/* small dust motes when open */}
      {t > 0.5 && (
        <>
          <span
            className="mote"
            style={{ left: 22 * px, top: 26 * px }}
          />
          <span
            className="mote"
            style={{
              left: 32 * px,
              top: 22 * px,
              animationDelay: "0.4s",
            }}
          />
          <span
            className="mote"
            style={{
              left: 40 * px,
              top: 28 * px,
              animationDelay: "0.8s",
            }}
          />
        </>
      )}
    </div>
  );
}

/* =========================================================
   File / envelope sprite
   ========================================================= */
function buildFileSprite() {
  const W = 22;
  const Ht = 16;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);

  // envelope outline
  rect(1, 2, W - 2, Ht - 3, "A");
  rect(2, 3, W - 4, Ht - 5, "P");
  // flap (V shape lines)
  for (let i = 0; i < 9; i++) {
    set(2 + i, 3 + i, "A");
    set(W - 3 - i, 3 + i, "A");
  }
  // stamp
  rect(W - 6, 4, 3, 3, "C");
  set(W - 5, 5, "G");
  // address line
  hline(4, 11, 8, "L");
  hline(4, 12, 6, "L");
  // shadow underline
  hline(2, Ht - 2, W - 4, "A");
  return rows.map((r) => r.join(""));
}

const filePalette = {
  A: "#1b2a3a",
  P: "#f6efd8",
  L: "#a89868",
  C: "var(--accent)",
  G: "#d6a72a",
};

function FileSprite({ px = 4, style = {} }) {
  const map = useMemo(() => buildFileSprite(), []);
  return (
    <div
      style={{
        position: "relative",
        width: 22 * px,
        height: 16 * px,
        ...style,
      }}
    >
      <PixelMap map={map} palette={filePalette} px={px} />
    </div>
  );
}

window.Dresser = Dresser;
window.FileSprite = FileSprite;
window.PixelMap = PixelMap;
