'use client';
import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './ImageZoom.module.css';

interface ImageZoomProps {
  src: string;
  alt: string;
  zoomLevel?: number;
}

const LENS_SIZE = 140;
const ZOOM = 2.8;

export default function ImageZoom({ src, alt, zoomLevel = ZOOM }: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Raw cursor position relative to container
    let curX = e.clientX - rect.left;
    let curY = e.clientY - rect.top;

    // Lens top-left position (centered on cursor, clamped inside container)
    let lensLeft = curX - LENS_SIZE / 2;
    let lensTop  = curY - LENS_SIZE / 2;
    lensLeft = Math.max(0, Math.min(lensLeft, rect.width  - LENS_SIZE));
    lensTop  = Math.max(0, Math.min(lensTop,  rect.height - LENS_SIZE));

    // Effective cursor after clamping (center of lens)
    const effectiveX = lensLeft + LENS_SIZE / 2;
    const effectiveY = lensTop  + LENS_SIZE / 2;

    // Background-size = container * zoom (in px)
    const bgW = rect.width  * zoomLevel;
    const bgH = rect.height * zoomLevel;

    // Background-position: shift so that effectiveX/Y is centered in lens
    const bgX = effectiveX * zoomLevel - LENS_SIZE / 2;
    const bgY = effectiveY * zoomLevel - LENS_SIZE / 2;

    setLensStyle({
      left: lensLeft,
      top:  lensTop,
      backgroundImage: `url(${src})`,
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: `-${bgX}px -${bgY}px`,
    });
  }, [src, zoomLevel]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={styles.mainImage}
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Magnifier lens */}
      {zoomed && (
        <div
          className={styles.lens}
          style={{ width: LENS_SIZE, height: LENS_SIZE, ...lensStyle }}
        />
      )}

      {/* Hint badge */}
      {!zoomed && (
        <div className={styles.hint}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Hover to Zoom
        </div>
      )}
    </div>
  );
}
