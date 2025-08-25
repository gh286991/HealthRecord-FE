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

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['tomminio-api.zeabur.app'],
  },
};

// 使用類型斷言來解決 next-pwa 版本不兼容問題
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withNextIntl(withPWA(nextConfig as any));
