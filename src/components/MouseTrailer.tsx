'use client';

import React, { useEffect, useRef } from 'react';

export default function MouseTrailer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const lastMousePos = useRef({ x: -100, y: -100 });
  const isActiveRef = useRef(false);

  const isMovingRef = useRef(false);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopProgressRef = useRef(0); // 0 = moving, 1 = fully stopped
  const isHoveringInteractiveRef = useRef(false);

  useEffect(() => {
    // Disable trail on touch devices (mobile, tablet) to avoid weird tap behaviors
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      lastMousePos.current = { x, y };

      // Check if hovering over an interactive element (links, buttons, inputs)
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive =
          target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('a') ||
          target.closest('button') ||
          target.closest('[role="button"]') ||
          window.getComputedStyle(target).cursor === 'pointer';
        
        isHoveringInteractiveRef.current = !!isInteractive;
      }

      isMovingRef.current = true;
      isActiveRef.current = true;

      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
      stopTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
      }, 120); // Smooth stopped state transition after 120ms of inactivity

      pointsRef.current.push({ x, y });
      // Keep trail length to about 25 points for a sleek, fast-moving line look
      if (pointsRef.current.length > 25) {
        pointsRef.current.shift();
      }
    };

    const handleMouseLeave = () => {
      isMovingRef.current = false;
      lastMousePos.current = { x: -100, y: -100 }; // offscreen
      pointsRef.current = [];
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId: number;

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const points = pointsRef.current;

      // Update stop progress for smooth transition of the stationary circle
      if (isMovingRef.current) {
        stopProgressRef.current = Math.max(0, stopProgressRef.current - 0.15);
      } else {
        stopProgressRef.current = Math.min(1, stopProgressRef.current + 0.08);
      }

      // If the mouse is stationary, gradually remove points from the tail to fade the line away
      if (points.length > 0) {
        if (!isActiveRef.current) {
          points.shift();
        }
        isActiveRef.current = false;
      }

      // 1. Draw the trail line
      if (points.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 0; // Disable shadow for clean vector lines

        for (let i = 1; i < points.length; i++) {
          const p1 = points[i - 1];
          const p2 = points[i];
          const t = i / (points.length - 1);

          // Interpolate color from Gold (#a1824a) to Burnt Orange (#c2410c)
          const r = Math.round(161 + (194 - 161) * t);
          const g = Math.round(130 + (65 - 130) * t);
          const b = Math.round(74 + (12 - 74) * t);

          // Fade out the trail when mouse stops
          const alpha = (0.15 + t * 0.85) * (1 - stopProgressRef.current);

          if (alpha > 0.01) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.lineWidth = 1.5 + t * 5;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // 2. Draw the custom cursor pointer and stopped circle
      const mx = lastMousePos.current.x;
      const my = lastMousePos.current.y;

      if (mx > -10 && my > -10) {
        // Gold outline ring that appears when stopped (radius: 19px = 0.5cm)
        if (stopProgressRef.current > 0) {
          const ringRadius = 12 + stopProgressRef.current * 7; // Expands from 12px to 19px
          const ringAlpha = stopProgressRef.current * 0.75;

          ctx.beginPath();
          ctx.arc(mx, my, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(197, 168, 92, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(197, 168, 92, 0.4)';
          ctx.stroke();
        }

        // Center cursor dot (Burnt Orange #c2410c by default, Gold #c5a85c on hover)
        ctx.beginPath();
        const dotRadius = isHoveringInteractiveRef.current ? 5 : 3.5;
        ctx.arc(mx, my, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHoveringInteractiveRef.current ? '#c5a85c' : '#c2410c';
        ctx.shadowBlur = 6;
        ctx.shadowColor = isHoveringInteractiveRef.current ? '#c5a85c' : '#c2410c';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Hide browser's default cursor globally on customer pages */
        * {
          cursor: none !important;
        }
      `}</style>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 999999,
        }}
      />
    </>
  );
}
