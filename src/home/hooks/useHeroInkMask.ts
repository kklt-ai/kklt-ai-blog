import { RefObject, useEffect } from "react";

type InkStamp = {
  x: number;
  y: number;
  born: number;
  seed: number;
  rmax: number;
};

export function useHeroInkMask(
  heroRef: RefObject<HTMLElement>,
  maskRef: RefObject<HTMLCanvasElement>,
) {
  useEffect(() => {
    if (!heroRef.current || !maskRef.current || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const heroNode = heroRef.current;
    const canvasNode = maskRef.current;
    const context = canvasNode.getContext("2d");
    if (!context) return;

    const ctx = context;
    const stamps: InkStamp[] = [];
    const mask = "252, 250, 248";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let lastX: number | null = null;
    let lastY: number | null = null;
    let running = false;

    function resize() {
      const rect = heroNode.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvasNode.width = Math.round(width * dpr);
      canvasNode.height = Math.round(height * dpr);
      canvasNode.style.width = `${width}px`;
      canvasNode.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${mask})`;
      ctx.fillRect(0, 0, width, height);
    }

    function addStamp(x: number, y: number) {
      if (stamps.length >= 160) stamps.shift();
      stamps.push({
        x,
        y,
        born: performance.now(),
        seed: Math.random() * Math.PI * 2,
        rmax: 128 * (0.55 + Math.random() * 0.45),
      });
    }

    function stampAlong(x: number, y: number) {
      if (lastX === null || lastY === null) {
        addStamp(x, y);
      } else {
        const dx = x - lastX;
        const dy = y - lastY;
        const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 12));
        for (let i = 1; i <= steps; i += 1) {
          addStamp(lastX + (dx * i) / steps, lastY + (dy * i) / steps);
        }
      }
      lastX = x;
      lastY = y;
    }

    function carveInk(x: number, y: number, radius: number, alpha: number, seed: number) {
      const gradient = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${0.95 * alpha})`);
      gradient.addColorStop(0.55, `rgba(0, 0, 0, ${0.88 * alpha})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();

      for (let i = 0; i <= 32; i += 1) {
        const angle = (i / 32) * Math.PI * 2;
        const wobble =
          0.78 +
          0.14 * Math.sin(angle * 3 + seed) +
          0.08 * Math.sin(angle * 7 + seed * 2.1) +
          0.05 * Math.sin(angle * 13 + seed * 0.7);
        const px = x + Math.cos(angle) * radius * wobble;
        const py = y + Math.sin(angle) * radius * wobble;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      ctx.fill();
    }

    function loop() {
      const now = performance.now();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${mask})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "destination-out";

      for (let i = stamps.length - 1; i >= 0; i -= 1) {
        const age = (now - stamps[i].born) / 520;
        if (age >= 1) {
          stamps.splice(i, 1);
          continue;
        }
        const ease = 1 - (1 - age) ** 3;
        carveInk(stamps[i].x, stamps[i].y, 8 + (stamps[i].rmax - 8) * ease, 1 - age * age, stamps[i].seed);
      }

      if (stamps.length) {
        window.requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) {
        running = true;
        window.requestAnimationFrame(loop);
      }
    }

    function handlePointerMove(event: MouseEvent) {
      const rect = heroNode.getBoundingClientRect();
      stampAlong(event.clientX - rect.left, event.clientY - rect.top);
      start();
    }

    function handlePointerEnter(event: MouseEvent) {
      const rect = heroNode.getBoundingClientRect();
      lastX = event.clientX - rect.left;
      lastY = event.clientY - rect.top;
      stampAlong(lastX, lastY);
      start();
    }

    function handlePointerLeave() {
      lastX = null;
      lastY = null;
    }

    resize();
    window.addEventListener("resize", resize);
    heroNode.addEventListener("mouseenter", handlePointerEnter);
    heroNode.addEventListener("mousemove", handlePointerMove);
    heroNode.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("resize", resize);
      heroNode.removeEventListener("mouseenter", handlePointerEnter);
      heroNode.removeEventListener("mousemove", handlePointerMove);
      heroNode.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [heroRef, maskRef]);
}
