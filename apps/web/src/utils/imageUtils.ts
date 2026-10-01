export interface ImageProcessingOptions {
  targetSize?: number; // Canvas width/height in px (default: 800)
  paddingRatio?: number; // Safety padding margin ratio (default: 0.08 = 8%)
  fallbackBg?: string; // Fallback background color (default: #F8F9FA)
  format?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number; // 0 to 1
  addBrandTag?: boolean;
}

/**
 * Loads an image safely from a File object or URL string.
 * Uses SSR safety checks and suppresses CORS/unhandled promise rejections.
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("Cannot load image on server side"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin attribute to allow displaying standard images
      const retryImg = new Image();
      retryImg.onload = () => resolve(retryImg);
      retryImg.onerror = () => reject(new Error("Failed to load image"));
      if (typeof source === "string") {
        retryImg.src = source;
      } else {
        reject(new Error("Failed to load image file"));
      }
    };

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error("FileReader result empty"));
        }
      };
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Processes a supplier image by fitting it on a clean 1:1 canvas.
 * Safe against CORS canvas taint and SSR errors.
 */
export async function processProductImage(
  source: File | string,
  options: ImageProcessingOptions = {},
): Promise<string> {
  if (typeof window === 'undefined' || !source) {
    return typeof source === 'string' ? source : '';
  }

  const {
    targetSize = 800,
    paddingRatio = 0.08,
    fallbackBg = "#F8F9FA",
    format = "image/jpeg",
    quality = 0.85,
    addBrandTag = false,
  } = options;

  // Remote Web URLs: return directly to avoid cross-origin canvas security taint
  if (typeof source === 'string' && !source.startsWith('data:') && !source.startsWith('blob:')) {
    return source;
  }

  try {
    const img = await loadImage(source);
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) return typeof source === 'string' ? source : '';

    // Draw solid canvas background
    ctx.fillStyle = fallbackBg;
    ctx.fillRect(0, 0, targetSize, targetSize);

    // Compute aspect ratio fit with padding
    const maxDim = targetSize * (1 - 2 * paddingRatio);
    const scale = Math.min(maxDim / img.width, maxDim / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (targetSize - drawW) / 2;
    const drawY = (targetSize - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    if (addBrandTag) {
      ctx.fillStyle = "rgba(200, 90, 50, 0.85)";
      ctx.fillRect(16, targetSize - 40, 140, 24);
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("BITS B2B VERIFIED", 24, targetSize - 24);
    }

    return canvas.toDataURL(format, quality);
  } catch {
    return typeof source === 'string' ? source : '';
  }
}

export async function processSupplierImages(
  sources: (File | string)[],
  options: ImageProcessingOptions = {}
): Promise<string[]> {
  const results: string[] = [];
  for (const src of sources) {
    const res = await processProductImage(src, options);
    results.push(res);
  }
  return results;
}

export async function ensureCanvasProductImage(
  source: File | string,
  options: ImageProcessingOptions = {}
): Promise<string> {
  return processProductImage(source, options);
}
