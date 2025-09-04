'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { tokenUtils } from '@/lib/api';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoggedIn = tokenUtils.isLoggedIn();
    const publicPaths = ['/', '/login', '/register'];

    if (!isLoggedIn && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
