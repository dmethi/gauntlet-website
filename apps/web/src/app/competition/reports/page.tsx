'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Container, PageHeader } from '@gauntlet/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, ChevronRight, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportListItem {
  title: string;
  href: string;
  date: string; // ISO
  week: number;
  season: number;
  tags: string[];
  status: 'success' | 'partial' | 'failed';
  description?: string;
}

interface ReportsResponse {
  success: boolean;
  count: number;
  reports: ReportListItem[];
}

const fetchReports = async (): Promise<ReportsResponse> => {
  const response = await fetch('/api/reports/list');
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
};

const getStatusBadge = (status: 'success' | 'partial' | 'failed') => {
  const configs = {
    success: { variant: 'default' as const, label: 'Complete' },
    partial: { variant: 'secondary' as const, label: 'Partial' },
    failed: { variant: 'destructive' as const, label: 'Failed' },
  };

  const config = configs[status] || configs.success;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function ReportsFeedPage() {
  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<ReportsResponse>({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  const reports = reportsData?.reports || [];

  if (isLoading) {
    return (
      <Container className="py-8">
        <PageHeader title="Reports" subtitle="Weekly recaps and analysis" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <PageHeader title="Reports" subtitle="Weekly recaps and analysis" />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load reports. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (reports.length === 0) {
    return (
      <Container className="py-8">
        <PageHeader title="Reports" subtitle="Weekly recaps and analysis" />
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground">
              Reports will be automatically generated each week once the season starts.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Reports"
        subtitle={`${reports.length} weekly recap${reports.length !== 1 ? 's' : ''} and analysis`}
      />

      <div className="space-y-4">
        {reports.map((report, index) => (
          <Card key={report.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
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
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {report.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href={report.href}
                  className="inline-flex items-center text-primary hover:underline font-medium"
                >
                  Read full report <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
                <div className="text-xs text-muted-foreground">
                  Week {report.week} • {report.season} Season
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
