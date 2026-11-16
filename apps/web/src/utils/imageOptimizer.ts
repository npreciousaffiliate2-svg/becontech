/**
 * CampusOne Institutional Image Optimization Utility
 * Automatically resizes, compresses, and optimizes images client-side before storage/database persistence.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0 (default 0.82)
  outputType?: 'image/webp' | 'image/jpeg';
}

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  compressionRatio: string;
}

export async function optimizeImage(
  inputFile: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 0.82,
    outputType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, fail gracefully
    if (!inputFile.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(inputFile);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Calculate constrained aspect-ratio dimensions
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Create offscreen canvas for hardware-accelerated rendering
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available.'));
        return;
      }

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Export as optimized WebP or JPEG
      let format = outputType;
      // Verify webp support by testing canvas output
      let dataUrl = canvas.toDataURL(format, quality);
      if (!dataUrl.startsWith(`data:${format}`)) {
        format = 'image/jpeg';
        dataUrl = canvas.toDataURL(format, quality);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create optimized image blob.'));
            return;
          }

          const fileExt = format === 'image/webp' ? 'webp' : 'jpg';
          const baseName = inputFile.name.replace(/\.[^/.]+$/, '');
          const optimizedFile = new File([blob], `${baseName}-opt.${fileExt}`, {
            type: format,
            lastModified: Date.now(),
          });

          const origSize = inputFile.size;
          const optSize = blob.size;
          const savedPct = Math.max(0, Math.round(((origSize - optSize) / origSize) * 100));

          resolve({
            file: optimizedFile,
            dataUrl,
            width: targetWidth,
            height: targetHeight,
            originalSizeBytes: origSize,
            optimizedSizeBytes: optSize,
            compressionRatio: `${savedPct}% reduced`,
          });
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for optimization.'));
    };

    img.src = objectUrl;
  });
}
