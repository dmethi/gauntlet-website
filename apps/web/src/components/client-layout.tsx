'use client';

import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import { SidebarTeam } from '@gauntlet/types';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<SidebarTeam[]>([]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch('/api/league/teams');
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    }
    fetchTeams();
  }, []);

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
      <div className='flex h-screen'>
        <Sidebar teams={teams} />
        <main className='flex-1 overflow-auto bg-background'>{children}</main>
      </div>
    </ThemeProvider>
  );
}
