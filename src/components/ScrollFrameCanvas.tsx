'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';

const TOTAL_FRAMES = 150;

function getFramePath(index: number): string {
  const padded = String(index).padStart(3, '0');
  return `/frames/ezgif-frame-${padded}.png`;
}

interface Props {
  children: ReactNode;
}

/**
 * Wraps child sections and renders a scroll-driven frame sequence
 * as an absolute background behind them.
 *
 * Frame 001 shows when the wrapper enters the viewport;
 * frame 150 shows when the wrapper leaves the viewport.
 */
export default function ScrollFrameCanvas({ children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Preload all 150 images ──
  useEffect(() => {
    let alive = true;
    const images: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      const onDone = () => {
        if (!alive) return;
        count++;
        setLoadedCount(count);
        if (count === TOTAL_FRAMES) setIsLoaded(true);
      };
      img.onload = onDone;
      img.onerror = onDone;
      images.push(img);
    }

    imagesRef.current = images;
    return () => { alive = false; };
  }, []);

  // ── Draw a single frame onto the canvas ──
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Resize only when needed
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Cover the entire canvas area (like background-size: cover)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = rect.width / rect.height;

    let dw: number, dh: number, dx: number, dy: number;
    if (canvasRatio > imgRatio) {
      dw = rect.width;
      dh = rect.width / imgRatio;
      dx = 0;
      dy = (rect.height - dh) / 2;
    } else {
      dh = rect.height;
      dw = rect.height * imgRatio;
      dx = (rect.width - dw) / 2;
      dy = 0;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  };

  // ── Scroll handler: map wrapper scroll progress → frame index ──
  useEffect(() => {
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const wh = window.innerHeight;

      // progress 0 → when top of wrapper reaches bottom of viewport
      // progress 1 → when bottom of wrapper reaches top of viewport
      const start = rect.top - wh;  // wrapper enters viewport
      const end = rect.bottom;      // wrapper fully leaves viewport
      const total = end - start;
      if (total <= 0) return;

      const progress = Math.max(0, Math.min(1, -start / total));
      const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

      if (idx !== currentFrameRef.current) {
        currentFrameRef.current = idx;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(idx));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded]);

  // Draw first frame once enough images have loaded
  useEffect(() => {
    if (loadedCount > 0) drawFrame(currentFrameRef.current);
  }, [loadedCount]);

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* ── Canvas background layer ── */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: loadedCount > 5 ? 0.45 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Dark overlay so text stays readable ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(242,238,228,0.55) 0%, rgba(242,238,228,0.35) 40%, rgba(242,238,228,0.55) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Loading indicator ── */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.5rem', fontWeight: 600,
            letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--red)',
          }}>
            Loading ({Math.round((loadedCount / TOTAL_FRAMES) * 100)}%)
          </span>
          <div style={{
            width: '120px', height: '2px',
            background: 'var(--dark-border)', borderRadius: '1px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${(loadedCount / TOTAL_FRAMES) * 100}%`,
              height: '100%', background: 'var(--red)', transition: 'width 0.15s linear',
            }} />
          </div>
        </div>
      )}

      {/* ── Foreground content (the child sections) ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
