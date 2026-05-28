'use client';

import React, { Suspense } from 'react';
import { BarChart3, Home, Menu, Scroll, Star, Swords, X } from 'lucide-react';
import { GauntletLogo } from './gauntlet-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

const navigationItems = [
  { name: 'Competition', icon: Home, href: '/competition' },
  { name: 'Stats Hub', icon: BarChart3, href: '/stats' },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  teams?: {
    id: string;
    name: string;
    owner: string;
  }[];
  isLoading?: boolean;
  isError?: boolean;
}

export const Sidebar = ({
  isMobileOpen = false,
  onMobileToggle,
  teams = [],
  isLoading,
  isError,
}: SidebarProps) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-card border-r border-border flex-col h-full">
        <SidebarContent teams={teams} isLoading={isLoading} isError={isError} />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onMobileToggle} />
      )}

      {/* Mobile Drawer */}
      <div
        className={`
          lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <GauntletLogo size="md" />
            <div>
              <h2 className="font-bold text-card-foreground font-geizer text-sm tracking-widest">
                THE GAUNTLET
              </h2>
              <p className="text-xs text-muted-foreground font-avenir">High-Stakes Fantasy</p>
            </div>
          </div>
          <button
            onClick={onMobileToggle}
            className="p-2 hover:bg-muted rounded-md transition-colors touch-target"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <SidebarNavigation
            onItemClick={onMobileToggle}
            teams={teams}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({
  teams,
  isLoading,
  isError,
}: {
  teams?: SidebarProps['teams'];
  isLoading?: boolean;
  isError?: boolean;
}) => {
  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <GauntletLogo size="md" />
          <div>
            <h2 className="font-bold text-card-foreground font-geizer tracking-widest">
              THE GAUNTLET
            </h2>
            <p className="text-xs text-muted-foreground font-avenir">High-Stakes Fantasy</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <SidebarNavigation teams={teams} isLoading={isLoading} isError={isError} />
      </nav>
    </>
  );
};

// Create a separate component that uses useSearchParams
const SidebarNavigationWithSearchParams = ({
  onItemClick,
  teams: _teams,
  isLoading: _isLoading,
  isError: _isError,
}: {
  onItemClick?: () => void;
  teams?: SidebarProps['teams'];
  isLoading?: boolean;
  isError?: boolean;
}) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {/* Competition */}
      {navigationItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
              isActive
                ? 'bg-gauntlet-crimson text-white shadow-sm'
                : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
            } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110" />
            <span className="flex-1 text-left">{item.name}</span>
          </Link>
        );
      })}

      {/* Matchups */}
      <Link
        href="/matchups"
        onClick={onItemClick}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
          pathname.startsWith('/matchups')
            ? 'bg-gauntlet-crimson text-white shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
        } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
      >
        <Swords className="h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110" />
        <span className="flex-1 text-left">Matchups</span>
      </Link>

      {/* Hall of Fame */}
      <Link
        href="/hall-of-fame-enhanced"
        onClick={onItemClick}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
          pathname === '/hall-of-fame-enhanced'
            ? 'bg-gauntlet-crimson text-white shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
        } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
      >
        <Star className="h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110" />
        <span className="flex-1 text-left">Hall of Fame</span>
      </Link>

      {/* Draft Analysis */}
      <Link
        href="/draft/analysis"
        onClick={onItemClick}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
          pathname === '/draft/analysis'
            ? 'bg-gauntlet-crimson text-white shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
        } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
      >
        <BarChart3 className="h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110" />
        <span className="flex-1 text-left">Draft Analysis</span>
      </Link>

      {/* Transaction Analysis */}

      {/* Year in Review */}
      <Link
        href="/year-in-review"
        onClick={onItemClick}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
          pathname === '/year-in-review'
            ? 'bg-gauntlet-crimson text-white shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
        }`}
      >
        <Scroll className="h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110" />
        <span className="flex-1 text-left">Year in Review</span>
      </Link>

      {/* Theme Toggle */}
      <div className="pt-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

// Wrapper component with Suspense boundary
const SidebarNavigation = (props: {
  onItemClick?: () => void;
  teams?: SidebarProps['teams'];
  isLoading?: boolean;
  isError?: boolean;
}) => {
  return (
    <Suspense
      fallback={
        <div className="space-y-1">
          {/* Loading skeleton for navigation */}
          <div className="px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse" />
          <div className="px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse" />
          <div className="px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse" />
          <div className="px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse" />
        </div>
      }
    >
      <SidebarNavigationWithSearchParams {...props} />
    </Suspense>
  );
};

// Mobile Menu Button Component
export const MobileMenuButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-muted rounded-md transition-colors touch-target"
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5 text-foreground" />
    </button>
  );
};
