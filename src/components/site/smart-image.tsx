import Image from "next/image";
import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

/** next/image with a graceful placeholder when the URL is empty. */
export function SmartImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  preload,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-jungle-2/30 via-moss/30 to-sunset/30", className)}>
        <Mountain className="size-10 text-jungle/40" />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-paper-2", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" />
    </div>
  );
}
