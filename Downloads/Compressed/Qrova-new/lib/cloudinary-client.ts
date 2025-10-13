export interface TransformationOptions {
  width?: number | string
  height?: number | string
  crop?: string
  quality?: string | number
  format?: string
  fetch_format?: string
  effect?: string // e.g. "blur:1000"
  raw?: string // raw transformation string to append verbatim
}

export const buildImageUrl = (publicId: string, options: TransformationOptions = {}) => {
  const defaultOptions: TransformationOptions = {
    crop: 'scale',
    quality: 'auto',
    format: 'auto',
  };

  const mergedOptions: TransformationOptions = { ...defaultOptions, ...options };

  // Raw transformation overrides everything (advanced)
  if (mergedOptions.raw) {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${mergedOptions.raw}/${publicId}`;
  }

  const map: Record<string, any> = {
    w: mergedOptions.width,
    h: mergedOptions.height,
    c: mergedOptions.crop,
    q: mergedOptions.quality,
    f: mergedOptions.format,
    fl: mergedOptions.fetch_format,
    e: mergedOptions.effect,
  };

  const transformations = Object.entries(map)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}_${v}`)
    .join(',');

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

export const buildSrcSet = (publicId: string, widths: number[], options: TransformationOptions = {}) => {
  return widths
    .map((w) => `${buildImageUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(', ');
};

// Helper function for responsive images
export const getResponsiveImageUrl = (publicId: string, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium') => {
  const sizes = {
    thumbnail: { width: 150, height: 150, crop: 'fill' },
    small: { width: 250, height: 250, crop: 'fill' },
    medium: { width: 500, height: 500, crop: 'fill' },
    large: { width: 800, height: 800, crop: 'fill' },
  };

  return buildImageUrl(publicId, sizes[size]);
}; 