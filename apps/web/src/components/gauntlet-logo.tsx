import React from 'react';
import Image from 'next/image';

interface GauntletLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function GauntletLogo({ size = 'md', className = '' }: GauntletLogoProps) {
  return (
    <div className={`${sizeClasses[size]} ${className} flex-shrink-0 relative`}>
      <Image src='/gauntlet_logo.svg' alt='The Gauntlet Logo' layout='fill' objectFit='contain' />
    </div>
  );
}
