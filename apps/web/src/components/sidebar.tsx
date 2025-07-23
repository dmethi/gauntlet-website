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
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TG</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg" style={{ fontFamily: 'var(--font-geizer)', letterSpacing: '0.15em' }}>THE GAUNTLET</h1>
            <p className="text-gray-400 text-xs font-avenir">Fantasy Football</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-avenir ${
                  item.active
                    ? 'bg-gray-800 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.name}
              </a>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-gray-300 text-sm font-medium font-avenir">DM</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium font-avenir">Demo User</p>
            <p className="text-gray-400 text-xs font-avenir">demo@gauntlet.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
