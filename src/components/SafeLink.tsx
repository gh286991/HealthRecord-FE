"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type Props = React.PropsWithChildren<
  LinkProps & {
    className?: string;
    title?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }
>;

// A link that works around some in-app browsers (e.g., LINE/FB) occasionally blocking SPA navigation.
// It tries router.push first; if the URL doesn't change shortly, it falls back to location.assign.
export default function SafeLink({ href, children, onClick, ...rest }: Props) {
  const router = useRouter();

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    onClick?.(e);
    // If already prevented elsewhere, respect it
    if (e.defaultPrevented) return;

    try {
      // Prefer SPA navigation
      router.push(href.toString());
      const startPath = window.location.pathname;
      // Fallback if navigation didn't happen quickly (in-app browser quirks)
      setTimeout(() => {
        if (document.visibilityState === "visible" && window.location.pathname === startPath) {
          window.location.assign(href.toString());
        }
      }, 250);
    } catch {
      // Hard navigation fallback
      window.location.assign(href.toString());
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

