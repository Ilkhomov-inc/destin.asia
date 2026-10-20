// Cinematic hero: three photo chapters (Genting → Batu Caves → KLCC).
// Set HERO to null to fall back to the illustrated <DescentHero>.
// For now the frames are free Unsplash photos (Unsplash License: commercial use, no attribution
// required), served from their CDN. Own frames can replace them later: put them in
// src/assets/hero/ (see `npx tsx scripts/prepare-hero.ts`) and import them here.
import type { StaticImageData } from "next/image";

export type HeroImage = StaticImageData | { src: string; width: number; height: number };

export type CameraMove = { scale: number; x: number; y: number };

export type HeroChapter = {
  key: "genting" | "batu" | "klcc";
  /** Location page the chapter links to. */
  slug: string;
  /** Landscape (16:9) and portrait (9:16) frames. */
  wide: HeroImage;
  tall: HeroImage;
  /** Optional seamless-ish loops, played only while the chapter is on screen. */
  video?: { wide: string; tall?: string };
  /** object-position for each frame, e.g. "60% 40%". */
  focus?: { wide?: string; tall?: string };
  /** Camera move across the chapter, translate in % of the frame. */
  camera: { from: CameraMove; to: CameraMove };
};

export type HeroConfig = {
  chapters: [HeroChapter, HeroChapter, HeroChapter];
  /** Optional clouds-on-black frame used for the transitions (screen blend). */
  clouds?: HeroImage;
};

/** An Unsplash photo resized on their CDN; width/height keep the original aspect ratio. */
function unsplash(id: string, width: number, height: number, long = 3200): HeroImage {
  const k = long / Math.max(width, height);
  return { src: `https://images.unsplash.com/${id}?w=${Math.round(width * k)}&q=85&fm=jpg`, width: Math.round(width * k), height: Math.round(height * k) };
}

export const HERO: HeroConfig | null = {
  chapters: [
    {
      key: "genting",
      slug: "genting-highlands",
      // unsplash.com/photos/vOqqnk8E6Uc (Aaron Lee), unsplash.com/photos/FonlHU_bykk (James Dorevski)
      wide: unsplash("photo-1561568005-90b6540edc29", 6000, 4000),
      tall: unsplash("photo-1588030322267-24bcfd19a298", 3024, 4032),
      focus: { wide: "60% 45%", tall: "80% 50%" },
      // Slow push-in while drifting down the slope.
      camera: { from: { scale: 1.04, x: 0, y: 2 }, to: { scale: 1.14, x: -1.5, y: -2 } },
    },
    {
      key: "batu",
      slug: "batu-caves",
      // unsplash.com/photos/D7kfMn2eIXA, unsplash.com/photos/7Yo1qlC5vSc
      wide: unsplash("photo-1739523915415-3d37a944f325", 6192, 4128),
      tall: unsplash("photo-1548227702-e9340ee9cbb1", 2709, 3988),
      focus: { wide: "60% 40%", tall: "55% 45%" },
      // Pull back to reveal the statue and the stairs.
      camera: { from: { scale: 1.14, x: 1, y: 2 }, to: { scale: 1.03, x: 0, y: -1.5 } },
    },
    {
      key: "klcc",
      slug: "klcc",
      // unsplash.com/photos/djujabWDeIw, unsplash.com/photos/ne2si7Sf1VQ
      wide: unsplash("photo-1771669482498-f6d0b9aaf3a0", 7282, 4857),
      tall: unsplash("photo-1708650187311-ac65214401c4", 2195, 3264),
      focus: { wide: "50% 40%", tall: "45% 40%" },
      camera: { from: { scale: 1.03, x: 0, y: 2 }, to: { scale: 1.12, x: -1.5, y: -1 } },
    },
  ],
};
