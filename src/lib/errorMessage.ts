export const extractErrorMessage = (e: unknown, fallback = '發生錯誤，請稍後再試'): string => {
  try {
    if (e && typeof e === 'object') {
      // axios 風格: err.response.data.message 或 data 為字串
      const resp = (e as { response?: unknown }).response;
      if (resp && typeof resp === 'object') {
        const data = (resp as { data?: unknown }).data;
        if (typeof data === 'string' && data) return data;
        if (
          data &&
          typeof (data as { message?: unknown }).message === 'string' &&
          (data as { message?: string }).message
        )
          return (data as { message: string }).message;
      }
      // RTK Query 風格: { status, data }
      if ('status' in e && 'data' in e) {
        const data = (e as { data?: unknown }).data;
        if (typeof data === 'string' && data) return data;
        if (
          data &&
          typeof (data as { message?: unknown }).message === 'string' &&
          (data as { message?: string }).message
        )
          return (data as { message: string }).message;
      }
      // 一般 Error
      if (e instanceof Error && e.message) {
        return e.message;
      }
    }
  } catch {}
  return fallback;
};

