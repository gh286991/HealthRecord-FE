import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 使用動態 require 避免 ESLint 錯誤
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/, 
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

// 從環境變數取得 MinIO 對外網域，並做基本正規化
const minioFromEnv = process.env.NEXT_PUBLIC_MINIO_DOMAIN
  || process.env.NEXT_PUBLIC_MINIO_ENDPOINT
  || process.env.MINIO_END_POINT;

function normalizeDomain(domain?: string): string | undefined {
  if (!domain) return undefined;
  return domain.replace(/^https?:\/\//, '').split('/')[0];
}

const allowedDomains = ['tomminio-api.zeabur.app'];
const normalizedMinio = normalizeDomain(minioFromEnv);
if (normalizedMinio && !allowedDomains.includes(normalizedMinio)) {
  allowedDomains.push(normalizedMinio);
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: allowedDomains,
    formats: ['image/avif', 'image/webp'],
  },
};

// 使用類型斷言來解決 next-pwa 版本不兼容問題
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withNextIntl(withPWA(nextConfig as any));
