'use client';

import React from 'react';
import { GauntletLogo } from '@/components/gauntlet-logo';
import { colors } from '@/lib/colors';
import {
  Calendar,
  TrendingUp,
  Users,
  Target,
  Trophy,
  Clock,
  Star,
  ChevronRight,
  Palette,
  Sun,
  Moon,
} from 'lucide-react';

const recentItems = [
  {
    id: 'TG-1001',
    title: 'Week 12 Lineup Optimization Required',
    status: 'High Priority',
    assignee: 'DM',
    updated: '2 hours ago',
    priority: 'high',
  },
  {
    id: 'TG-1002',
    title: 'Waiver Wire Claims Due Tonight',
    status: 'In Progress',
    assignee: 'Team Manager',
    updated: '4 hours ago',
    priority: 'medium',
  },
  {
    id: 'TG-1003',
    title: 'Trade Proposal: CMC for Kupp + Draft Pick',
    status: 'Under Review',
    assignee: 'League Commissioner',
    updated: '6 hours ago',
    priority: 'low',
  },
  {
    id: 'TG-1004',
    title: 'Playoff Bracket Seeding Analysis',
    status: 'Completed',
    assignee: 'Analytics Team',
    updated: '1 day ago',
    priority: 'medium',
  },
];

const quickActions = [
  { icon: Users, label: 'Set Lineup', color: 'text-gauntlet-crimson' },
  { icon: Target, label: 'Add Player', color: 'text-gauntlet-regal-gold' },
  { icon: Trophy, label: 'View Standings', color: 'text-gauntlet-battle' },
  { icon: TrendingUp, label: 'Analytics', color: 'text-gauntlet-warm-gold' },
];

const teamNames = [
  'Crimson Crusaders',
  'Golden Lions',
  'Steel Wolves',
  'Bronze Bears',
  'Olive Eagles',
  'Indigo Knights',
  'Peru Panthers',
  'Slate Stallions',
  'Magenta Mavericks',
  'Amber Arrows',
  'Sapphire Spartans',
  'Sienna Sentinels',
];

export default function DashboardPage() {
  return (
    <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 no-overflow'>
      {/* Welcome Section with Brand Showcase */}
      <div className='space-y-4 no-overflow'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-4 min-w-0'>
            <GauntletLogo size='xl' className='hidden sm:block' />
            <div className='min-w-0'>
              <div className='flex items-center gap-3 mb-2'>
                <GauntletLogo size='lg' className='sm:hidden' />
                <h1 className='text-responsive-xl font-bold text-foreground font-geizer tracking-wider'>
                  Welcome to The Gauntlet
                </h1>
              </div>
              <p className='text-muted-foreground font-avenir text-responsive-sm'>
                Medieval fantasy football with balanced red & gold aesthetics
              </p>
            </div>
          </div>
          <div className='hidden sm:flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0'>
            <span className='flex items-center gap-1'>
              <span className='block w-2 h-2 bg-primary rounded-full'></span>
              Crimson Red Primary
            </span>
            <span className='flex items-center gap-1'>
              <span className='block w-2 h-2 bg-secondary rounded-full'></span>
              Regal Gold Co-Primary
            </span>
          </div>
        </div>

        {/* Brand Color Showcase */}
        <div className='mobile-card no-overflow'>
          <div className='flex items-center gap-2 mb-4'>
            <Palette className='h-5 w-5 text-primary flex-shrink-0' />
            <h2 className='text-responsive-base font-semibold text-card-foreground font-avenir min-w-0'>
              Linear-Style Dark Mode & Team Colors
            </h2>
          </div>

          {/* Core Colors */}
          <div className='space-y-4 no-overflow'>
            <div className='no-overflow'>
              <h3 className='text-sm font-medium text-muted-foreground mb-2 font-avenir'>
                Core Palette (Burgundy & Gold Balance)
              </h3>
              <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 no-overflow'>
                {Object.entries(colors.core).map(([name, hex]) => (
                  <div key={name} className='text-center min-w-0 no-overflow'>
                    <div
                      className='w-full h-10 sm:h-12 rounded-md border border-border mb-1'
                      style={{ backgroundColor: hex }}
                    />
                    <div className='text-xs text-muted-foreground font-mono truncate'>{name}</div>
                    <div className='text-xs text-muted-foreground font-mono hidden sm:block truncate'>
                      {hex}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Visualization Palette */}
            <div className='no-overflow'>
              <h3 className='text-sm font-medium text-muted-foreground mb-2 font-avenir'>
                12-Team Visualization Palette (Distinct Colors for Fantasy Leagues)
              </h3>
              <div className='grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1 sm:gap-2 no-overflow'>
                {colors.rainbow.map((hex, index) => (
                  <div key={index} className='text-center min-w-0 no-overflow'>
                    <div
                      className='w-full h-8 sm:h-10 rounded border border-border mb-1'
                      style={{ backgroundColor: hex }}
                    />
                    <div className='text-xs text-muted-foreground font-avenir hidden sm:block truncate'>
                      {teamNames[index]}
                    </div>
                    <div className='text-xs text-muted-foreground font-mono hidden lg:block truncate'>
                      {hex}
                    </div>
                  </div>
                ))}
              </div>
              <p className='text-xs text-muted-foreground mt-2 font-avenir'>
                Maximum visual distinction for 12 team fantasy leagues
              </p>
            </div>

            {/* RdYlGn Scale */}
            <div className='no-overflow'>
              <h3 className='text-sm font-medium text-muted-foreground mb-2 font-avenir'>
                Performance Scale (Red-Yellow-Green)
              </h3>
              <div className='grid grid-cols-11 gap-1 no-overflow'>
                {colors.rdylgn.map((hex, index) => (
                  <div key={index} className='text-center min-w-0 no-overflow'>
                    <div
                      className='w-full h-6 sm:h-8 rounded border border-border'
                      style={{ backgroundColor: hex }}
                    />
                    <div className='text-xs text-muted-foreground font-mono mt-1 hidden sm:block'>
                      {index}
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex justify-between text-xs text-muted-foreground mt-1 font-avenir'>
                <span>Worst Performance</span>
                <span>Best Performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-overflow'>
        {quickActions.map((action, index) => (
          <button
            key={index}
            className='mobile-card hover:bg-card/80 text-left transition-colors group touch-target no-overflow'
          >
            <action.icon
              className={`h-5 w-5 sm:h-6 sm:w-6 mb-2 ${action.color} group-hover:scale-110 transition-transform flex-shrink-0`}
            />
            <div className='text-sm font-medium text-card-foreground font-avenir truncate'>
              {action.label}
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className='mobile-card no-overflow'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-responsive-base font-semibold text-card-foreground font-avenir min-w-0'>
            Recent Activity
          </h2>
          <button className='text-sm text-primary hover:text-primary/80 font-avenir touch-target flex-shrink-0'>
            View All
          </button>
        </div>

        <div className='space-y-3 no-overflow'>
          {recentItems.map(item => (
            <div
              key={item.id}
              className='flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors gap-3 no-overflow'
            >
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.priority === 'high'
                      ? 'bg-destructive'
                      : item.priority === 'medium'
                        ? 'bg-accent'
                        : 'bg-muted-foreground'
                  }`}
                />
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-medium text-card-foreground font-avenir truncate'>
                    {item.title}
                  </div>
                  <div className='text-xs text-muted-foreground truncate'>
                    {item.assignee} • {item.updated}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2 flex-shrink-0'>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                    item.status === 'Completed'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : item.status === 'High Priority'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.status}
                </span>
                <ChevronRight className='h-4 w-4 text-muted-foreground hidden sm:block' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className='mobile-card no-overflow'>
        <h2 className='text-responsive-base font-semibold text-card-foreground mb-4 font-avenir'>
          Season Performance Trends
        </h2>
        <div className='h-40 sm:h-48 bg-muted/20 rounded-md flex items-center justify-center no-overflow'>
          <div className='text-center'>
            <TrendingUp className='h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2' />
            <p className='text-sm text-muted-foreground font-avenir'>
              Performance visualization will be rendered here
            </p>
            <p className='text-xs text-muted-foreground mt-1 hidden sm:block'>
              Using team colors & RdYlGn scale for data-driven insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
