"use client";

// Based on the "expanded-map" component from 21st.dev. Changes: tiles come from lib/tiles
// (keyless CARTO now serves a placeholder), attribution is shown, brand colours, keyboard
// support and a `fluid` mode that fills its container.

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import NextImage from "next/image";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { attribution, latLngToTile, tileFilter, tileUrl, worldPoint, type TileStyle } from "@/lib/tiles";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  /** Location name to display */
  location?: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Zoom level for the map (1-18) */
  zoom?: number;
  /** Additional CSS classes */
  className?: string;
  /** Map tile provider */
  tileProvider?: "openstreetmap" | "carto-light" | "carto-dark";
  /** Whether the card starts expanded */
  defaultExpanded?: boolean;
  /** Fill the parent's width and only animate the height */
  fluid?: boolean;
}

const PROVIDER_STYLE: Record<NonNullable<LocationMapProps["tileProvider"]>, TileStyle> = {
  openstreetmap: "voyager",
  "carto-light": "light",
  "carto-dark": "dark",
};

// Format coordinates for display
function formatCoordinates(lat: number, lng: number) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function LocationMap({
  location = "Kuala Lumpur",
  latitude = 3.1579,
  longitude = 101.7116,
  zoom = 14,
  className,
  tileProvider = "carto-light",
  defaultExpanded = false,
  fluid = false,
}: LocationMapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const style = PROVIDER_STYLE[tileProvider];
  const osm = tileProvider === "openstreetmap";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-50, 50], [8, -8]);
  const rotateY = useTransform(mouseX, [-50, 50], [-8, 8]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const coordinates = useMemo(() => formatCoordinates(latitude, longitude), [latitude, longitude]);

  // Generate tile URLs for a 3x3 grid around the center tile
  const tiles = useMemo(() => {
    const centerTile = latLngToTile(latitude, longitude, zoom);
    const tileUrls: { url: string; offsetX: number; offsetY: number }[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        tileUrls.push({ url: tileUrl(style, centerTile.x + dx, centerTile.y + dy, zoom, osm), offsetX: dx, offsetY: dy });
      }
    }
    return tileUrls;
  }, [latitude, longitude, zoom, style, osm]);

  // Shift the grid so the exact coordinate (not the centre of its tile) sits under the marker.
  const shift = useMemo(() => {
    const p = worldPoint(latitude, longitude);
    const k = 2 ** zoom;
    return { x: 128 - ((p.x * k) % 256), y: 128 - ((p.y * k) % 256) };
  }, [latitude, longitude, zoom]);

  // Preload tiles
  useEffect(() => {
    let loadedCount = 0;
    const done = () => {
      loadedCount++;
      if (loadedCount === tiles.length) setTilesLoaded(true);
    };
    tiles.forEach((tile) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = done;
      img.onerror = done;
      img.src = tile.url;
    });
  }, [tiles]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const toggle = () => setIsExpanded((v) => !v);

  return (
    <motion.div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={location}
      className={cn("relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl", className)}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border bg-background"
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
        animate={{ width: fluid ? "100%" : isExpanded ? 360 : 240, height: isExpanded ? 280 : 140 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-muted/20 via-transparent to-muted/40" />

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Real map tiles */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute"
                  style={{ width: "768px", height: "768px", left: "50%", top: "50%", transform: `translate(calc(-50% + ${shift.x}px), calc(-50% + ${shift.y}px))`, filter: tileFilter(style, osm) }}
                >
                  {tiles.map((tile, index) => (
                    <motion.div
                      key={tile.url}
                      className="absolute"
                      style={{ width: "256px", height: "256px", left: `${(tile.offsetX + 1) * 256}px`, top: `${(tile.offsetY + 1) * 256}px` }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: tilesLoaded ? 1 : 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <NextImage src={tile.url} alt="" width={256} height={256} unoptimized crossOrigin="anonymous" className="h-full w-full" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map loading placeholder */}
              {!tilesLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}

              {/* Location marker */}
              <motion.div
                className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg" style={{ filter: "drop-shadow(0 0 10px rgba(214, 69, 43, 0.5))" }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--color-primary)" />
                  <circle cx="12" cy="9" r="2.5" className="fill-background" />
                </svg>
              </motion.div>

              {/* Gradient overlays for better text readability */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/50 via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid pattern - only show when collapsed */}
        <motion.div className="absolute inset-0 opacity-[0.03]" animate={{ opacity: isExpanded ? 0 : 0.03 }} transition={{ duration: 0.3 }}>
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="expanded-map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" className="stroke-foreground" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#expanded-map-grid)" />
          </svg>
        </motion.div>

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-between p-5">
          {/* Top section */}
          <div className="flex items-start justify-between">
            <motion.div className="relative" animate={{ opacity: isExpanded ? 0 : 1 }} transition={{ duration: 0.3 }}>
              {/* Map Icon SVG */}
              <motion.svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
                animate={{
                  filter: isHovered ? "drop-shadow(0 0 8px rgba(214, 69, 43, 0.55))" : "drop-shadow(0 0 4px rgba(214, 69, 43, 0.25))",
                }}
                transition={{ duration: 0.3 }}
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" x2="9" y1="3" y2="18" />
                <line x1="15" x2="15" y1="6" y2="21" />
              </motion.svg>
            </motion.div>
            {isExpanded && (
              <a
                href={attribution.href}
                target="_blank"
                rel="noopener"
                onClick={(e) => e.stopPropagation()}
                className="rounded bg-background/80 px-1.5 py-0.5 text-[9px] text-muted-foreground backdrop-blur hover:text-foreground"
              >
                {attribution.text}
              </a>
            )}
          </div>

          {/* Bottom section */}
          <div className="space-y-1">
            <motion.h3
              className="font-medium text-foreground text-sm tracking-tight"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {location}
            </motion.h3>

            <AnimatePresence>
              {isExpanded && (
                <motion.p
                  className="font-mono text-muted-foreground text-xs"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {coordinates}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Animated underline */}
            <motion.div
              className="h-px bg-gradient-to-r from-primary/50 via-primary/30 to-transparent"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: isHovered || isExpanded ? 1 : 0.3 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LocationMap;
