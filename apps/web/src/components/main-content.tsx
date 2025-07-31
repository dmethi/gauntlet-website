'use client';

import { Menu } from 'lucide-react';

interface MainContentProps {
  children: React.ReactNode;
  onMobileMenuToggle?: () => void;
}

export function MainContent({ children, onMobileMenuToggle }: MainContentProps) {
  return (
    <main className='flex-1 overflow-auto bg-background'>
      <header className='lg:hidden sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
        <button
          onClick={onMobileMenuToggle}
          className='p-2 hover:bg-muted rounded-md transition-colors touch-target -ml-2'
          aria-label='Toggle Navigation'
        >
          <Menu className='h-6 w-6' />
        </button>
      </header>
      <div className='p-4 sm:p-6'>{children}</div>
    </main>
  );
}
