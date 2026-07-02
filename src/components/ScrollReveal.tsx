'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_STYLE: React.CSSProperties = {};

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  y = 28,
  className = '',
  style = DEFAULT_STYLE,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{
        duration,
        delay,
        ease: [0.19, 1, 0.22, 1], // Gucci-style easeExpo
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
