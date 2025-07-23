import React from 'react';
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
  Database
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', icon: Home, href: '/', active: true },
  { name: 'My Teams', icon: Users, href: '/teams' },
  { name: 'Leagues', icon: Trophy, href: '/leagues' },
  { name: 'Players', icon: Target, href: '/players' },
  { name: 'Matchups', icon: Calendar, href: '/matchups' },
  { name: 'Simulations', icon: Zap, href: '/simulations' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Trends', icon: TrendingUp, href: '/trends' },
  { name: 'Data Feed', icon: Database, href: '/data' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gauntlet-crimson to-gauntlet-battle rounded-lg flex items-center justify-center">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-card-foreground font-geizer">
              THE GAUNTLET
            </h2>
            <p className="text-xs text-muted-foreground font-avenir">
              Medieval Fantasy
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors font-avenir ${
                item.active
                  ? 'bg-gauntlet-crimson text-white shadow-sm' // Balanced crimson instead of bright red
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-6 h-6 bg-gauntlet-regal-gold rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white font-avenir">DM</span>
          </div>
          <div className="text-sm">
            <div className="font-medium text-card-foreground font-avenir">Dhruv M.</div>
            <div className="text-xs text-muted-foreground">League Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}
