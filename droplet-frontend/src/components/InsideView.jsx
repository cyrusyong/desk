import { useState, useMemo } from "react";
import { PixelMap } from "./Dresser";
import { MailTruckLoader } from "./MailTruckLoader";

function buildEnvelope(opened = false) {
  const W = 56;
  const Ht = 36;
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

  rect(2, 8, W - 4, Ht - 12, "P");
  hline(2, 7, W - 4, "A");
  hline(2, Ht - 4, W - 4, "A");
  vline(1, 8, Ht - 12, "A");
  vline(W - 2, 8, Ht - 12, "A");

  if (opened) {
    for (let i = 0; i < 12; i++) {
      const lx = W / 2 - i;
      const rx = W / 2 + i;
      const y = 1 + i;
      if (lx > 0 && rx < W) {
        set(Math.floor(lx), y, "A");
        set(Math.floor(rx), y, "A");
      }
    }
    for (let i = 0; i < 11; i++) {
      const lx = Math.ceil(W / 2 - i);
      const rx = Math.floor(W / 2 + i);
      const y = 2 + i;
      for (let x = lx + 1; x < rx; x++) set(x, y, "F");
    }
  } else {
    for (let i = 0; i < 12; i++) {
      set(2 + i, 8 + i, "A");
      set(W - 3 - i, 8 + i, "A");
    }
    rect(W / 2 - 2, 18, 4, 2, "R");
  }

  for (let i = 0; i < 12; i++) {
    set(2 + i, Ht - 5 - i, "F");
    set(W - 3 - i, Ht - 5 - i, "F");
  }

  rect(W - 12, 10, 6, 6, "C");
  rect(W - 11, 11, 4, 4, "H");
  set(W - 9, 12, "R");

  hline(6, 22, 14, "L");
  hline(6, 25, 10, "L");

  return rows.map((r) => r.join(""));
}

const envelopePalette = {
  A: "#1b2a3a",
  P: "#f4ecd6",
  F: "#d8c69a",
  L: "#a89868",
  C: "#2477c9",
  H: "#a9d3f5",
  R: "#c8423a",
};

function EnvelopeSprite({ opened = false, px = 3 }) {
  const map = useMemo(() => buildEnvelope(opened), [opened]);
  return (
    <div style={{ position: "relative", width: 56 * px, height: 36 * px }}>
      <PixelMap map={map} palette={envelopePalette} px={px} />
    </div>
  );
}

function formatBytes(n) {
  if (!n) return "—";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}

function Envelope({ file, index, onClick, px }) {
  const [hover, setHover] = useState(false);
  const wobble = hover
    ? "translateY(-6px) rotate(-2deg)"
    : "translateY(0) rotate(0)";
  return (
    <button
      onClick={() => onClick(file, index)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        position: "relative",
        width: 56 * px,
        height: 36 * px + 28,
        transition: "transform 0.18s cubic-bezier(.4,1.6,.4,1)",
        transform: wobble,
        filter: hover
          ? "drop-shadow(6px 8px 0 rgba(10,20,34,0.35))"
          : "drop-shadow(3px 4px 0 rgba(10,20,34,0.3))",
      }}
    >
      <EnvelopeSprite px={px} />
      <div
        style={{
          position: "absolute",
          top: 14 * px,
          left: 6 * px,
          right: 14 * px,
          fontFamily: "'VT323', monospace",
          fontSize: 14,
          color: "#1b2a3a",
          textAlign: "left",
          lineHeight: 1.05,
          pointerEvents: "none",
          textShadow: "1px 1px 0 #f4ecd6",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          letterSpacing: 0.2,
        }}
      >
        {file.name}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: "#a9d3f5",
          letterSpacing: 0.5,
        }}
      >
        {formatBytes(file.size)}
      </div>
    </button>
  );
}

export function InsideView({ files, visible, onBack, onOpenLetter, px = 3 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 30%, #1a3a6a 0%, #0d2548 55%, #050d1f 100%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(1.4)",
        transition: "opacity 0.5s, transform 0.6s cubic-bezier(.22,1,.36,1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 24px)",
          opacity: 0.7,
        }}
      />

      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          background: "#f4ecd6",
          color: "#1b2a3a",
          border: "3px solid #1b2a3a",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          padding: "10px 14px",
          letterSpacing: 1,
          cursor: "pointer",
          boxShadow: "4px 4px 0 0 #0a1422",
          zIndex: 5,
        }}
      >
        ← OUT
      </button>

      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          color: "#a9d3f5",
          letterSpacing: 1,
          textAlign: "right",
        }}
      >
        INSIDE THE BOX
        <span
          style={{
            display: "block",
            fontFamily: "'VT323', monospace",
            fontSize: 18,
            color: "#f4ecd6",
            marginTop: 6,
            letterSpacing: 0,
          }}
        >
          {files.length} envelope{files.length === 1 ? "" : "s"}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 40px 60px",
          overflowY: "auto",
        }}
      >
        {files.length === 0 ? (
          <div
            style={{
              color: "#a9d3f5",
              fontFamily: "'VT323', monospace",
              fontSize: 26,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 14,
                marginBottom: 16,
                letterSpacing: 1,
              }}
            >
              EMPTY
            </div>
            no mail yet — drop a file outside to fill the box
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${56 * px + 24}px, 1fr))`,
              gap: 28,
              maxWidth: 1100,
              width: "100%",
            }}
          >
            {files.map((f, i) => (
              <Envelope
                key={i}
                file={f}
                index={i}
                onClick={onOpenLetter}
                px={px}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const pixelButton = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 10,
  letterSpacing: 0.5,
  background: "#f4ecd6",
  color: "#1b2a3a",
  border: "3px solid #1b2a3a",
  padding: "10px 12px",
  cursor: "pointer",
  boxShadow: "3px 3px 0 0 #0a1422",
};

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 8,
        alignItems: "baseline",
      }}
    >
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 9,
          color: "#7a4a32",
          minWidth: 90,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 20,
          color: "#1b2a3a",
          flex: 1,
          wordBreak: "break-all",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function guessKind(name) {
  const ext = (name || "").split(".").pop()?.toLowerCase() || "";
  const map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    zip: "application/zip",
    mp4: "video/mp4",
    json: "application/json",
  };
  return map[ext] || "application/octet-stream";
}

export function LetterOverlay({ file, onClose }) {
  if (!file) return null;
  const url =
    file.url ||
    `https://s3.us-east-2.amazonaws.com/droplet.app/${file.fieldId}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 13, 31, 0.7)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadein 0.25s ease-out",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(560px, 92vw)",
          animation: "letterRise 0.5s cubic-bezier(.22,1.2,.36,1) both",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translateX(-50%)",
            opacity: 0.9,
          }}
        >
          <EnvelopeSprite opened={true} px={4} />
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 60,
            background: "#f4ecd6",
            border: "4px solid #1b2a3a",
            boxShadow: "8px 8px 0 0 #0a1422",
            padding: "28px 28px 24px",
            color: "#1b2a3a",
            fontFamily: "'VT323', monospace",
            animation: "letterSlide 0.7s cubic-bezier(.22,1.2,.36,1) both",
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0 27px, rgba(168,152,104,0.35) 27px 28px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "3px dashed #a89868",
              paddingBottom: 14,
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 12,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                DROPLET
              </div>
              <div style={{ fontSize: 18, color: "#7a4a32" }}>
                from: us-east-2 &middot; bucket droplet.app
              </div>
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                background: "#c8423a",
                border: "3px solid #1b2a3a",
                color: "#f4ecd6",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1.3,
                textAlign: "center",
                transform: "rotate(6deg)",
                boxShadow: "2px 2px 0 0 #0a1422",
              }}
            >
              FIRST
              <br />
              CLASS
            </div>
          </div>

          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 14,
              letterSpacing: 0.5,
              marginBottom: 18,
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {file.name}
          </div>

          <Row label="size" value={formatBytes(file.size)} />
          <Row label="kind" value={file.type || guessKind(file.name)} />
          {!file.uploading && <Row label="filed" value={file.filedAt || "just now"} />}
          <div style={{ height: 18 }} />

          {file.uploading ? (
            <div
              style={{
                border: "3px solid #1b2a3a",
                background: "#fff8e1",
                padding: "12px 14px",
                boxShadow: "3px 3px 0 0 #c8423a",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9,
                  letterSpacing: 1,
                  color: "#7a4a32",
                  marginBottom: 10,
                }}
              >
                ▸ IN TRANSIT
              </div>
              <MailTruckLoader isLoading={true} px={3} speed={2} truckOnly />
            </div>
          ) : (
            <div
              style={{
                border: "3px solid #1b2a3a",
                background: "#fff8e1",
                padding: "12px 14px",
                fontSize: 18,
                wordBreak: "break-all",
                lineHeight: 1.3,
                boxShadow: "3px 3px 0 0 #c8423a",
              }}
            >
              <div
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 9,
                  letterSpacing: 1,
                  color: "#7a4a32",
                  marginBottom: 8,
                }}
              >
                ▸ FETCH FROM AWS
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#1b2a3a",
                  textDecoration: "underline",
                  fontFamily: "'VT323', monospace",
                  fontSize: 18,
                }}
              >
                {url}
              </a>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            {!file.uploading && (
              <button
                onClick={() => navigator.clipboard?.writeText(url)}
                style={pixelButton}
              >
                COPY LINK
              </button>
            )}
            <button
              onClick={onClose}
              style={{ ...pixelButton, background: "#1b2a3a", color: "#f4ecd6" }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes letterRise {
          from { transform: translateY(60px); opacity: 0 }
          to   { transform: translateY(0); opacity: 1 }
        }
        @keyframes letterSlide {
          0%   { transform: translateY(140px); opacity: 0 }
          40%  { opacity: 1 }
          100% { transform: translateY(0); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
