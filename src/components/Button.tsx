'use client';

import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const styles: Record<Variant, string> = {
    primary: 'bg-[#0A84FF] text-white hover:bg-[#0A7AFF] focus-visible:ring-[#0A84FF]',
    secondary:
      'bg-white text-[#0A84FF] border border-[#DCE1E7] hover:bg-[#F5F7FA] focus-visible:ring-[#0A84FF]',
    ghost: 'text-[#0A84FF] hover:bg-[#F5F7FA] focus-visible:ring-[#0A84FF]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
  };

  return (
    <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}


