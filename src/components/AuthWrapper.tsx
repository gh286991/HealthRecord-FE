'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { tokenUtils } from '@/lib/api';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoggedIn = tokenUtils.isLoggedIn();
    const publicPrefixes = [
      '/',
      '/login',
      '/register',
      '/auth/callback',
      '/feedback',
      // 法務頁面：所有版本與 latest 皆開放
      '/privacy',
      '/terms',
      '/cookies',
      '/about',
    ];
    const isPublic = publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));

    if (!isLoggedIn && !isPublic) {
      router.push('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
