'use client';

import React from 'react';

export default function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-[#E9EDF2] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.06)] ${className}`}
    />
  );
}


