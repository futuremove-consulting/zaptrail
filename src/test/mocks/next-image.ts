import React from 'react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown;
}

export default function Image({ src, alt, width, height, ...props }: ImageProps) {
  return React.createElement('img', { src, alt, width, height, ...props });
}
