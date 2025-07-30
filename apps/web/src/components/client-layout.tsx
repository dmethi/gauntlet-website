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
        console.log('[ClientLayout] Fetching teams from /api/league/teams');
        const res = await fetch('/api/league/teams');
        console.log(`[ClientLayout] Received response with status: ${res.status}`);
        if (res.ok) {
          const data = await res.json();
          console.log('[ClientLayout] Parsed teams data:', data);
          setTeams(data);
        } else {
          console.error('[ClientLayout] Failed to fetch teams:', res.statusText);
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
