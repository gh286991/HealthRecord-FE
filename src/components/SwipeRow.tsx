"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

type SwipeRowProps = {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  deleteText?: string;
  deleteWidth?: number; // px
  editText?: string;
  editWidth?: number; // px
  className?: string;
};

// A lightweight left-swipe row for mobile and desktop
export default function SwipeRow({
  children,
  onDelete,
  onEdit,
  deleteText = "刪除",
  deleteWidth = 88,
  editText = "編輯",
  editWidth = 88,
  className,
}: SwipeRowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number | null>(null);
  const currentXRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const [offset, setOffset] = useState(0);

  const minLeft = useMemo(() => -Math.abs(deleteWidth), [deleteWidth]);
  const maxRight = useMemo(() => Math.abs(editWidth), [editWidth]);

  const handleStart = useCallback((clientX: number) => {
    startXRef.current = clientX - currentXRef.current;
    isDraggingRef.current = true;
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    const delta = clientX - startXRef.current;
    const next = Math.max(minLeft - 24, Math.min(maxRight + 24, delta));
    currentXRef.current = next;
    setOffset(next);
  }, [minLeft, maxRight]);

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    // snap logic
    let finalOffset = 0;
    if (offset < minLeft * 0.4) {
      finalOffset = minLeft; // open delete (left)
    } else if (offset > maxRight * 0.4) {
      finalOffset = maxRight; // open edit (right)
    }
    currentXRef.current = finalOffset;
    setOffset(finalOffset);
  }, [minLeft, maxRight, offset]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);

      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [minLeft, maxRight, offset, handleStart, handleMove, handleEnd]);

  return (
    <div className={className} ref={containerRef} style={{ position: "relative", overflow: "hidden" }}>
      {/* Left action: Edit */}
      {onEdit && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: editWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#3b82f6",
            color: "white",
            pointerEvents: offset === 0 ? "none" : "auto",
            userSelect: "none",
          }}
        >
          <button
            type="button"
            onClick={onEdit}
            style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}
          >
            {editText}
          </button>
        </div>
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: deleteWidth,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ef4444",
          color: "white",
          pointerEvents: offset === 0 ? "none" : "auto",
          userSelect: "none",
        }}
      >
        <button
          type="button"
          onClick={onDelete}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
          }}
        >
          {deleteText}
        </button>
      </div>

      <div
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: isDraggingRef.current ? "none" : "transform 180ms ease",
          willChange: "transform",
          background: "white",
        }}
      >
        {children}
      </div>
    </div>
  );
}
