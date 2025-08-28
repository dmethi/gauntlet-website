'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { CheckSquare, ChevronDown, ChevronRight, Home, Menu, Trophy, Users, X } from 'lucide-react';
import { GauntletLogo } from './gauntlet-logo';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

const navigationItems = [{ name: 'Competition', icon: Home, href: '/competition' }];

const leagues = [
  { id: '1263744209295245312', name: 'Gauntlet AFC', shortName: 'AFC' },
  { id: '1263740549504962561', name: 'Gauntlet NFC', shortName: 'NFC' },
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

export function Sidebar({
  isMobileOpen = false,
  onMobileToggle,
  teams = [],
  isLoading,
  isError,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className='hidden lg:flex w-64 bg-card border-r border-border flex-col h-full'>
        <SidebarContent teams={teams} isLoading={isLoading} isError={isError} />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className='lg:hidden fixed inset-0 bg-black/50 z-40' onClick={onMobileToggle} />
      )}

      {/* Mobile Drawer */}
      <div
        className={`
          lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className='flex items-center justify-between p-4 border-b border-border flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <GauntletLogo size='md' />
            <div>
              <h2 className='font-bold text-card-foreground font-geizer text-sm tracking-wide'>
                THE GAUNTLET
              </h2>
              <p className='text-xs text-muted-foreground font-avenir'>High-Stakes Fantasy</p>
            </div>
          </div>
          <button
            onClick={onMobileToggle}
            className='p-2 hover:bg-muted rounded-md transition-colors touch-target'
            aria-label='Close navigation'
          >
            <X className='h-5 w-5 text-muted-foreground' />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className='flex-1 p-4 overflow-y-auto'>
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
}

function SidebarContent({
  teams,
  isLoading,
  isError,
}: {
  teams?: SidebarProps['teams'];
  isLoading?: boolean;
  isError?: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div className='p-6 border-b border-border flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <GauntletLogo size='md' />
          <div>
            <h2 className='font-bold text-card-foreground font-geizer tracking-wide'>
              THE GAUNTLET
            </h2>
            <p className='text-xs text-muted-foreground font-avenir'>High-Stakes Fantasy</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <SidebarNavigation teams={teams} isLoading={isLoading} isError={isError} />
      </nav>
    </>
  );
}

// Create a separate component that uses useSearchParams
function SidebarNavigationWithSearchParams({
  onItemClick,
  teams: _teams,
  isLoading: _isLoading,
  isError: _isError,
}: {
  onItemClick?: () => void;
  teams?: SidebarProps['teams'];
  isLoading?: boolean;
  isError?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [leaguesExpanded, setLeaguesExpanded] = useState(false);

  // Auto-expand when on league overview page
  useEffect(() => {
    if (pathname === '/league/overview') {
      setLeaguesExpanded(true);
    }
  }, [pathname]);

  return (
    <div className='space-y-1'>
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
            <Icon className='h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110' />
            <span className='flex-1 text-left'>{item.name}</span>
          </Link>
        );
      })}

      {/* Leagues Section */}
      <div>
        <button
          onClick={() => setLeaguesExpanded(!leaguesExpanded)}
          className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left w-full transition-all duration-200 ease ${
            pathname.startsWith('/league/overview')
              ? 'bg-gauntlet-crimson text-white shadow-sm'
              : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
          } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
        >
          <Trophy className='h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110' />
          <span className='flex-1 text-left'>Leagues</span>
          <div className='transition-transform duration-300 origin-center motion-reduce:transition-none'>
            {leaguesExpanded ? (
              <ChevronDown className='h-4 w-4 flex-shrink-0' />
            ) : (
              <ChevronRight className='h-4 w-4 flex-shrink-0' />
            )}
          </div>
        </button>

        <div
          className={`ml-6 overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none ${
            leaguesExpanded ? 'max-h-32 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
          <div className='space-y-1'>
            {leagues.map(league => {
              const currentLeagueId = searchParams.get('leagueId');
              const isLeagueActive =
                pathname === `/league/overview` && currentLeagueId === league.id;

              return (
                <Link
                  key={league.id}
                  href={`/league/overview?leagueId=${league.id}`}
                  onClick={onItemClick}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[36px] text-left transition-all duration-200 ease border ${
                    isLeagueActive
                      ? 'bg-gauntlet-regal-gold/20 text-card-foreground border-gauntlet-regal-gold/30 shadow-sm'
                      : 'text-muted-foreground border-transparent hover:text-card-foreground hover:bg-muted hover:border-border/50'
                  } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
                >
                  <div
                    className={`h-3 w-3 rounded-sm flex-shrink-0 transition-all duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110 ${
                      isLeagueActive ? 'bg-gauntlet-regal-gold shadow-sm' : 'bg-muted-foreground'
                    }`}
                  />
                  <span className='flex-1 text-left font-medium'>{league.shortName}</span>
                  {isLeagueActive && (
                    <div className='h-1.5 w-1.5 rounded-full animate-pulse bg-gauntlet-regal-gold' />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teams */}
      <Link
        href='/teams'
        onClick={onItemClick}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
          pathname === '/teams'
            ? 'bg-gauntlet-crimson text-white shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
        } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
      >
        <Users className='h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110' />
        <span className='flex-1 text-left'>Teams</span>
      </Link>

      {/* TODOs */}
      <Link
        href='/todos'
        onClick={onItemClick}
        className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium font-avenir min-h-[44px] text-left transition-all duration-200 ease ${
          pathname === '/todos'
            ? 'bg-gauntlet-crimson text-white shadow-sm'
            : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
        } @media (hover: hover) and (pointer: fine) { hover:shadow-sm }`}
      >
        <CheckSquare className='h-4 w-4 flex-shrink-0 transition-transform duration-200 ease motion-reduce:group-hover:scale-100 group-hover:scale-110' />
        <span className='flex-1 text-left'>TODOs</span>
      </Link>

      {/* Theme Toggle */}
      <div className='pt-2'>
        <ThemeToggle />
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
function SidebarNavigation(props: {
  onItemClick?: () => void;
  teams?: SidebarProps['teams'];
  isLoading?: boolean;
  isError?: boolean;
}) {
  return (
    <Suspense fallback={
      <div className='space-y-1'>
        {/* Loading skeleton for navigation */}
        <div className='px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse' />
        <div className='px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse' />
        <div className='px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse' />
        <div className='px-3 py-2 rounded-md h-[44px] bg-muted/20 animate-pulse' />
      </div>
    }>
      <SidebarNavigationWithSearchParams {...props} />
    </Suspense>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='lg:hidden p-2 hover:bg-muted rounded-md transition-colors touch-target'
      aria-label='Open navigation menu'
    >
      <Menu className='h-5 w-5 text-foreground' />
    </button>
  );
}
