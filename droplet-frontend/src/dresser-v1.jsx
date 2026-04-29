/* global React */
const { useMemo } = React;

/* =========================================================
   Pixel-art primitives
   A "pixel map" is an array of strings, each char = one cell.
   Empty/space = transparent. Otherwise key into a palette.
   ========================================================= */

function PixelMap({ map, palette, px = 6, style = {}, className = "" }) {
  const rows = map;
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  // Render via single SVG-like grid of <div> for crispness.
  // For perf we batch rows.
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
   Dresser body — a tall cabinet with three drawer slots.
   Top drawer is the "active" one; middle/bottom are decoration.
   Built as a single pixel map for the carcass + face.
   ========================================================= */

// Palette letters:
//  A = darkest outline
//  B = wood-4 deep shadow
//  C = wood-3 mid-dark
//  D = wood-2 mid
//  E = wood-1 light
//  H = wood-hl highlight
//  S = shadow-on-floor
//  K = drawer slot black (interior)
//  M = metal handle
//  N = metal-deep handle shadow

const dresserPalette = {
  A: "var(--shadow)",
  B: "var(--wood-4)",
  C: "var(--wood-3)",
  D: "var(--wood-2)",
  E: "var(--wood-1)",
  H: "var(--wood-hl)",
  S: "rgba(42,22,10,0.35)",
  K: "#1a0d05",
  M: "var(--metal)",
  N: "var(--metal-deep)",
  T: "#2a160a", // top surface dark
};

/* Carcass = the dresser WITHOUT the top drawer face (so we can animate the face).
   60 wide x 92 tall pixel-cells. */
function buildCarcass() {
  const W = 60;
  const H = 92;
  const rows = Array.from({ length: H }, () => Array(W).fill(" "));
  const set = (x, y, c) => {
    if (y >= 0 && y < H && x >= 0 && x < W) rows[y][x] = c;
  };
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);
  const vline = (x, y, h, c) => rect(x, y, 1, h, c);

  // Outline / body
  rect(8, 4, 46, 4, "T"); // top surface (will be covered by top plate)
  vline(6, 8, 82, "A");
  vline(53, 8, 82, "A");
  hline(6, 89, 48, "A");
  hline(6, 8, 48, "A");

  // Front face fill
  rect(7, 9, 46, 80, "D");
  for (let y = 9; y < 89; y++) {
    if ((y % 7) === 0) {
      for (let x = 7; x < 53; x++) {
        if (x % 11 === 3) set(x, y, "C");
      }
    }
    if (y % 5 === 2) {
      for (let x = 8; x < 52; x++) if ((x + y) % 13 === 0) set(x, y, "E");
    }
  }
  vline(7, 9, 80, "E"); // left edge highlight
  vline(52, 9, 80, "B"); // right edge shadow

  // Top plate
  rect(4, 2, 52, 2, "T");
  rect(3, 4, 54, 3, "A");
  rect(4, 5, 52, 2, "B");
  rect(4, 0, 52, 2, "B");
  rect(5, 0, 50, 1, "C");
  hline(5, 4, 50, "C");

  // Drawer separators
  hline(8, 38, 44, "A");
  hline(8, 39, 44, "B");
  hline(8, 64, 44, "A");
  hline(8, 65, 44, "B");

  // Middle drawer face
  rect(11, 42, 38, 20, "C");
  rect(12, 43, 36, 18, "D");
  hline(12, 43, 36, "E");
  vline(12, 43, 18, "E");
  hline(12, 60, 36, "B");
  vline(47, 44, 17, "B");
  rect(27, 50, 6, 4, "A");
  rect(28, 51, 4, 2, "M");
  set(28, 52, "N");
  set(31, 52, "N");

  // Bottom drawer face
  rect(11, 68, 38, 18, "C");
  rect(12, 69, 36, 16, "D");
  hline(12, 69, 36, "E");
  vline(12, 69, 16, "E");
  hline(12, 84, 36, "B");
  vline(47, 70, 14, "B");
  rect(27, 75, 6, 4, "A");
  rect(28, 76, 4, 2, "M");
  set(28, 77, "N");
  set(31, 77, "N");

  // Top drawer SLOT
  rect(9, 11, 42, 25, "K");
  hline(9, 11, 42, "A");
  hline(9, 12, 42, "B");
  vline(9, 11, 25, "A");
  vline(50, 11, 25, "A");
  hline(9, 35, 42, "A");

  // Floor shadow
  rect(2, 90, 56, 2, "S");
  rect(0, 91, 60, 1, "S");

  // Convert rows to strings
  return rows.map((r) => r.join(""));
}

/* Top drawer FACE (closed look) — 44 wide x 25 tall.
   It gets translated/rotated to animate "pulling out". */
function buildDrawerFace() {
  const W = 46;
  const Ht = 27;
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
  rect(1, 1, W - 2, Ht - 2, "C");
  rect(2, 2, W - 4, Ht - 4, "D");
  // inner panel inset
  rect(4, 4, W - 8, Ht - 8, "C");
  rect(5, 5, W - 10, Ht - 10, "D");
  // hl edges
  hline(5, 5, W - 10, "E");
  vline(5, 5, Ht - 10, "E");
  // shadow edges
  hline(5, Ht - 6, W - 10, "B");
  vline(W - 6, 6, Ht - 11, "B");
  // wood grain flecks
  for (let y = 6; y < Ht - 6; y++) {
    for (let x = 6; x < W - 6; x++) {
      if ((x * 3 + y * 7) % 19 === 0) set(x, y, "E");
      if ((x * 5 + y * 2) % 23 === 0) set(x, y, "C");
    }
  }
  // handle (centered)
  const hx = Math.floor(W / 2) - 4;
  const hy = Math.floor(Ht / 2) - 2;
  rect(hx, hy, 8, 5, "A");
  rect(hx + 1, hy + 1, 6, 3, "M");
  set(hx + 1, hy + 3, "N");
  set(hx + 6, hy + 3, "N");
  set(hx + 1, hy + 1, "H");
  set(hx + 2, hy + 1, "H");

  // outer top hl
  hline(1, 1, W - 2, "E");
  vline(1, 1, Ht - 2, "E");
  hline(1, Ht - 2, W - 2, "B");
  vline(W - 2, 1, Ht - 2, "B");

  return rows.map((r) => r.join(""));
}

const CARCASS = buildCarcass();
const DRAWER_FACE = buildDrawerFace();

/* The drawer "interior" tile shown when the drawer is pulled out — top-down view of files.
   This is a small map drawn between the carcass and the drawer face when open. */
function buildDrawerInterior(fileCount) {
  // 42 wide x 14 tall — appears stacked behind drawer face when it tilts out
  const W = 42;
  const H = 14;
  const rows = Array.from({ length: H }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };
  // floor of drawer
  rect(0, 0, W, H, "K");
  rect(1, 1, W - 2, H - 2, "B");
  rect(2, 2, W - 4, H - 4, "C");

  // Draw little file folder tabs sticking up — count varies with files
  // Files appear as tiny manila tabs across the top
  const maxTabs = 8;
  const n = Math.min(fileCount, maxTabs);
  for (let i = 0; i < n; i++) {
    const x = 4 + i * 4;
    rect(x, 3, 3, 4, "F"); // file body
    set(x, 3, "G");
    set(x + 2, 3, "G");
  }
  return rows.map((r) => r.join(""));
}

/* ========================================================= */

function Dresser({ openAmount = 0, fileCount = 0, shaking = false, px = 6 }) {
  // openAmount: 0 = closed, 1 = fully open
  const carcassMap = useMemo(() => CARCASS, []);
  const faceMap = useMemo(() => DRAWER_FACE, []);
  const interiorMap = useMemo(
    () => buildDrawerInterior(fileCount),
    [fileCount],
  );

  // drawer face origin: x=7 y=10 in carcass coordinates (so it sits over the slot)
  const slotX = 7 * px;
  const slotY = 10 * px;

  // when open, the face moves outward toward the viewer (down + slight scale)
  // Use translateY for "pulling out" + slight rotateX for tilt
  const t = openAmount;
  const ty = t * 18 * px; // pull down/forward
  const tx = t * 2 * px;
  const rot = t * 14; // degrees
  const scale = 1 + t * 0.06;

  return (
    <div
      className={`scene ${shaking ? "shaking" : ""}`}
      style={{
        width: 60 * px,
        height: 96 * px,
      }}
    >
      {/* carcass (back layer) */}
      <PixelMap map={carcassMap} palette={dresserPalette} px={px} />

      {/* drawer interior — visible when open */}
      <div
        style={{
          position: "absolute",
          left: slotX + 2 * px,
          top: slotY + 4 * px,
          opacity: t > 0.05 ? 1 : 0,
          transition: "opacity 0.18s",
        }}
      >
        <PixelMap
          map={interiorMap}
          palette={{
            ...dresserPalette,
            F: "var(--paper-file)",
            G: "var(--accent)",
          }}
          px={px}
        />
      </div>

      {/* drawer face (animated) */}
      <div
        style={{
          position: "absolute",
          left: slotX,
          top: slotY,
          transform: `translate(${tx}px, ${ty}px) rotateX(${-rot}deg) scale(${scale})`,
          transformOrigin: "50% 0%",
          transition: "transform 0.32s cubic-bezier(.22,1.2,.36,1)",
          filter: t > 0.05 ? "brightness(1.06)" : "none",
        }}
      >
        <PixelMap map={faceMap} palette={dresserPalette} px={px} />
        {/* drawer top edge — a thin slab above the face giving 'thickness' */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: -2 * px,
            width: 46 * px,
            height: 2 * px,
            background: "var(--wood-3)",
            boxShadow: `0 ${px}px 0 0 var(--wood-4)`,
          }}
        />
      </div>

      {/* motes when open */}
      {t > 0.5 && (
        <>
          <span
            className="mote"
            style={{ left: slotX + 14 * px, top: slotY + 8 * px }}
          />
          <span
            className="mote"
            style={{
              left: slotX + 28 * px,
              top: slotY + 10 * px,
              animationDelay: "0.4s",
            }}
          />
          <span
            className="mote"
            style={{
              left: slotX + 36 * px,
              top: slotY + 6 * px,
              animationDelay: "0.8s",
            }}
          />
        </>
      )}
    </div>
  );
}

/* =========================================================
   File pixel sprite — a little folded paper with a colored corner.
   Used for the ghost following the cursor and the flying file.
   ========================================================= */

function buildFileSprite(accent = "C") {
  // 18x22
  const W = 18;
  const H = 22;
  const rows = Array.from({ length: H }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) set(xx, yy, c);
  };

  // outline
  rect(2, 1, 12, 20, "A");
  // body
  rect(3, 2, 11, 19, "P"); // paper
  // folded corner
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4 - i; j++) {
      set(13 - j, 2 + i, "A");
    }
  }
  rect(11, 2, 3, 4, "A");
  rect(11, 2, 2, 3, "F"); // fold shadow
  // accent corner stripe
  rect(3, 17, 11, 1, "A");
  rect(3, 18, 11, 3, accent);
  // lines on paper
  rect(5, 6, 7, 1, "L");
  rect(5, 9, 7, 1, "L");
  rect(5, 12, 5, 1, "L");
  // top/bottom shadows
  rect(3, 20, 11, 1, "A");
  return rows.map((r) => r.join(""));
}

const filePalette = {
  A: "var(--ink)",
  P: "var(--paper-file)",
  F: "#d8c69a",
  L: "var(--paper-file-line)",
  C: "var(--accent)",
  R: "var(--accent)",
  G: "#3d7a4a",
  B2: "#2f5d8a",
  Y: "#d6a72a",
  V: "#7a3d8a",
};

function FileSprite({ accent = "C", px = 4, style = {} }) {
  const map = useMemo(() => buildFileSprite(accent), [accent]);
  return (
    <div style={{ position: "relative", width: 18 * px, height: 22 * px, ...style }}>
      <PixelMap map={map} palette={filePalette} px={px} />
    </div>
  );
}

window.Dresser = Dresser;
window.FileSprite = FileSprite;
window.PixelMap = PixelMap;
