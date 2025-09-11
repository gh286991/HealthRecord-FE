"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { LayoutDashboard, Utensils, Dumbbell, User } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { href: "/dashboard", label: "儀表板", Icon: LayoutDashboard },
  { href: "/nutrition", label: "飲食", Icon: Utensils },
  { href: "/workout", label: "運動", Icon: Dumbbell },
  { href: "/profile", label: "我的", Icon: User },
];

export default function MobileTabBar() {
  const token = useSelector((s: RootState) => s.auth.token);
  const pathname = usePathname() || "/";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // 僅在客戶端且登入後渲染，避免 hydration 因瀏覽器擴充或 DOM 插入造成不一致
  if (!mounted || !token) return null;

  return (
    <div suppressHydrationWarning>
      {/* spacer，避免內容被遮擋 */}
      <div className="h-14 sm:hidden" />
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="底部分頁列"
      >
        <ul className="mx-auto max-w-7xl px-4 grid grid-cols-4 h-14">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="flex items-center justify-center">
                <Link
                  href={href}
                  className={`inline-flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                    active ? "text-emerald-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
