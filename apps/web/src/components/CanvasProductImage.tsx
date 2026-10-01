'use client';
import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface CanvasProductImageProps {
  src?: string | File;
  alt: string;
  className?: string;
  containerClassName?: string;
  targetSize?: number;
  addBrandTag?: boolean;
}

export const CanvasProductImage: React.FC<CanvasProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-contain',
  containerClassName = 'w-full h-full flex items-center justify-center bg-[#FAF7F2] relative overflow-hidden',
}) => {
  const [error, setError] = useState<boolean>(false);

  const getImageSrc = (): string => {
    if (!src) return '';
    if (typeof src === 'string') return src;
    try {
      return URL.createObjectURL(src);
    } catch {
      return '';
    }
  };

  const imageSrc = getImageSrc();

  if (error || !imageSrc) {
    return (
      <div className={`${containerClassName} border border-[#E5DFD5] rounded-xl flex flex-col items-center justify-center p-4 text-[#888]`}>
        <Package className="w-8 h-8 text-[#C85A32] mb-1 opacity-70" />
        <span className="text-[11px] font-semibold">Product Photo</span>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default CanvasProductImage;
