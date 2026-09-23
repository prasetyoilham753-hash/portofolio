import React, { useState, useRef, useEffect, useCallback } from "react";

interface ProfileCard3DProps {
  photos: string[];
  name: string;
}

interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

function qIdentity(): Quaternion {
  return { x: 0, y: 0, z: 0, w: 1 };
}

function qFromAxisAngleDeg(ax: number, ay: number, az: number, deg: number): Quaternion {
  const rad = (deg * Math.PI) / 180;
  const len = Math.hypot(ax, ay, az) || 1;
  const s = Math.sin(rad / 2) / len;
  return { x: (ax / len) * s, y: (ay / len) * s, z: (az / len) * s, w: Math.cos(rad / 2) };
}

function qMultiply(a: Quaternion, b: Quaternion): Quaternion {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

function qNormalize(q: Quaternion): Quaternion {
  const len = Math.hypot(q.x, q.y, q.z, q.w) || 1;
  return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
}

function qToMatrix3d(q: Quaternion): string {
  const { x, y, z, w } = q;
  const m00 = 1 - 2 * (y * y + z * z);
  const m01 = 2 * (x * y - w * z);
  const m02 = 2 * (x * z + w * y);

  const m10 = 2 * (x * y + w * z);
  const m11 = 1 - 2 * (x * x + z * z);
  const m12 = 2 * (y * z - w * x);

  const m20 = 2 * (x * z - w * y);
  const m21 = 2 * (y * z + w * x);
  const m22 = 1 - 2 * (x * x + y * y);

  return `matrix3d(${m00.toFixed(5)},${m10.toFixed(5)},${m20.toFixed(5)},0, ${m01.toFixed(5)},${m11.toFixed(5)},${m21.toFixed(5)},0, ${m02.toFixed(5)},${m12.toFixed(5)},${m22.toFixed(5)},0, 0,0,0,1)`;
}

// Corner segments array pre-calculated precisely for 30px radius corner bridging
const CORNER_SEGMENTS = [
  // Top-right (tr 0..5)
  ...[-82.5, -67.5, -52.5, -37.5, -22.5, -7.5].map((angle, i) => ({
    id: `tr-${i}`,
    transform: `translate3d(120.0px, -150.0px, 0) rotateZ(${angle}deg) rotateY(90deg) translateZ(30px)`,
  })),
  // Bottom-right (br 0..5)
  ...[7.5, 22.5, 37.5, 52.5, 67.5, 82.5].map((angle, i) => ({
    id: `br-${i}`,
    transform: `translate3d(120.0px, 150.0px, 0) rotateZ(${angle}deg) rotateY(90deg) translateZ(30px)`,
  })),
  // Bottom-left (bl 0..5)
  ...[97.5, 112.5, 127.5, 142.5, 157.5, 172.5].map((angle, i) => ({
    id: `bl-${i}`,
    transform: `translate3d(-120.0px, 150.0px, 0) rotateZ(${angle}deg) rotateY(90deg) translateZ(30px)`,
  })),
  // Top-left (tl 0..5)
  ...[187.5, 202.5, 217.5, 232.5, 247.5, 262.5].map((angle, i) => ({
    id: `tl-${i}`,
    transform: `translate3d(-120.0px, -150.0px, 0) rotateZ(${angle}deg) rotateY(90deg) translateZ(30px)`,
  })),
];

export function ProfileCard3D({ photos, name }: ProfileCard3DProps) {
  const validPhotos = photos.filter(Boolean);
  const photoList = validPhotos.length > 0 
    ? validPhotos 
    : [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
      ];

  const totalPhotos = photoList.length;

  // Face indices: front face index and back face index
  const [frontIndex, setFrontIndex] = useState(0);
  const [backIndex, setBackIndex] = useState(totalPhotos > 1 ? 1 : 0);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  // Tilt settings from reference
  const BASE_TILT_X = 3;   // Subtle resting tilt angle
  const BASE_TILT_Y = -6;
  const [tilt, setTilt] = useState({ x: BASE_TILT_X, y: BASE_TILT_Y });

  // Specular reflection position (percentage)
  const [specular, setSpecular] = useState({ x: 25, y: 15 });

  // 3D Quaternion Orientation
  const [currentQuat, setCurrentQuat] = useState<Quaternion>(qIdentity());
  const baseQuatRef = useRef<Quaternion>(qIdentity());
  const currentQuatRef = useRef<Quaternion>(qIdentity());
  currentQuatRef.current = currentQuat;

  // Dragging & animating state
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for tracking drag physics
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragInfoRef = useRef({
    startX: 0,
    startY: 0,
    downX: 0,
    downY: 0,
    lastAngle: 0,
    lastAxis: { x: 0, y: 1 },
  });

  const lastTapTimeRef = useRef<number>(0);

  // Physics constants from reference
  const FLIP_THRESHOLD_DEG = 80;
  const DRAG_SENSITIVITY = 0.6;

  // Apply programmatic flip (180deg flip around Y axis)
  const flipProgrammatic = useCallback((direction: number = 1) => {
    if (isDragging) return;
    setIsAnimating(true);
    const inc = qFromAxisAngleDeg(0, direction, 0, 180);
    const nextQ = qNormalize(qMultiply(inc, currentQuatRef.current));
    setCurrentQuat(nextQ);

    // Switch active side and cycle upcoming photo
    setTimeout(() => {
      setActiveSide(prev => {
        const nextSide = prev === "front" ? "back" : "front";
        if (totalPhotos > 2) {
          if (nextSide === "back") {
            setFrontIndex(f => (f + 2) % totalPhotos);
          } else {
            setBackIndex(b => (b + 2) % totalPhotos);
          }
        }
        return nextSide;
      });
      setIsAnimating(false);
    }, 600);
  }, [isDragging, totalPhotos]);

  // Reset to original front orientation
  const handleResetOrientation = useCallback(() => {
    setIsAnimating(true);
    setCurrentQuat(qIdentity());
    baseQuatRef.current = qIdentity();
    setActiveSide("front");
    setTilt({ x: BASE_TILT_X, y: BASE_TILT_Y });
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, []);

  // Pointer Down handler
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Check for double-tap / double-click to reset
    const now = Date.now();
    if (now - lastTapTimeRef.current < 280) {
      handleResetOrientation();
      lastTapTimeRef.current = 0;
      return;
    }
    lastTapTimeRef.current = now;

    setIsDragging(true);
    setIsAnimating(false);
    baseQuatRef.current = currentQuatRef.current;
    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      downX: e.clientX,
      downY: e.clientY,
      lastAngle: 0,
      lastAxis: { x: 0, y: 1 },
    };

    if (cardRef.current) {
      try {
        cardRef.current.setPointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback
      }
    }
  };

  // Pointer Move handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragInfoRef.current.startX;
    const dy = e.clientY - dragInfoRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.5) {
      setCurrentQuat(baseQuatRef.current);
      return;
    }

    const axisX = -dy / dist;
    const axisY = dx / dist;
    const angle = Math.min(dist * DRAG_SENSITIVITY, 180);

    const inc = qFromAxisAngleDeg(axisX, axisY, 0, angle);
    const live = qMultiply(inc, baseQuatRef.current);
    setCurrentQuat(live);

    dragInfoRef.current.lastAngle = angle;
    dragInfoRef.current.lastAxis = { x: axisX, y: axisY };

    // Dynamic light tracking during drag
    setSpecular({
      x: Math.max(0, Math.min(100, 50 + (dx / 300) * 50)),
      y: Math.max(0, Math.min(100, 50 + (dy / 360) * 50)),
    });
  };

  // Pointer Up handler
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    const movedTiny =
      Math.abs(e.clientX - dragInfoRef.current.downX) < 6 &&
      Math.abs(e.clientY - dragInfoRef.current.downY) < 6;

    if (movedTiny) {
      flipProgrammatic(1);
      return;
    }

    const angle = dragInfoRef.current.lastAngle || 0;
    const axis = dragInfoRef.current.lastAxis || { x: 0, y: 1 };

    setIsAnimating(true);
    if (angle >= FLIP_THRESHOLD_DEG) {
      const inc = qFromAxisAngleDeg(axis.x, axis.y, 0, 180);
      const nextQuat = qNormalize(qMultiply(inc, baseQuatRef.current));
      setCurrentQuat(nextQuat);

      setTimeout(() => {
        setActiveSide(prev => {
          const nextSide = prev === "front" ? "back" : "front";
          if (totalPhotos > 2) {
            if (nextSide === "back") {
              setFrontIndex(f => (f + 2) % totalPhotos);
            } else {
              setBackIndex(b => (b + 2) % totalPhotos);
            }
          }
          return nextSide;
        });
        setIsAnimating(false);
      }, 600);
    } else {
      setCurrentQuat(baseQuatRef.current);
      setTimeout(() => {
        setIsAnimating(false);
      }, 600);
    }
  };

  // Stage Mouse Move (Ambient 3D parallax tilt)
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = BASE_TILT_Y + (px - 0.5) * 14;
    const rotX = BASE_TILT_X + (0.5 - py) * 10;
    setTilt({ x: rotX, y: rotY });
    setSpecular({ x: px * 100, y: py * 100 });
  };

  const handleStageMouseLeave = () => {
    if (isDragging) return;
    setTilt({ x: BASE_TILT_X, y: BASE_TILT_Y });
    setSpecular({ x: 25, y: 15 });
  };

  // Check if card is significantly rotated away from base
  const isRotatedAway =
    Math.abs(currentQuat.x) > 0.12 ||
    Math.abs(currentQuat.y) > 0.12 ||
    Math.abs(currentQuat.z) > 0.12;

  const currentActiveIndex = activeSide === "front" ? frontIndex : backIndex;

  return (
    <div className="flex flex-col items-center select-none relative">
      {/* 3D Stage Container with Responsive Mobile Scale */}
      <div className="relative w-[175px] h-[210px] xs:w-[200px] xs:h-[240px] sm:w-[270px] sm:h-[324px] md:w-[360px] md:h-[432px] lg:w-[410px] lg:h-[492px] xl:w-[440px] xl:h-[528px] shrink-0">
        <div className="origin-top-left scale-[0.583] xs:scale-[0.667] sm:scale-[0.9] md:scale-[1.2] lg:scale-[1.367] xl:scale-[1.467] w-[300px] h-[360px] transition-transform duration-200">
          <div
            ref={stageRef}
            id="profile-stage-3d"
            className="relative w-[300px] h-[360px]"
            style={{
              perspective: "1200px",
            }}
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
          >
            {/* Ground Shadow */}
            <div
              className="absolute left-[12%] right-[12%] -bottom-[24px] h-[20px] rounded-full pointer-events-none z-[-1]"
              style={{
                background: "radial-gradient(ellipse at center, rgba(70,120,255,0.35), rgba(0,0,0,0) 72%)",
                filter: "blur(4px)",
                transform: `scale(${1 + Math.abs(currentQuat.y) * 0.15})`,
                transition: "transform 0.3s ease-out",
              }}
            />

            {/* Tilt Layer for Subtle Ambient Parallax */}
            <div
              id="profile-tilt-layer"
              className="w-full h-full relative"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: isDragging ? "none" : "transform 0.4s cubic-bezier(.22,.9,.32,1.16)",
              }}
            >
              {/* Main 3D Card (Rotates via Quaternion matrix3d) */}
              <div
                ref={cardRef}
                id="profile-slab-card"
                className={`relative w-full h-full ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  touchAction: "none",
                  transform: qToMatrix3d(currentQuat),
                  transition: isAnimating
                    ? "transform 0.6s cubic-bezier(.23,.86,.28,1.12)"
                    : "none",
                  willChange: "transform",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* ========================================================= */}
                {/* FRONT FACE                                                */}
                {/* ========================================================= */}
                <div
                  className="absolute top-0 left-0 w-[300px] h-[360px] rounded-[30px] p-[13px] overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "translateZ(4px)",
                    background: "linear-gradient(150deg, #3a58a8 0%, #2a4590 18%, #16234c 55%, #0a1128 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(100,170,255, 0.9), 0 0 18px 3px rgba(100,170,255, 0.55), 0 0 42px 10px rgba(100,170,255, 0.25), 0 26px 50px -20px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -3px 5px rgba(0,0,0,0.65), inset 2px 0 0 rgba(255,255,255,0.18), inset -2px 0 4px rgba(0,0,0,0.45)",
                  }}
                >
                  {/* Soft top-down bevel shine */}
                  <div
                    className="absolute inset-0 rounded-[30px] pointer-events-none z-[3]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 45%)",
                    }}
                  />

                  {/* Photo Container */}
                  <div
                    className="w-full h-full relative rounded-[20px] overflow-hidden"
                    style={{
                      boxShadow:
                        "0 5px 16px -6px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.35), 0 0 0 2px rgba(150,190,255,0.28), 0 1px 0 rgba(255,255,255,0.12) inset",
                    }}
                  >
                    <img
                      src={photoList[frontIndex % totalPhotos]}
                      alt={`${name} - Front view`}
                      className="w-full h-full object-cover block pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      loading="eager"
                    />

                    {/* Gloss & dynamic specular reflection overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(125deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 72%, rgba(150,190,255,0.14) 100%), radial-gradient(120% 60% at ${specular.x}% ${specular.y}%, rgba(255,255,255,0.28), rgba(255,255,255,0) 60%)`,
                      }}
                    />
                  </div>
                </div>

                {/* ========================================================= */}
                {/* BACK FACE                                                 */}
                {/* ========================================================= */}
                <div
                  className="absolute top-0 left-0 w-[300px] h-[360px] rounded-[30px] p-[13px] overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg) translateZ(4px)",
                    background: "linear-gradient(150deg, #3a58a8 0%, #2a4590 18%, #16234c 55%, #0a1128 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(100,170,255, 0.9), 0 0 18px 3px rgba(100,170,255, 0.55), 0 0 42px 10px rgba(100,170,255, 0.25), 0 26px 50px -20px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -3px 5px rgba(0,0,0,0.65), inset 2px 0 0 rgba(255,255,255,0.18), inset -2px 0 4px rgba(0,0,0,0.45)",
                  }}
                >
                  {/* Soft top-down bevel shine */}
                  <div
                    className="absolute inset-0 rounded-[30px] pointer-events-none z-[3]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 45%)",
                    }}
                  />

                  {/* Photo Container */}
                  <div
                    className="w-full h-full relative rounded-[20px] overflow-hidden"
                    style={{
                      boxShadow:
                        "0 5px 16px -6px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,0,0,0.35), 0 0 0 2px rgba(150,190,255,0.28), 0 1px 0 rgba(255,255,255,0.12) inset",
                    }}
                  >
                    <img
                      src={photoList[backIndex % totalPhotos]}
                      alt={`${name} - Back view`}
                      className="w-full h-full object-cover block pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                      draggable={false}
                      loading="lazy"
                    />

                    {/* Gloss & dynamic specular reflection overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(125deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 72%, rgba(150,190,255,0.14) 100%), radial-gradient(120% 60% at ${100 - specular.x}% ${specular.y}%, rgba(255,255,255,0.28), rgba(255,255,255,0) 60%)`,
                      }}
                    />
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 3D STRAIGHT EDGES (8px Depth)                             */}
                {/* ========================================================= */}
                {/* Right edge */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: "8px",
                    height: "300px",
                    top: "30px",
                    left: "146px",
                    transform: "rotateY(90deg) translateZ(150px)",
                    background: "linear-gradient(90deg, #142046, #3a58a8 50%, #142046)",
                    boxShadow: "0 0 8px 1px rgba(100,170,255, 0.35)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Left edge */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: "8px",
                    height: "300px",
                    top: "30px",
                    left: "146px",
                    transform: "rotateY(-90deg) translateZ(150px)",
                    background: "linear-gradient(90deg, #142046, #3a58a8 50%, #142046)",
                    boxShadow: "0 0 8px 1px rgba(100,170,255, 0.35)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Top edge */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: "240px",
                    height: "8px",
                    top: "176px",
                    left: "30px",
                    transform: "rotateX(90deg) translateZ(180px)",
                    background: "linear-gradient(180deg, #3a58a8, #142046)",
                    boxShadow: "0 0 8px 1px rgba(100,170,255, 0.35)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Bottom edge */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: "240px",
                    height: "8px",
                    top: "176px",
                    left: "30px",
                    transform: "rotateX(-90deg) translateZ(180px)",
                    background: "linear-gradient(180deg, #142046, #3a58a8)",
                    boxShadow: "0 0 8px 1px rgba(100,170,255, 0.35)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* ========================================================= */}
                {/* 24 CORNER SEGMENTS (Smooth rounded edge geometry)         */}
                {/* ========================================================= */}
                {CORNER_SEGMENTS.map(seg => (
                  <div
                    key={seg.id}
                    className="absolute pointer-events-none"
                    style={{
                      width: "8px",
                      height: "7.832px",
                      top: "176.084px", // calc((360px - 7.832px) / 2)
                      left: "146px",    // calc((300px - 8px) / 2)
                      transform: seg.transform,
                      background: "linear-gradient(90deg, #1a2a58, #3a58a8 50%, #1a2a58)",
                      boxShadow: "0 0 8px 1px rgba(100,170,255, 0.3)",
                      backfaceVisibility: "hidden",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Reset Floating Pill when rotated off-axis */}
            {isRotatedAway && (
              <button
                type="button"
                onClick={handleResetOrientation}
                className="ios-glass-btn absolute -top-10 left-1/2 -translate-x-1/2 z-30 text-[11px] h-7 px-3.5 flex items-center cursor-pointer whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                aria-label="Reset card orientation"
                title="Double-tap card or click to reset view"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="text-xs">↺</span>
                  <span>Reset</span>
                </span>
              </button>
            )}

            {/* Photo Pagination Indicators */}
            {totalPhotos > 1 && (
              <div
                id="profile-photo-pagination"
                className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none"
              >
                <div className="flex gap-1.5 bg-[rgba(5,14,32,0.65)] px-2.5 py-1 rounded-full backdrop-blur-md border border-[rgba(130,180,255,0.2)] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                  {photoList.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentActiveIndex
                          ? "bg-gradient-to-r from-[#7DB3FF] to-[#5B8CFF] w-4 shadow-[0_0_8px_rgba(110,170,255,0.8)]"
                          : "bg-[#71839A]/60 w-1.5"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
