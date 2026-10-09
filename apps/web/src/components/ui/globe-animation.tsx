"use client";

import { useEffect, useRef, useState } from "react";

interface GlobeProps {
  className?: string;
  size?: number;
  highlightLat?: number;
  highlightLon?: number;
  highlightLabel?: string;
}

export function InteractiveGlobe({
  className = "",
  size = 500,
  highlightLat = 27.7,
  highlightLon = 85.3,
  highlightLabel = "Nepal (DHM 517mm Cloudburst)",
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Canvas dimensions
    const width = size;
    const height = size;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const radius = (width / 2) * 0.72;
    const cx = (width * dpr) / 2;
    const cy = (height * dpr) / 2;

    // Rotation state
    let rotX = 0.28; // Tilt slightly downward
    let rotY = -1.45; // Start showing South Asia / Nepal
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let autoRotateSpeed = 0.0035;

    // Generate globe points (Fibonacci sphere + land approximations + meridians)
    const points: Array<{ x: number; y: number; z: number; lat: number; lon: number; isLand: boolean }> = [];
    const numPoints = 1200;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numPoints; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
      
      const x0 = Math.sin(phi) * Math.cos(theta);
      const y0 = Math.cos(phi);
      const z0 = Math.sin(phi) * Math.sin(theta);

      const lat = ((Math.PI / 2 - phi) * 180) / Math.PI;
      const lon = ((theta % (2 * Math.PI)) * 180) / Math.PI - 180;

      // Approximate continental density
      const isLand = (
        (lat > -10 && lat < 70 && lon > -20 && lon < 140) || // Eurasia & Africa
        (lat > 5 && lat < 38 && lon > 65 && lon < 95) ||     // Indian Subcontinent & Himalayas
        (lat > -55 && lat < 15 && lon > -80 && lon < -35) || // South America
        (lat > 15 && lat < 70 && lon > -165 && lon < -50) || // North America
        (lat > -40 && lat < -10 && lon > 110 && lon < 155)   // Australia
      );

      points.push({ x: x0, y: y0, z: z0, lat, lon, isLand });
    }

    // Arc points for transaction liquidity routing
    const arcs = [
      { start: { lat: 27.7, lon: 85.3 }, end: { lat: 19.0, lon: 72.8 }, progress: 0 },
      { start: { lat: 27.7, lon: 85.3 }, end: { lat: 28.6, lon: 77.2 }, progress: 0.35 },
      { start: { lat: 27.7, lon: 85.3 }, end: { lat: 1.35, lon: 103.8 }, progress: 0.7 },
    ];

    function latLonToXYZ(lat: number, lon: number) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return {
        x: -(Math.sin(phi) * Math.cos(theta)),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      };
    }

    function rotatePoint(p: { x: number; y: number; z: number }) {
      // Rotate around X (tilt)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = p.y * cosX - p.z * sinX;
      const z1 = p.y * sinX + p.z * cosX;

      // Rotate around Y (spin)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x2 = p.x * cosY + z1 * sinY;
      const z2 = -p.x * sinY + z1 * cosY;

      return { x: x2, y: y1, z: z2 };
    }

    let time = 0;

    function render() {
      if (!ctx || !canvas) return;
      time += 0.025;

      if (!isDragging) {
        rotY += autoRotateSpeed;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Atmosphere Radial Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.35);
      glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.04)");
      glowGrad.addColorStop(0.65, "rgba(16, 185, 129, 0.08)");
      glowGrad.addColorStop(0.85, "rgba(78, 222, 163, 0.18)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Sphere & Rim Lighting
      const rimGrad = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
      rimGrad.addColorStop(0, "#0e182e");
      rimGrad.addColorStop(0.7, "#080e1c");
      rimGrad.addColorStop(1, "#03060d");

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere Outer Ring Stroke
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Orbital Horizon Ring (Mercury style)
      ctx.save();
      ctx.strokeStyle = "rgba(78, 222, 163, 0.25)";
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.18, radius * 0.35, -0.22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Render 3D Dots on Sphere
      for (let i = 0; i < points.length; i++) {
        const pt = points[i]!;
        const rotated = rotatePoint(pt);

        // Only render front hemisphere points
        if (rotated.z > 0) {
          const screenX = cx + rotated.x * radius;
          const screenY = cy - rotated.y * radius;
          const depthAlpha = Math.max(0.08, (rotated.z + 0.2) / 1.2);

          ctx.beginPath();
          const dotRadius = (pt.isLand ? 1.6 : 0.9) * dpr;
          ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);

          if (pt.isLand) {
            ctx.fillStyle = `rgba(147, 197, 253, ${depthAlpha * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha * 0.25})`;
          }
          ctx.fill();
        }
      }

      // 5. Highlight Marker (Nepal Disaster Hotspot)
      const targetP = latLonToXYZ(highlightLat, highlightLon);
      const targetRot = rotatePoint(targetP);

      if (targetRot.z > -0.1) {
        const targetX = cx + targetRot.x * radius;
        const targetY = cy - targetRot.y * radius;
        const isFacing = targetRot.z > 0.15;
        const alpha = isFacing ? 1.0 : Math.max(0.2, (targetRot.z + 0.1) / 0.25);

        // Pulsing radar rings
        const pulseSize = (Math.sin(time * 3) + 1) * 8 * dpr;
        ctx.strokeStyle = `rgba(248, 113, 113, ${alpha * 0.85})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4 * dpr + pulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Solid epicenter core
        ctx.fillStyle = `rgba(248, 113, 113, ${alpha})`;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(targetX, targetY, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fill();

        // Elegant floating badge for the epicenter
        if (isFacing) {
          const labelX = targetX + 16 * dpr;
          const labelY = targetY - 14 * dpr;

          // Connective hairline
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath();
          ctx.moveTo(targetX, targetY);
          ctx.lineTo(labelX, labelY);
          ctx.lineTo(labelX + 90 * dpr, labelY);
          ctx.stroke();

          // Label text
          ctx.font = `600 ${9 * dpr}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = "#4edea3";
          ctx.fillText("NEPAL BASIN", labelX + 4 * dpr, labelY - 4 * dpr);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Mouse Interaction Handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.006;
      rotX += dy * 0.006;
      rotX = Math.max(-0.9, Math.min(0.9, rotX));
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvasEl) {
        canvasEl.removeEventListener("mousedown", onMouseDown);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [size, highlightLat, highlightLon]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing rounded-full touch-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {/* Floating Status Pill */}
      <div className="absolute -bottom-4 bg-[#0a101f]/90 border border-white/[0.1] px-3.5 py-1 rounded-full text-[11px] font-mono text-slate-300 backdrop-blur-md shadow-lg flex items-center gap-2 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-pulse" />
        <span>{highlightLabel}</span>
      </div>
    </div>
  );
}
