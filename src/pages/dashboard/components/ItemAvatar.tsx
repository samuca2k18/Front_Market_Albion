import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ItemAvatarProps {
  src: string;
  alt: string;
  sizeClassName?: string;
  imageClassName?: string;
  fallbackIconClassName?: string;
}

export function ItemAvatar({
  src,
  alt,
  sizeClassName = "h-10 w-10",
  imageClassName = "",
  fallbackIconClassName = "w-5 h-5",
}: ItemAvatarProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative flex-shrink-0 ${sizeClassName}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full rounded-lg bg-black/40 border border-border/20 transition-transform ${imageClassName} ${hasError ? 'hidden' : ''}`}
        loading="lazy"
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg border border-border/20">
          <ImageOff className={`${fallbackIconClassName} text-muted-foreground/30`} />
        </div>
      )}
    </div>
  );
}
