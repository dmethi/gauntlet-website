'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Calendar, ChevronRight, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { reportsForSeason, type ReportsResponse } from './report-utils';

interface ReportListProps {
  season: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

const fetchReports = async (): Promise<ReportsResponse> => {
  const response = await fetch('/api/reports/list');
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
};

const getStatusBadge = (status: 'success' | 'partial' | 'failed') => {
  const configs = {
    success: { variant: 'default' as const, label: 'Complete' },
    partial: { variant: 'secondary' as const, label: 'Partial' },
    failed: { variant: 'destructive' as const, label: 'Failed' },
  };
  const config = configs[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const ReportList = ({
  season,
  emptyTitle = 'No weekly recaps yet',
  emptyDescription = 'The first recap will appear here after the week is complete.',
}: ReportListProps) => {
  const { data, isLoading, error } = useQuery<ReportsResponse>({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-label={`Loading ${season} reports`}>
        {[1, 2].map(item => (
          <Card key={item}>
            <CardHeader>
              <Skeleton className="h-6 w-52" />
              <Skeleton className="mt-2 h-4 w-40" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 pt-6 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load reports. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const reports = reportsForSeason(data?.reports ?? [], season);

  if (reports.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="py-8 text-center">
          <FileText className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
          <h3 className="font-semibold">{emptyTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report, index) => (
        <Card key={report.href} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <CardTitle className="font-geizer">{report.title}</CardTitle>
                  {index === 0 && (
                    <Badge variant="default" className="bg-gauntlet-gold text-black">
                      Latest
                    </Badge>
                  )}
                  {report.status !== 'success' && getStatusBadge(report.status)}
                </div>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(report.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {report.description && (
              <p className="mb-4 text-sm text-muted-foreground">{report.description}</p>
            )}
            <div className="mb-4 flex flex-wrap gap-2">
              {report.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={report.href}
                className="inline-flex items-center font-medium text-primary hover:underline"
              >
                Read full report <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
              <div className="text-xs text-muted-foreground">
                Week {report.week} • {report.season} Season
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
