'use client';

import Link from 'next/link';
import { Container, PageHeader } from '@gauntlet/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, Tags } from 'lucide-react';

interface ReportListItem {
  title: string;
  href: string;
  date: string; // ISO
  tags: string[];
}

const reports: ReportListItem[] = [
  {
    title: 'Week 1 Report — 2025',
    href: '/competition/reports/2025/week-1',
    date: new Date().toISOString(),
    tags: ['Week 1', 'Draft Analysis', 'AFC', 'NFC'],
  },
];

export default function ReportsFeedPage() {
  return (
    <Container className='py-8'>
      <PageHeader title='Reports' subtitle='Weekly recaps and analysis' />

      <div className='space-y-4'>
        {reports.map(report => (
          <Card key={report.href} className='hover:shadow-md transition-shadow'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='font-geizer'>{report.title}</CardTitle>
                  <CardDescription className='mt-1 flex items-center gap-2'>
                    <Calendar className='h-3 w-3' />
                    {new Date(report.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className='flex gap-2 flex-wrap'>
                  <Badge variant='outline' className='flex items-center gap-1'>
                    <Tags className='h-3 w-3' />
                    Feed
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2 mt-1'>
                {report.tags.map(tag => (
                  <Badge key={tag} variant='secondary'>
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className='mt-4'>
                <Link
                  href={report.href}
                  className='inline-flex items-center text-primary hover:underline'
                >
                  Read report <ChevronRight className='h-4 w-4 ml-1' />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
