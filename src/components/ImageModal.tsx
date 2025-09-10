'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export default function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-4xl max-h-screen p-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <Image 
          src={imageUrl}
          alt="Enlarged view"
          layout="fill"
          objectFit="contain"
        />
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
