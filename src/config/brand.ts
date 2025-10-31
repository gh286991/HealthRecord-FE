export const BRAND_NAME_ZH = '漾飛特';
export const BRAND_NAME_EN = 'YoungFit';
export const BRAND_NAME = `${BRAND_NAME_ZH} ${BRAND_NAME_EN}`; // 漾飛特 YoungFit

export const TAGLINE = '越練越自在，越練越年輕';

export const SUPPORT_EMAIL = 'service@youngfit.app';

// Site URLs and helpers
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030';
export const SITEMAP_URL = `${SITE_URL.replace(/\/$/, '')}/sitemap.xml`;

export const SITE = { email: SUPPORT_EMAIL, url: SITE_URL };
