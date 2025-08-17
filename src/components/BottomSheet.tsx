'use client';

import React from 'react';

export default function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white shadow-[0_-10px_30px_rgba(0,0,0,.08)] p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="mx-auto h-1 w-10 rounded bg-gray-200 mb-3" />
        {children}
      </div>
    </div>
  );
}


