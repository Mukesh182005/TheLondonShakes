'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  borderRadius?: string;
  parallaxOffset?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_STYLE: React.CSSProperties = {};

export default function ParallaxImage({
  src,
  alt,
  aspectRatio = '4/5',
  borderRadius = '0px',
  parallaxOffset = 40,
  className = '',
  style = DEFAULT_STYLE,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the container relative to the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress (0 to 1) to image vertical offset (-parallaxOffset to +parallaxOffset)
  const y = useTransform(scrollYProgress, [0, 1], [-parallaxOffset, parallaxOffset]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio,
        borderRadius,
        background: 'var(--dark-card)',
        width: '100%',
        ...style,
      }}
      className={className}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: `calc(100% + ${parallaxOffset * 2}px)`,
          objectFit: 'cover',
          position: 'absolute',
          top: -parallaxOffset,
          left: 0,
          y,
        }}
      />
    </div>
  );
}
