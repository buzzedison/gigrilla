"use client";

import { useState } from "react";
import NextImage, { type ImageProps } from "next/image";

const ERROR_IMG_SRC = "https://via.placeholder.com/400x300?text=Preview+Unavailable";

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src: string;
}

export function ImageWithFallback({ src, alt, onError, ...rest }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const handleError: NonNullable<ImageProps["onError"]> = (event) => {
    setHasError(true);
    onError?.(event);
  };

  const effectiveSrc = hasError ? ERROR_IMG_SRC : src;

  return (
    <NextImage
      src={effectiveSrc}
      alt={alt}
      onError={handleError}
      unoptimized
      {...rest}
      data-original-url={src}
    />
  );
}
