// 圖片相關工具函數

/**
 * 格式化圖片URL，確保有正確的協議前綴
 */
export function formatImageUrl(url: string): string {
  if (!url) return '';
  
  // 如果已經是完整的URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是data URL（本地預覽），直接返回
  if (url.startsWith('data:')) {
    return url;
  }
  
  // 如果是相對路徑或不完整的URL，加上https://前綴
  return `https://${url}`;
}

/**
 * 驗證圖片URL是否有效
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(formatImageUrl(url));
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全載入圖片的React props
 */
export function getSafeImageProps(url: string) {
  return {
    src: formatImageUrl(url),
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.error('圖片載入失敗:', url);
      // 隱藏失敗的圖片
      (e.target as HTMLImageElement).style.display = 'none';
    },
  };
}