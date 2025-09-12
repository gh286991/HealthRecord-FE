// 圖片相關工具函數



/**
 * 格式化圖片URL，確保有正確的協議前綴
 */
export function formatImageUrl(url: string): string {
  if (!url) return '';
  
  // 如果已經是完整的URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const u = new URL(url);
      // 針對已知網域，強制升級為 https 避免混合內容被瀏覽器阻擋
      if (u.protocol === 'http:' && u.hostname === 'tomminio-api.zeabur.app') {
        u.protocol = 'https:';
        return u.toString();
      }
    } catch {
      // ignore parse error and fall through
    }
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
  const formatted = formatImageUrl(url);
  const isData = formatted.startsWith('data:');
  const isHttp = formatted.startsWith('http://') || formatted.startsWith('https://');

  return {
    src: formatted,
    ...(isData || !isHttp ? { unoptimized: true } : {}),
    crossOrigin: 'anonymous' as const,
    // 失敗時自動重試 2 次並加上快取破壞參數，避免暫時性或快取問題
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      const tries = Number(img.dataset.retry || '0');
      if (tries < 2) {
        img.dataset.retry = String(tries + 1);
        try {
          const u = new URL(img.src, window.location.href);
          u.searchParams.set('_cb', String(Date.now()));
          img.src = u.toString();
          return;
        } catch {
          // 若 URL 解析失敗，嘗試直接附加查詢參數
          img.src = img.src + (img.src.includes('?') ? '&' : '?') + `_cb=${Date.now()}`;
          return;
        }
      }
      console.error('圖片載入最終失敗:', formatted);
      // 最後才隱藏，避免第一時間就看不到
      img.style.display = 'none';
    },
  };
}
