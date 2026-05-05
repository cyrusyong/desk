import { useState, useEffect, useRef } from "react";
import { Dresser, FileSprite } from "./components/Dresser";
import { InsideView, LetterOverlay } from "./components/InsideView";
import { MailTruckLoader } from "./components/MailTruckLoader";
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweakColor,
} from "./components/TweaksPanel";

const API_BASE =
  "https://uln1pianga.execute-api.us-east-2.amazonaws.com/DropletAPI";

const TWEAK_DEFAULTS = {
  fileColor: "#c8423a",
  shakeOnSlam: true,
  ambientMotes: true,
  pixelScale: 5,
};

const TRACKING_ADJECTIVES = [
  "blue",
  "red",
  "gold",
  "dark",
  "wild",
  "fast",
  "keen",
  "bold",
  "warm",
  "cool",
];
const TRACKING_ANIMALS = [
  "fox",
  "owl",
  "bear",
  "wolf",
  "hawk",
  "deer",
  "crow",
  "lynx",
  "frog",
  "crab",
];

function getOrCreateTrackingNumber() {
  const stored = localStorage.getItem("droplet_tracking_id");
  if (stored) return stored;
  const adj =
    TRACKING_ADJECTIVES[Math.floor(Math.random() * TRACKING_ADJECTIVES.length)];
  const animal =
    TRACKING_ANIMALS[Math.floor(Math.random() * TRACKING_ANIMALS.length)];
  const digit = Math.floor(Math.random() * 9) + 1;
  const id = `${adj}-${animal}-${digit}`;
  localStorage.setItem("droplet_tracking_id", id);
  return id;
}

function rid() {
  return Array.from(
    { length: 8 },
    () =>
      "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
  ).join("");
}

async function uploadFile(file, trackingNumber) {
  const { fieldId, uploadUrl } = await fetch(`${API_BASE}/create-upload-url`, {
    method: "POST",
  }).then((r) => r.json());

  await fetch(uploadUrl, { method: "PUT", body: file });

  const { simpleID } = await fetch(`${API_BASE}/store-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fieldID: fieldId,
      fileName: file.name,
      fileExtension: file.name.split(".").pop(),
      fileSize: file.size,
      trackingNumber,
    }),
  }).then((r) => r.json());

  return {
    fieldId,
    simpleID,
    url: `https://s3.us-east-2.amazonaws.com/droplet.app/${fieldId}`,
  };
}

export default function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [view, setView] = useState("box");
  const [openedFile, setOpenedFile] = useState(null);
  const [doorHover, setDoorHover] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0, visible: false });

  const [drawerState, setDrawerState] = useState("closed");
  const [shaking, setShaking] = useState(false);

  const [files, setFiles] = useState([]);
  const [flyer, setFlyer] = useState(null);
  const stageRef = useRef(null);

  const [trackingNumber, setTrackingNumber] = useState(() =>
    getOrCreateTrackingNumber(),
  );

  function fetchByTracking(id) {
    fetch(`${API_BASE}/list-data?trackingNumber=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then(({ items }) => {
        const loaded = (items || []).map((item) => ({
          name: item.fileName,
          size: item.fileSize,
          type: item.fileExtension
            ? `application/${item.fileExtension}`
            : "application/octet-stream",
          fieldId: item.fieldID,
          simpleID: item.simpleID,
          url: `https://s3.us-east-2.amazonaws.com/droplet.app/${item.fieldID}`,
          filedAt: item.TTL
            ? new Date((item.TTL - 86400) * 1000).toLocaleString()
            : "—",
        }));
        setFiles(loaded);
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchByTracking(trackingNumber);
  }, []);

  const dropOpenAmount =
    drawerState === "open" || drawerState === "catching"
      ? 1
      : drawerState === "opening"
        ? 0.6
        : 0;

  const openAmount = view === "box" ? dropOpenAmount : 0;

  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault();
      if (view !== "box") return;
      if (
        !e.dataTransfer ||
        ![...(e.dataTransfer.types || [])].includes("Files")
      )
        return;
      setDragging(true);
      setDrawerState((s) => (s === "closed" ? "opening" : s));
    };
    const onDragOver = (e) => {
      e.preventDefault();
      if (!e.dataTransfer) return;
      e.dataTransfer.dropEffect = "copy";
      setPointer({ x: e.clientX, y: e.clientY, visible: true });
    };
    const onDragLeave = (e) => {
      if (
        e.relatedTarget === null ||
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setDragging(false);
        setPointer((p) => ({ ...p, visible: false }));
        if (drawerState !== "catching") setDrawerState("closing");
      }
    };
    const onDrop = (e) => {
      e.preventDefault();
      if (view !== "box") return;
      const dropX = e.clientX;
      const dropY = e.clientY;
      const fl = e.dataTransfer ? [...(e.dataTransfer.files || [])] : [];
      setDragging(false);
      setPointer({ x: dropX, y: dropY, visible: false });
      animateDrop(dropX, dropY, fl);
    };
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [drawerState, view]);

  useEffect(() => {
    if (drawerState === "opening") {
      const t = setTimeout(() => setDrawerState("open"), 280);
      return () => clearTimeout(t);
    }
  }, [drawerState]);

  function animateDrop(x, y, fl) {
    const drawer = stageRef.current?.getBoundingClientRect();
    if (!drawer) return;
    const targetX = drawer.left + drawer.width * 0.5 - 44;
    const targetY = drawer.top + drawer.height * 0.18;
    setFlyer({
      startX: x - 44,
      startY: y - 32,
      targetX,
      targetY,
      id: Date.now(),
    });
    setDrawerState("catching");

    setTimeout(() => {
      setFlyer(null);
      setDrawerState("closing");
      if (tweaks.shakeOnSlam) {
        setShaking(true);
        setTimeout(() => setShaking(false), 320);
      }
      setTimeout(() => setDrawerState("closed"), 350);

      if (fl.length > 0) {
        // Real file drop: add optimistically, then update with real IDs from API
        const optimistic = fl.map((f) => ({
          _id: rid(),
          name: f.name,
          size: f.size,
          type: f.type,
          fieldId: rid(),
          filedAt: "just now",
          url: "",
          uploading: true,
        }));
        setFiles((prev) => [...optimistic, ...prev]);

        fl.forEach((file) => {
          uploadFile(file, trackingNumber)
            .then(({ fieldId, simpleID, url }) => {
              setFiles((prev) =>
                prev.map((entry) =>
                  entry.name === file.name && entry.uploading
                    ? {
                        ...entry,
                        fieldId,
                        simpleID,
                        url,
                        uploading: false,
                        filedAt: new Date().toLocaleString(undefined, {
                          timeZone:
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                          dateStyle: "medium",
                          timeStyle: "short",
                        }),
                      }
                    : entry,
                ),
              );
            })
            .catch(() => {
              // Upload failed — keep the entry but clear uploading flag
              setFiles((prev) =>
                prev.map((entry) =>
                  entry.name === file.name && entry.uploading
                    ? { ...entry, uploading: false }
                    : entry,
                ),
              );
            });
        });
      }
    }, 620);
  }

  const [flyerPos, setFlyerPos] = useState(null);
  useEffect(() => {
    if (!flyer) return setFlyerPos(null);
    setFlyerPos({ x: flyer.startX, y: flyer.startY, phase: "start" });
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setFlyerPos({ x: flyer.targetX, y: flyer.targetY, phase: "end" }),
      ),
    );
  }, [flyer]);

  const px = tweaks.pixelScale;

  return (
    <>
      <div
        className="hint"
        style={{
          opacity: view === "box" ? 1 : 0,
          pointerEvents: view === "box" ? "auto" : "none",
          transition: "opacity 0.3s",
        }}
      >
        LETTERDROP
        <span className="sub">drop a file &middot; or open the door</span>
      </div>
      <div
        className="ledger"
        style={{
          opacity: view === "box" ? 1 : 0,
          pointerEvents: view === "box" ? "auto" : "none",
          transition: "opacity 0.3s",
        }}
      >
        COLLECTED
        <span className="num">{String(files.length).padStart(2, "0")}</span>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: view === "box" ? 1 : 0,
          transform: view === "box" ? "scale(1)" : "scale(2.6)",
          filter: view === "box" ? "blur(0)" : "blur(8px)",
          transition:
            "opacity 0.55s ease-out, transform 0.7s cubic-bezier(.55,0,.6,1), filter 0.55s",
          pointerEvents: view === "box" ? "auto" : "none",
        }}
      >
        <div
          ref={stageRef}
          style={{ position: "relative", width: 60 * px, height: 96 * px }}
        >
          <div
            data-door
            onMouseEnter={() => setDoorHover(true)}
            onMouseLeave={() => setDoorHover(false)}
            onClick={(e) => {
              e.stopPropagation();
              setView("inside");
              setDoorHover(false);
            }}
            style={{
              position: "absolute",
              left: 12 * px,
              top: 17 * px,
              width: 36 * px,
              height: 21 * px,
              cursor: "pointer",
              zIndex: 5,
            }}
            title="open the box"
          />
          <Dresser
            openAmount={openAmount}
            fileCount={files.length}
            shaking={shaking}
            px={px}
            hoverOpen={doorHover && drawerState === "closed"}
          />
        </div>
      </div>

      {dragging && pointer.visible && view === "box" && (
        <div
          className="file-ghost"
          style={{
            left: pointer.x - 44,
            top: pointer.y - 32,
            transform: "rotate(-8deg)",
            filter: "drop-shadow(4px 6px 0 rgba(10,20,34,0.4))",
          }}
        >
          <FileSprite px={4} />
        </div>
      )}

      {flyer && flyerPos && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            transform: `translate(${flyerPos.x}px, ${flyerPos.y}px) rotate(${flyerPos.phase === "end" ? 22 : -8}deg) scale(${flyerPos.phase === "end" ? 0.45 : 1})`,
            transition: "transform 0.6s cubic-bezier(.4,0.05,.55,1.2)",
            pointerEvents: "none",
            zIndex: 35,
            filter: "drop-shadow(4px 6px 0 rgba(10,20,34,0.4))",
            opacity: flyerPos.phase === "end" ? 0.2 : 1,
          }}
        >
          <FileSprite px={4} />
        </div>
      )}

      <InsideView
        files={files}
        visible={view === "inside" || view === "letter"}
        onBack={() => {
          setView("box");
          setOpenedFile(null);
        }}
        onOpenLetter={(f) => {
          setOpenedFile(f._id ?? f.fieldId);
          setView("letter");
        }}
        px={3}
        trackingNumber={trackingNumber}
        onTrackingNumberChange={(id) => {
          setTrackingNumber(id);
          localStorage.setItem("droplet_tracking_id", id);
        }}
        onLookup={(id) => fetchByTracking(id)}
      />

      {view === "letter" && (
        <LetterOverlay
          file={files.find((f) => (f._id ?? f.fieldId) === openedFile) ?? null}
          onClose={() => {
            setOpenedFile(null);
            setView("inside");
          }}
          onShred={async (simpleID) => {
            await fetch(`${API_BASE}/delete-data`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ simpleID }),
            });
            setFiles((prev) => prev.filter((f) => f.simpleID !== simpleID));
            setOpenedFile(null);
            setView("inside");
          }}
        />
      )}

      <MailTruckLoader
        isLoading={files.some((f) => f.uploading)}
        uploadingFiles={files.filter((f) => f.uploading)}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Mailbox">
          <TweakToggle
            label="Shake on slam"
            value={tweaks.shakeOnSlam}
            onChange={(v) => setTweak("shakeOnSlam", v)}
          />
          <TweakToggle
            label="Ambient motes"
            value={tweaks.ambientMotes}
            onChange={(v) => setTweak("ambientMotes", v)}
          />
          <TweakSlider
            label="Pixel scale"
            min={4}
            max={10}
            step={1}
            value={tweaks.pixelScale}
            onChange={(v) => setTweak("pixelScale", v)}
          />
        </TweakSection>
        <TweakSection label="Mail">
          <TweakColor
            label="Accent color"
            value={tweaks.fileColor}
            onChange={(v) => {
              setTweak("fileColor", v);
              document.documentElement.style.setProperty("--accent", v);
            }}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
