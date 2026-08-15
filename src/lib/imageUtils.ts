/**
 * Image processing & compression utility for KMZ Travels CRM.
 * Resizes images using HTML5 Canvas to fit within max dimensions
 * and converts to JPEG Data URL (~100KB-300KB) to safely fit in localStorage.
 */
export const processAndCompressImage = (
  file: File,
  onSuccess: (dataUrl: string) => void,
  onError?: (errorMsg: string) => void,
  maxWidth = 1600,
  maxHeight = 900,
  quality = 0.82
) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    if (onError) onError('Invalid image format. Please select a JPG, JPEG, PNG, WebP, GIF, or SVG file.');
    return;
  }

  // File size check (up to 10MB input file)
  if (file.size > 10 * 1024 * 1024) {
    if (onError) onError('File size exceeds 10MB. Please select a smaller photo.');
    return;
  }

  // SVG or GIF read directly to preserve vector/animation
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) onSuccess(reader.result as string);
    };
    reader.onerror = () => {
      if (onError) onError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (onError) onError('Canvas context unavailable.');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        onSuccess(dataUrl);
      } catch (err) {
        if (onError) onError('Failed to encode compressed image.');
      }
    };
    img.onerror = () => {
      if (onError) onError('Failed to decode image data.');
    };
    if (e.target?.result) {
      img.src = e.target.result as string;
    }
  };
  reader.onerror = () => {
    if (onError) onError('Failed to read image file.');
  };
  reader.readAsDataURL(file);
};
