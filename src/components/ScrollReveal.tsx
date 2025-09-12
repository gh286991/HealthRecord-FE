"use client";

import { useEffect } from "react";

// Globally enables scroll-reveal animations using data attributes.
// Usage:
// - Add `data-reveal` on any element you want to animate on enter.
// - Add `data-reveal-children` on a container to stagger its direct children.
// - Optional: set style={{ '--reveal-delay': '120ms' } as React.CSSProperties }} on any item.
export default function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add("reveal-in");
            // If you only want once, mark the element with data-reveal-once
            if (el.hasAttribute("data-reveal-once")) {
              observer.unobserve(el);
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    // Individual elements
    const singles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    singles.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });

    // Containers that stagger children
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-children]")
    );
    containers.forEach((container) => {
      const kids = Array.from(container.children) as HTMLElement[];
      kids.forEach((kid, i) => {
        kid.classList.add("reveal");
        if (!kid.style.getPropertyValue("--reveal-delay")) {
          kid.style.setProperty("--reveal-delay", `${i * 80}ms`);
        }
        observer.observe(kid);
      });
    });

    return () => observer.disconnect();
  }, []);

  return null;
}

