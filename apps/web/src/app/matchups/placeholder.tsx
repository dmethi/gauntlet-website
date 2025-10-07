'use client';

import { Container, PageHeader } from '@gauntlet/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function MatchupsPage() {
  return (
    <Container className="py-8">
      <PageHeader title="Matchups" subtitle="Weekly matchups - Coming soon after season starts" />
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No Matchups Yet</h3>
            <p className="text-muted-foreground">
              Matchups will appear here once the 2025 season begins and weekly games are scheduled.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
