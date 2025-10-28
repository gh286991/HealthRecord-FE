"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function AppFooter() {
  // 僅在客戶端掛載後再決定是否渲染，避免 SSR 初次渲染誤判造成閃爍
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const token = useSelector((s: RootState) => s.auth.token);
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!mounted) return null;
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
