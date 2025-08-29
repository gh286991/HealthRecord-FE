// 圖片壓縮工具（僅在瀏覽器端使用）

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0~1，僅對 JPEG/WebP 有效
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
  maxBytes?: number; // 目標上限（非嚴格保證），超過時會嘗試降低品質
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.8,
  mimeType: 'image/webp',
  maxBytes: 1.5 * 1024 * 1024, // 1.5MB
};

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function getTargetSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let targetWidth = width;
  let targetHeight = height;
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(1, widthRatio, heightRatio);
  targetWidth = Math.round(width * ratio);
  targetHeight = Math.round(height * ratio);
  return { width: targetWidth, height: targetHeight };
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas 轉換 Blob 失敗'));
    }, type, quality);
  });
}

function renameFile(original: File, newExt: string): string {
  const name = original.name;
  const dotIndex = name.lastIndexOf('.');
  const base = dotIndex > -1 ? name.slice(0, dotIndex) : name;
  return `${base}.${newExt}`;
}

export async function compressImage(
  file: File,
  options?: CompressOptions,
): Promise<File> {
  const { maxWidth, maxHeight, quality, mimeType, maxBytes } = {
    ...DEFAULT_OPTIONS,
    ...(options || {}),
  };

  // 對於非影像類型，不處理
  if (!file.type.startsWith('image/')) return file;

  // 讀取影像
  const image = await loadImageFromBlob(file);

  // 計算縮放尺寸
  const { width, height } = getTargetSize(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    maxWidth,
    maxHeight,
  );

  // 如果無需縮放且不需要轉檔，直接返回原檔
  const shouldResize = width !== (image.naturalWidth || image.width) || height !== (image.naturalHeight || image.height);
  const shouldTranscode = mimeType !== file.type && (mimeType === 'image/jpeg' || mimeType === 'image/webp');
  if (!shouldResize && !shouldTranscode && file.size <= maxBytes) {
    return file;
  }

  // 建立 canvas 並繪製
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(image, 0, 0, width, height);

  // 嘗試輸出為指定格式與品質，若超出大小則逐步降低品質（最少 0.5）
  let currentQuality = quality;
  let blob = await canvasToBlob(canvas, mimeType, currentQuality);

  // 若仍大於 maxBytes，降低品質重試（最多 3 次）
  let attempts = 0;
  while (blob.size > maxBytes && currentQuality > 0.5 && attempts < 3) {
    currentQuality = Math.max(0.5, currentQuality - 0.15);
    blob = await canvasToBlob(canvas, mimeType, currentQuality);
    attempts += 1;
  }

  // 如果壓縮後大小反而大於原檔，使用原檔（避免變大）
  const finalBlob = blob.size < file.size ? blob : file;

  // 回傳為 File 物件
  const newExt = finalBlob.type.includes('webp')
    ? 'webp'
    : finalBlob.type.includes('jpeg') || finalBlob.type.includes('jpg')
    ? 'jpg'
    : finalBlob.type.includes('png')
    ? 'png'
    : (file.name.split('.').pop() || 'jpg');
  const newName = renameFile(file, newExt);

  return new File([finalBlob], newName, { type: finalBlob.type, lastModified: Date.now() });
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


