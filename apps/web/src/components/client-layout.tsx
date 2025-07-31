'use client';

import { Sidebar } from '@/components/sidebar';
import { useState } from 'react';
import { SidebarTeam } from '@gauntlet/types';
import { MainContent } from '@/components/main-content';
import { useQuery } from '@tanstack/react-query';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    data: teams,
    isLoading,
    isError,
  } = useQuery<SidebarTeam[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/league/teams');
      if (!res.ok) {
        throw new Error('Failed to fetch teams');
      }
      return res.json();
    },
  });

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className='flex h-screen'>
      <Sidebar
        teams={teams}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={handleMobileMenuToggle}
        isLoading={isLoading}
        isError={isError}
      />
      <MainContent onMobileMenuToggle={handleMobileMenuToggle}>{children}</MainContent>
    </div>
  );
}
