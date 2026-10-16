/**
 * Image Optimization Utilities
 * Automatically transforms Cloudinary URLs to modern, compressed WebP/AVIF formats
 * with sensible viewport dimension limits and quality settings to drastically accelerate loading times.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  crop?: 'limit' | 'fill' | 'fit' | 'scale' | 'thumb';
  dpr?: number | 'auto';
}

/**
 * Optimizes an image URL (specifically Cloudinary image URLs) by inserting
 * automatic format, quality compression, and size parameters.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  // Already transformed with f_auto / q_auto
  if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    dpr,
  } = options;

  const transforms: string[] = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (dpr) transforms.push(`dpr_${dpr}`);

  const transformString = transforms.join(',');

  // Insert transforms right after /upload/
  return url.replace(/\/image\/upload\/(v\d+\/)?/, `/image/upload/${transformString}/$1`);
}

/**
 * Generates an srcset string for responsive image loading
 */
export function getCloudinarySrcSet(
  url?: string | null,
  widths: number[] = [320, 480, 640, 800, 1024, 1280]
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('res.cloudinary.com')) return '';

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}
