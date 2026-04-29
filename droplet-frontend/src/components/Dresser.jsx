import { useMemo } from "react";

export function PixelMap({ map, palette, px = 6, style = {}, className = "" }) {
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
          style={{ left: x * px, top: y * px, width: px, height: px, background: palette[c] }}
        />,
      );
    }
  }
  return (
    <div
      className={`pixel-stage ${className}`}
      style={{ position: "absolute", width: w * px, height: h * px, ...style }}
    >
      {cells}
    </div>
  );
}

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

function buildCarcass() {
  const W = 60;
  const Ht = 92;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => { if (y >= 0 && y < Ht && x >= 0 && x < W) rows[y][x] = c; };
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, c); };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);
  const vline = (x, y, h, c) => rect(x, y, 1, h, c);

  for (let y = 0; y < 14; y++) {
    const inset = Math.max(0, 6 - y);
    const left = 8 + inset;
    const right = 52 - inset;
    rect(left, y, right - left + 1, 1, "T");
  }
  for (let y = 4; y < 14; y++) {
    const inset = Math.max(0, 6 - y);
    const left = 8 + inset + 1;
    const right = 52 - inset - 1;
    if (right >= left) rect(left, y, right - left + 1, 1, "B");
  }
  for (let y = 0; y < 4; y++) {
    const inset = Math.max(0, 6 - y);
    const left = 8 + inset + 1;
    const right = 52 - inset - 1;
    if (right >= left) rect(left, y, right - left + 1, 1, "C");
  }
  hline(7, 13, 46, "A");
  hline(8, 12, 44, "A");

  rect(8, 14, 44, 68, "D");
  vline(7, 14, 68, "A");
  vline(52, 14, 68, "A");
  hline(7, 82, 46, "A");
  vline(8, 14, 68, "E");
  vline(9, 14, 68, "E");
  vline(51, 14, 68, "B");
  vline(50, 14, 68, "C");
  hline(10, 48, 40, "C");
  hline(10, 49, 40, "B");

  for (let y = 18; y < 80; y += 8) {
    set(10, y, "B"); set(49, y, "B");
    set(10, y + 1, "H"); set(49, y + 1, "H");
  }

  rect(13, 18, 34, 19, "K");
  rect(12, 17, 36, 1, "A");
  rect(12, 37, 36, 1, "A");
  vline(12, 17, 21, "A");
  vline(47, 17, 21, "A");
  rect(14, 19, 32, 2, "B");

  rect(14, 42, 32, 8, "W");
  rect(13, 42, 1, 8, "A");
  rect(46, 42, 1, 8, "A");
  rect(14, 41, 32, 1, "A");
  rect(14, 50, 32, 1, "A");
  rect(16, 44, 1, 4, "L"); rect(18, 44, 1, 4, "L"); rect(17, 47, 1, 1, "L");
  rect(20, 47, 1, 1, "L");
  rect(22, 44, 3, 1, "L"); rect(22, 45, 1, 1, "L");
  rect(22, 46, 3, 1, "L"); rect(24, 47, 1, 1, "L"); rect(22, 47, 3, 1, "L");
  rect(27, 44, 1, 4, "L"); rect(31, 44, 1, 4, "L");
  set(28, 45, "L"); set(30, 45, "L"); set(29, 46, "L");
  rect(33, 45, 1, 3, "L"); rect(36, 45, 1, 3, "L");
  rect(34, 44, 2, 1, "L"); rect(34, 46, 2, 1, "L");
  rect(38, 44, 1, 4, "L");
  rect(40, 44, 1, 4, "L"); rect(41, 47, 2, 1, "L");

  rect(28, 39, 4, 1, "R");
  set(27, 40, "R"); set(32, 40, "R");

  rect(18, 56, 24, 14, "B");
  rect(19, 57, 22, 12, "C");
  for (let i = 0; i < 4; i++) { rect(21, 59 + i * 2, 18, 1, "H"); }

  rect(10, 82, 6, 4, "B"); rect(10, 82, 6, 1, "A");
  rect(44, 82, 6, 4, "B"); rect(44, 82, 6, 1, "A");
  rect(11, 83, 1, 2, "C"); rect(45, 83, 1, 2, "C");

  rect(4, 86, 52, 2, "S");
  rect(2, 87, 56, 1, "S");

  return rows.map((r) => r.join(""));
}

function buildDoorFace() {
  const W = 36;
  const Ht = 21;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, c); };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);
  const vline = (x, y, h, c) => rect(x, y, 1, h, c);

  rect(0, 0, W, Ht, "A");
  rect(1, 1, W - 2, Ht - 2, "C");
  rect(2, 2, W - 4, Ht - 4, "D");
  hline(1, 1, W - 2, "E");
  hline(2, 2, W - 4, "H");
  vline(2, 2, Ht - 4, "E");
  vline(W - 3, 2, Ht - 4, "B");
  hline(2, Ht - 3, W - 4, "B");

  rect(11, 5, 14, 3, "A");
  rect(12, 6, 12, 1, "M");
  rect(12, 7, 12, 1, "N");
  set(12, 6, "H"); set(23, 6, "H");

  rect(8, 11, 20, 2, "A");
  rect(9, 11, 18, 1, "K");
  rect(9, 12, 18, 1, "K");
  rect(15, 15, 6, 1, "B");
  set(20, 14, "B"); set(20, 16, "B"); set(21, 15, "B");

  set(2, Ht - 2, "M"); set(W - 3, Ht - 2, "M");

  return rows.map((r) => r.join(""));
}

function buildInterior(fileCount) {
  const W = 32;
  const Ht = 17;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, c); };

  rect(0, 0, W, Ht, "K");
  rect(2, 1, W - 4, Ht - 6, "B");
  rect(2, Ht - 5, W - 4, 4, "T");

  const visible = Math.min(fileCount, 6);
  for (let i = 0; i < visible; i++) {
    const y = Ht - 5 - i;
    const x = 4 + (i % 2) * 2;
    const w = W - 8 - (i % 3);
    rect(x, y, w, 1, "P");
    set(x, y, "A"); set(x + w - 1, y, "A");
    set(x + w - 2, y, "G");
  }

  return rows.map((r) => r.join(""));
}

const CARCASS = buildCarcass();
const DOOR_FACE = buildDoorFace();

export function Dresser({ openAmount = 0, fileCount = 0, shaking = false, px = 6, hoverOpen = false }) {
  const carcassMap = useMemo(() => CARCASS, []);
  const doorMap = useMemo(() => DOOR_FACE, []);
  const interiorMap = useMemo(() => buildInterior(fileCount), [fileCount]);

  const doorX = 12 * px;
  const doorY = 17 * px;

  const t = openAmount;
  const rot = Math.max(t * 55, hoverOpen ? 14 : 0);

  return (
    <div
      className={`scene ${shaking ? "shaking" : ""}`}
      style={{ width: 60 * px, height: 96 * px, perspective: 600 }}
    >
      <PixelMap map={carcassMap} palette={boxPalette} px={px} />

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

      <div
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
        }}
      >
        <PixelMap map={doorMap} palette={boxPalette} px={px} style={{ position: "absolute", left: 0, top: 0 }} />
      </div>

      {t > 0.5 && (
        <>
          <span className="mote" style={{ left: 22 * px, top: 26 * px }} />
          <span className="mote" style={{ left: 32 * px, top: 22 * px, animationDelay: "0.4s" }} />
          <span className="mote" style={{ left: 40 * px, top: 28 * px, animationDelay: "0.8s" }} />
        </>
      )}
    </div>
  );
}

function buildFileSprite() {
  const W = 22;
  const Ht = 16;
  const rows = Array.from({ length: Ht }, () => Array(W).fill(" "));
  const set = (x, y, c) => (rows[y][x] = c);
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, c); };
  const hline = (x, y, w, c) => rect(x, y, w, 1, c);

  rect(1, 2, W - 2, Ht - 3, "A");
  rect(2, 3, W - 4, Ht - 5, "P");
  for (let i = 0; i < 9; i++) {
    set(2 + i, 3 + i, "A");
    set(W - 3 - i, 3 + i, "A");
  }
  rect(W - 6, 4, 3, 3, "C");
  set(W - 5, 5, "G");
  hline(4, 11, 8, "L");
  hline(4, 12, 6, "L");
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

export function FileSprite({ px = 4, style = {} }) {
  const map = useMemo(() => buildFileSprite(), []);
  return (
    <div style={{ position: "relative", width: 22 * px, height: 16 * px, ...style }}>
      <PixelMap map={map} palette={filePalette} px={px} />
    </div>
  );
}
