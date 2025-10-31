"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isProtectedPath } from "@/lib/protectedRoutes";

export default function AppFooter() {
  // 僅在客戶端掛載後再決定是否渲染，避免 SSR 初次渲染誤判造成閃爍
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pathname = usePathname();

  const isHome = pathname === "/";
  const isFunctionalAppPage = useMemo(() => isProtectedPath(pathname), [pathname]);

  if (!mounted) return null;
  // 規則：除了首頁與保護頁，其餘頁面顯示簡易 Footer（不分登入狀態）
  if (isHome || isFunctionalAppPage) return null;

  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>© {year} {BRAND_NAME}</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy/latest" className="hover:text-gray-900">隱私權</Link>
            <Link href="/terms/latest" className="hover:text-gray-900">服務條款</Link>
            <Link href="/cookies" className="hover:text-gray-900">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { BRAND_NAME } from "@/config/brand";
