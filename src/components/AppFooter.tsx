"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import Footer from "@/components/Footer";

export default function AppFooter() {
  const token = useSelector((s: RootState) => s.auth.token);
  // 登入後：完全隱藏 Footer（App 體驗）
  if (token) return null;
  return <Footer />;
}
