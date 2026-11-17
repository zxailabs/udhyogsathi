"use client";

import React, { useEffect, useRef, useState } from "react";

interface AmbientBackgroundProps {
  particlesEnabled: boolean;
}

export function AmbientBackground({ particlesEnabled }: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 28 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    if (!particlesEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 34;
    const particles = Array.from({ length: count }, (_, idx) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.8 + 0.8,
      color:
        idx % 3 === 0
          ? "rgba(255, 107, 0, 0.36)"
          : idx % 3 === 1
          ? "rgba(16, 185, 129, 0.28)"
          : "rgba(245, 158, 11, 0.28)",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [particlesEnabled]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Saffron top-right orb */}
      <div
        className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full blur-[140px] opacity-25"
        style={{ background: "radial-gradient(circle, #FF6B00 0%, transparent 70%)" }}
      />
      {/* Emerald bottom-left orb */}
      <div
        className="absolute -bottom-36 -left-24 w-[520px] h-[520px] rounded-full blur-[150px] opacity-20"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
      />
      {/* Subtle Amber center glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[440px] h-[440px] rounded-full blur-[160px] opacity-10"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
      />
      {/* Mouse follow radial glow */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(520px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 107, 0, 0.08), transparent 65%)`,
        }}
      />
      {particlesEnabled && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-75" />
      )}
    </div>
  );
}

