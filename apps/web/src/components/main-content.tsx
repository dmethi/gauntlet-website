import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { MobileMenuButton } from './sidebar';

interface MainContentProps {
  children: React.ReactNode;
  onMobileMenuToggle?: () => void;
}

export function MainContent({ children, onMobileMenuToggle }: MainContentProps) {
  return (
    <div className='flex-1 flex flex-col min-h-0 h-full overflow-hidden'>
      {/* Top Header - Simplified */}
      <header className='h-14 border-b border-border flex items-center justify-between px-4 bg-background flex-shrink-0'>
        <div className='flex items-center gap-4'>
          {/* Mobile Menu Button */}
          {onMobileMenuToggle && <MobileMenuButton onClick={onMobileMenuToggle} />}

          <h2 className='text-foreground font-semibold font-avenir text-sm lg:text-base'>
            Dashboard
          </h2>
        </div>

        <div className='flex items-center'>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area - Scrollable, fills remaining space */}
      <main className='flex-1 overflow-y-auto overflow-x-hidden min-h-0'>{children}</main>
    </div>
  );
}
