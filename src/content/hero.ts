// Cinematic hero: three photo chapters (Genting → Batu Caves → KLCC).
// While HERO is null the home page shows the illustrated <DescentHero>.
// When the AI Studio frames arrive they go to src/assets/hero/ and are imported here, e.g.
//   import gentingWide from "@/assets/hero/genting-wide.jpg";
// (see docs/ai-studio-prompts.md for the expected files).
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

export const HERO: HeroConfig | null = null;
