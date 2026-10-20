// Resizes the AI Studio frames from assets-incoming/ into src/assets/hero/.
// Usage: npx tsx scripts/prepare-hero.ts
import { existsSync, mkdirSync, readdirSync } from "fs";
import path from "path";
import sharp from "sharp";

const IN = "assets-incoming";
const OUT = "src/assets/hero";
const IMAGES = /\.(png|jpe?g|webp)$/i;

// Long edge per kind of frame; next/image serves AVIF/WebP at smaller sizes from these.
const SIZES: Record<string, { width?: number; height?: number }> = {
  wide: { width: 2560 },
  tall: { height: 2560 },
  clouds: { width: 2560 },
  og: { width: 1600 },
};

if (!existsSync(IN)) {
  console.error(`No ${IN}/ folder. Put the generated frames there first (see docs/ai-studio-prompts.md).`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

for (const file of readdirSync(IN).filter((f) => IMAGES.test(f))) {
  const name = path.parse(file).name.toLowerCase();
  const kind = Object.keys(SIZES).find((k) => name.endsWith(k) || name === k);
  if (!kind) {
    console.warn(`skip ${file}: name should end with -wide, -tall, clouds or og`);
    continue;
  }
  const target = path.join(OUT, `${name}.jpg`);
  const info = await sharp(path.join(IN, file))
    .rotate()
    .resize({ ...SIZES[kind], withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(target);
  console.log(`${file} → ${target} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
