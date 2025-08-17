'use client';

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const styles: Record<Variant, string> = {
    primary: 'bg-[#0A84FF] text-white hover:bg-[#0A7AFF] focus-visible:ring-[#0A84FF]',
    secondary:
      'bg-white text-[#0A84FF] border border-[#DCE1E7] hover:bg-[#F5F7FA] focus-visible:ring-[#0A84FF]',
    ghost: 'text-[#0A84FF] hover:bg-[#F5F7FA] focus-visible:ring-[#0A84FF]',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}


