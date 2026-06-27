'use client';

import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  /** Current image — base64 data URL or null */
  value: string | null;
  /** Called when a new image is chosen. Pass null to remove. */
  onChange: (dataUrl: string | null) => void;
  /** Optional label shown above the uploader */
  label?: string;
  /** Aspect ratio CSS value, e.g. '16/9' or '1' */
  aspectRatio?: string;
  /** Max size in MB (default 5) */
  maxMB?: number;
  /** Whether to show the compact inline style (no label wrapper) */
  compact?: boolean;
}

const compressImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function ImageUploader({
  value,
  onChange,
  label,
  aspectRatio = '4/3',
  maxMB = 5,
  compact = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const compressed = await compressImage(file, 800, 600, 0.75);
      onChange(compressed);
    } catch (err) {
      console.error('Image compression failed, falling back to raw upload:', err);
      if (file.size > maxMB * 1024 * 1024) {
        alert(`Image must be under ${maxMB} MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so same file can re-trigger
    e.target.value = '';
  };

  const LABEL_STYLE: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.62rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  };

  const dropZone = value ? (
    /* ── Has image — show preview ── */
    <div
      style={{
        position:    'relative',
        aspectRatio,
        overflow:    'hidden',
        background:  '#0d0d0d',
        border:      '1px solid var(--dark-border)',
        cursor:      'pointer',
      }}
      onClick={() => inputRef.current?.click()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={value}
        alt="Uploaded preview"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* Hover overlay */}
      <div
        style={{
          position:       'absolute',
          inset:          0,
          background:     'rgba(0,0,0,0.55)',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '8px',
          opacity:        0,
          transition:     'opacity 0.25s ease',
          color:          'var(--cream)',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0')}
      >
        <Upload size={20} />
        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Change Image
        </span>
      </div>
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onChange(null); }}
        title="Remove image"
        style={{
          position:       'absolute',
          top:            '8px',
          right:          '8px',
          width:          '28px',
          height:         '28px',
          borderRadius:   '50%',
          background:     'rgba(0,0,0,0.75)',
          border:         '1px solid rgba(255,255,255,0.15)',
          color:          '#fff',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          cursor:         'pointer',
          transition:     'background 0.2s ease',
          zIndex:         10,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.8)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.75)')}
      >
        <X size={13} />
      </button>
    </div>
  ) : (
    /* ── No image — drop zone ── */
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(197,168,92,0.04)'; }}
      onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--dark-border)'; (e.currentTarget as HTMLElement).style.background = 'var(--dark-surface)'; }}
      style={{
        aspectRatio,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '10px',
        background:     'var(--dark-surface)',
        border:         '1px dashed var(--dark-border)',
        cursor:         'pointer',
        transition:     'all 0.2s ease',
        padding:        '24px',
      }}
    >
      <ImageIcon size={compact ? 20 : 28} color="var(--gold)" style={{ opacity: 0.4 }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: compact ? '0.7rem' : '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Click or drag &amp; drop
        </p>
        <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          JPG, PNG, WEBP — max {maxMB} MB
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {label && !compact && <label style={LABEL_STYLE}>{label}</label>}
      {dropZone}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}
