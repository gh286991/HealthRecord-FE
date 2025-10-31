"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { tokenUtils } from "@/lib/api";

type Props = { isLoggedInSSR?: boolean };

export default function HomeCta({ isLoggedInSSR = false }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(isLoggedInSSR);

  useEffect(() => {
    try {
      setIsLoggedIn(tokenUtils.isLoggedIn());
    } catch {}
  }, []);

  return (
    <div className="mt-3 flex [animation-delay:180ms]">
      {isLoggedIn ? (
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm sm:text-base text-white hover:bg-orange-600 transition-colors"
        >
          前往儀表板
        </Link>
      ) : (
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm sm:text-base text-white hover:bg-orange-600 transition-colors"
        >
          立即開始
        </Link>
      )}
    </div>
  );
}

