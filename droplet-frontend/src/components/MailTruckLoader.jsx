import { useEffect, useState } from "react";
import { PixelMap } from "./Dresser";

const TRUCK_MAP = [
  "                                ",
  "                                ",
  "       ddddddddddddddd          ",
  "       dEEEEEEEEEEEEEd          ",
  "       dEWWWWWdEWWWWEd          ",
  "       dEWWWWWdEWWWWEd  ddddd   ",
  "       dEWWWWWdEWWWWEd  dCCCCd  ",
  "       dDDDDDDDDDDDDDdddDFFFFCd ",
  "       dDDDREDDDDDDDDdDDDFFFFCd ",
  "       dDDDREDDDDDDDDDDDDFFFFCd ",
  "       dDDDREDDDDDDDDDDDDFFFFCd ",
  "       dDDDDDDDDDDDDDDDDDFFFFCd ",
  "       dDDDDDDDDDDDDDDDDDDDDDCd ",
  "       AAaaaaaaaaaaaaaaaaaaaaAA ",
  "       A                     A ",
  "       A                     A ",
  "       A                     A ",
  "                                ",
];

const TRUCK_PALETTE = {
  d: "#0a1422",
  D: "#2477c9",
  E: "#4a99e2",
  W: "#a9d3f5",
  C: "#dadfe6",
  F: "#7fb1e0",
  R: "#c8423a",
  A: "#0a1422",
  a: "#1b2a3a",
};

const WHEEL_FRAMES = [
  [" AAAA ", "ATTTTA", "ATTKTA", "ATKTTA", "ATTTTA", " AAAA "],
  [" AAAA ", "ATKTTA", "ATTTKA", "AKTTTA", "ATTKTA", " AAAA "],
  [" AAAA ", "ATTKTA", "AKTTKA", "AKTTKA", "ATKTTA", " AAAA "],
  [" AAAA ", "ATTTKA", "ATKTTA", "ATTKTA", "AKTTTA", " AAAA "],
];

const WHEEL_PALETTE = {
  A: "#0a1422",
  T: "#1b2a3a",
  K: "#dadfe6",
};

function Wheel({ frame, px }) {
  const map = WHEEL_FRAMES[frame % WHEEL_FRAMES.length];
  return <PixelMap map={map} palette={WHEEL_PALETTE} px={px} />;
}

function Puff({ delay, px }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 4 * px,
        top: 5 * px,
        width: 4 * px,
        height: 4 * px,
        background: "#b0b8c4",
        borderRadius: "50%",
        opacity: 0,
        animation: `puff 1.4s linear ${delay}s infinite`,
      }}
    />
  );
}

// Width of the road the truck drives along (px units, not pixel-scale)
const ROAD_PX = 480;

// phase: "loading" | "fadeOut" | "filed" | "hidden"
export function MailTruckLoader({ isLoading = true, uploadingFiles = [], px = 5, speed = 3 }) {
  const [wheelFrame, setWheelFrame] = useState(0);
  const [bob, setBob] = useState(0);
  const [phase, setPhase] = useState("hidden");

  // Drive the phase state machine on isLoading changes
  useEffect(() => {
    if (isLoading) {
      setPhase("loading");
    } else if (phase === "loading") {
      setPhase("fadeOut");
      const t1 = setTimeout(() => setPhase("filed"), 600);
      const t2 = setTimeout(() => setPhase("hidden"), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wheel + bob animation
  useEffect(() => {
    if (phase !== "loading") return;
    let raf;
    let last = performance.now();
    let acc = 0;
    const step = (t) => {
      const dt = t - last;
      last = t;
      acc += dt;
      if (acc > 80) {
        acc = 0;
        setWheelFrame((f) => (f + 1) % WHEEL_FRAMES.length);
      }
      setBob(Math.round(Math.sin(t / 110) * 1.2));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === "hidden") return null;

  const truckW = TRUCK_MAP[0].length * px;
  const truckH = TRUCK_MAP.length * px;
  const count = uploadingFiles.length;

  const isVisible = phase === "loading" || phase === "fadeOut";
  const isFiled = phase === "filed";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        width: ROAD_PX,
        pointerEvents: "none",
        zIndex: 50,
        fontFamily: "'Press Start 2P', monospace",
        imageRendering: "pixelated",
      }}
    >
      {/* Upload panel — fades out, then FILED fades in */}
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.5s ease-out",
          display: isFiled ? "none" : "block",
        }}
      >
        {/* Road strip — truck loops within this */}
        <div
          style={{
            position: "relative",
            width: ROAD_PX,
            height: truckH,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: truckW,
              height: truckH,
              animation: `truckDrive ${speed}s linear infinite`,
            }}
          >
            <div
              style={{
                position: "relative",
                transform: `translateY(${bob}px)`,
                transition: "transform 0.06s linear",
              }}
            >
              <PixelMap map={TRUCK_MAP} palette={TRUCK_PALETTE} px={px} />

              <div style={{ position: "absolute", left: 10 * px, top: 14 * px }}>
                <Wheel frame={wheelFrame} px={px} />
              </div>
              <div style={{ position: "absolute", left: 22 * px, top: 14 * px }}>
                <Wheel frame={wheelFrame + 2} px={px} />
              </div>

              <Puff delay={0} px={px} />
              <Puff delay={0.5} px={px} />
              <Puff delay={1.0} px={px} />
            </div>
          </div>
        </div>

        {/* Dashed road line */}
        <div
          style={{
            width: "100%",
            borderTop: "3px dashed #a89868",
            marginBottom: 10,
            opacity: 0.7,
          }}
        />

        {/* Upload info panel */}
        <div
          style={{
            background: "#f4ecd6",
            border: "3px solid #1b2a3a",
            boxShadow: "4px 4px 0 0 #0a1422",
            padding: "14px 16px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div
              style={{
                background: "#2477c9",
                color: "#f4ecd6",
                fontSize: 9,
                letterSpacing: 0.5,
                padding: "6px 10px",
                border: "2px solid #1b2a3a",
                boxShadow: "2px 2px 0 0 #0a1422",
                whiteSpace: "nowrap",
              }}
            >
              UPLOADING
            </div>
            <div style={{ fontFamily: "'VT323', monospace", fontSize: 20, color: "#1b2a3a", letterSpacing: 0.5 }}>
              {count} file{count !== 1 ? "s" : ""} in transit
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: 14,
              background: "#d8c69a",
              border: "2px solid #1b2a3a",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "40%",
                background: "#2477c9",
                animation: "barSlide 1.6s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* FILED confirmation — fades in after upload panel fades out */}
      {isFiled && (
        <div
          style={{
            background: "#f4ecd6",
            border: "3px solid #1b2a3a",
            boxShadow: "4px 4px 0 0 #0a1422",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            animation: "filedFade 1.8s ease-in-out forwards",
          }}
        >
          <div
            style={{
              background: "#2a7a3a",
              color: "#f4ecd6",
              fontSize: 9,
              letterSpacing: 0.5,
              padding: "6px 10px",
              border: "2px solid #1b2a3a",
              boxShadow: "2px 2px 0 0 #0a1422",
              whiteSpace: "nowrap",
            }}
          >
            FILED ✓
          </div>
          <div style={{ fontFamily: "'VT323', monospace", fontSize: 20, color: "#1b2a3a", letterSpacing: 0.5 }}>
            delivered to the box
          </div>
        </div>
      )}

      <style>{`
        @keyframes truckDrive {
          0%   { transform: translateX(-${truckW}px); }
          100% { transform: translateX(${ROAD_PX}px); }
        }
        @keyframes puff {
          0%   { opacity: 0; transform: translate(0,0) scale(1); }
          20%  { opacity: 0.7; }
          100% { opacity: 0; transform: translate(-${10 * px}px, -${4 * px}px) scale(0.4); }
        }
        @keyframes barSlide {
          0%   { left: -40%; }
          100% { left: 100%; }
        }
        @keyframes filedFade {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
