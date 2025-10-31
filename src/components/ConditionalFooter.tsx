'use client';

import { usePathname } from 'next/navigation';
import AppFooter from '@/components/AppFooter';
import { BRAND_NAME } from '@/config/brand';

// On auth pages, show a simplified footer that uses the same background color
// as the form area to avoid visual break while still keeping a footer.
const AUTH_PREFIXES = ['/login', '/register'];

function SimpleAuthFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-xs text-gray-500">© {year} {BRAND_NAME}</p>
      </div>
    </footer>
  );
}

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAuth = AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isAuth) return <SimpleAuthFooter />;
  return <AppFooter />;
}
