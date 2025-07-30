'use client';

import React, { useState } from 'react';
import {
  Home,
  Target,
  Users,
  BarChart3,
  Settings,
  Trophy,
  Calendar,
  Zap,
  TrendingUp,
  Database,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { GauntletLogo } from './gauntlet-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'Dashboard', icon: Home, href: '/', active: true },
  { name: 'League Overview', icon: Trophy, href: '/league/overview' },
  { name: 'My Teams', icon: Users, href: '/teams' },
  { name: 'Players', icon: Target, href: '/players' },
  { name: 'Matchups', icon: Calendar, href: '/matchups' },
  { name: 'Simulations', icon: Zap, href: '/simulations' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Trends', icon: TrendingUp, href: '/trends' },
  { name: 'Data Feed', icon: Database, href: '/data' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  teams?: {
    id: string;
    name: string;
    owner: string;
  }[];
}

export function Sidebar({ isMobileOpen = false, onMobileToggle, teams = [] }: SidebarProps) {
  console.log('Sidebar received teams:', teams);
  const pathname = usePathname();
  const [isTeamsOpen, setIsTeamsOpen] = useState(true);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className='hidden lg:flex w-64 bg-card border-r border-border flex-col h-full'>
        <SidebarContent teams={teams} />
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
              <p className='text-xs text-muted-foreground font-avenir'>Medieval Fantasy</p>
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
          <SidebarNavigation onItemClick={onMobileToggle} teams={teams} />
        </div>

        {/* Mobile Footer */}
        <div className='p-4 border-t border-border flex-shrink-0'>
          <SidebarFooter />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ teams }: { teams?: SidebarProps['teams'] }) {
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
            <p className='text-xs text-muted-foreground font-avenir'>Medieval Fantasy</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 overflow-y-auto'>
        <SidebarNavigation teams={teams} />
      </nav>

      {/* Footer */}
      <div className='p-4 border-t border-border flex-shrink-0'>
        <SidebarFooter />
      </div>
    </>
  );
}

function SidebarNavigation({
  onItemClick,
  teams,
}: {
  onItemClick?: () => void;
  teams?: SidebarProps['teams'];
}) {
  const pathname = usePathname();
  const [isTeamsOpen, setIsTeamsOpen] = useState(true);

  return (
    <div className='space-y-1'>
      {navigationItems.map(item => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors font-avenir min-h-[44px] text-left ${
              item.active
                ? 'bg-gauntlet-crimson text-white shadow-sm'
                : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
            }`}
          >
            <Icon className='h-4 w-4 flex-shrink-0' />
            <span className='flex-1 text-left'>{item.name}</span>
          </a>
        );
      })}

      {/* Teams Section */}
      {teams && teams.length > 0 && (
        <div className='pt-4'>
          <button
            onClick={() => setIsTeamsOpen(!isTeamsOpen)}
            className='flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors font-avenir min-h-[44px] text-left text-muted-foreground hover:text-card-foreground hover:bg-muted'
          >
            {isTeamsOpen ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
            <span className='flex-1 text-left'>League Teams ({teams.length})</span>
          </button>

          {isTeamsOpen && (
            <div className='ml-4 space-y-1 pt-2'>
              {teams.map(team => {
                console.log('Rendering team:', team);
                return (
                  <Link
                    key={team.id}
                    href={`/team/${team.id}/stats`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors font-avenir min-h-[44px] text-left ${
                      pathname === `/team/${team.id}/stats`
                        ? 'bg-gauntlet-crimson text-white shadow-sm'
                        : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                    }`}
                    onClick={onItemClick}
                  >
                    <Users className='h-4 w-4 flex-shrink-0' />
                    <div>
                      <div>{team.name}</div>
                      <div className='text-xs text-muted-foreground'>{team.owner}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className='flex items-center gap-3 px-3 py-2'>
      <div className='w-8 h-8 bg-gauntlet-regal-gold rounded-full flex items-center justify-center flex-shrink-0'>
        <span className='text-xs font-bold text-white font-avenir'>DM</span>
      </div>
      <div className='text-sm min-w-0 flex-1'>
        <div className='font-medium text-card-foreground font-avenir truncate text-left'>
          Dhruv M.
        </div>
        <div className='text-xs text-muted-foreground truncate text-left'>League Manager</div>
      </div>
    </div>
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
