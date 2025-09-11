"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function AppFooter() {
  const token = useSelector((s: RootState) => s.auth.token);
  const pathname = usePathname();
  const isHome = (pathname || "/") === "/";
  // 登入後：完全隱藏 Footer（App 體驗）
  if (token) return null;
  // 僅在首頁顯示 Footer；手機（sm 以下）隱藏避免佔版
  if (!isHome) return null;
  return (
    <div className="hidden sm:block">
      <Footer />
    </div>
  );
}
