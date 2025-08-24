'use client';

import { Container, PageHeader } from '@gauntlet/ui';
import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HallOfFameRecord {
  id: string;
  week: number;
  value: number;
  rank: number;
  contextData: any;
  achievedAt: string;
  roster: {
    id: number;
    owner: {
      displayName: string;
      username: string;
      avatar?: string;
    } | null;
  };
}

interface HallOfFameCategory {
  name: string;
  displayName: string;
  description?: string;
  groupName: string;
  statType: string;
}

interface CategoryGroup {
  name: string;
  categories: Array<{
    category: HallOfFameCategory;
    top: HallOfFameRecord[];
    bottom: HallOfFameRecord[];
  }>;
}

const DEFAULT_LEAGUE_ID = '997670420490801152';
const DEFAULT_SEASON = '2023';

export default function HallPage() {
  const [hallOfFameData, setHallOfFameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHallOfFame() {
      try {
        const response = await fetch(
          `/api/hall-of-fame/${DEFAULT_LEAGUE_ID}?season=${DEFAULT_SEASON}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch Hall of Fame data');
        }

        setHallOfFameData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching Hall of Fame data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHallOfFame();
  }, []);

  const formatStatValue = (value: number, category: HallOfFameCategory) => {
    if (category.name.includes('points')) {
      return `${value.toFixed(1)} pts`;
    }
    if (category.name.includes('margin')) {
      return `${value.toFixed(1)} pts`;
    }
    if (category.name.includes('concentration_index')) {
      return `${value.toFixed(1)}%`;
    }
    if (category.name.includes('count') || category.name.includes('donuts')) {
      return `${Math.round(value)}`;
    }
    return value.toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container className='py-8'>
        <PageHeader title='Hall of Fame & Shame' subtitle='Season and weekly superlatives' />
        <div className='rounded-md border border-border p-6 bg-card'>
          <div className='animate-pulse space-y-4'>
            <div className='h-4 bg-muted rounded w-1/4'></div>
            <div className='h-4 bg-muted rounded w-1/2'></div>
            <div className='h-4 bg-muted rounded w-1/3'></div>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='py-8'>
        <PageHeader title='Hall of Fame & Shame' subtitle='Season and weekly superlatives' />
        <div className='rounded-md border border-destructive p-6 bg-card text-destructive'>
          Error loading Hall of Fame data: {error}
        </div>
      </Container>
    );
  }

  if (!hallOfFameData?.records) {
    return (
      <Container className='py-8'>
        <PageHeader title='Hall of Fame & Shame' subtitle='Season and weekly superlatives' />
        <div className='rounded-md border border-border p-6 bg-card text-muted-foreground'>
          No Hall of Fame records found.
        </div>
      </Container>
    );
  }

  // Group records by category group and combine positional categories
  const groupedData: Record<string, any[]> = {};
  const positionalCombined: Record<string, { highest?: any; lowest?: any }> = {};

  Object.entries(hallOfFameData.records).forEach(([categoryName, categoryData]: [string, any]) => {
    const groupName = categoryData.category.groupName;

    if (!groupedData[groupName]) {
      groupedData[groupName] = [];
    }

    // Special handling for positional splits - combine highest and lowest
    if (groupName === 'Positional Splits') {
      const positionMatch = categoryName.match(/(highest|lowest)_(.+)/);
      if (positionMatch) {
        const [, type, position] = positionMatch;
        const key = position;

        if (!positionalCombined[key]) {
          positionalCombined[key] = {};
        }

        positionalCombined[key][type as 'highest' | 'lowest'] = { categoryName, ...categoryData };
        return; // Don't add to groupedData yet
      }
    }

    // For non-positional categories, add normally
    if (groupName !== 'Positional Splits' || !categoryName.match(/(highest|lowest)_(.+)/)) {
      groupedData[groupName].push({ categoryName, ...categoryData });
    }
  });

  // Add combined positional categories
  if (groupedData['Positional Splits']) {
    Object.entries(positionalCombined).forEach(([position, data]) => {
      if (data.highest || data.lowest) {
        const displayName = position.charAt(0).toUpperCase() + position.slice(1);
        const combinedCategory = {
          categoryName: `${position}_combined`,
          category: {
            displayName: `${displayName} Performance`,
            description: `Best and worst ${displayName} weekly performances`,
            groupName: 'Positional Splits',
            statType: 'both',
          },
          highest: data.highest,
          lowest: data.lowest,
        };
        groupedData['Positional Splits'].push(combinedCategory);
      }
    });
  }

  return (
    <Container className='py-8'>
      <PageHeader title='Hall of Fame & Shame' subtitle='Season and weekly superlatives' />

      <div className='mb-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{hallOfFameData.meta?.totalRecords || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{hallOfFameData.meta?.totalCategories || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Season</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{DEFAULT_SEASON}</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Team Awards Section */}
      <div className='mb-8'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl font-bold tracking-tight mb-2'>🏆 Weekly Team Awards</h2>
          <p className='text-muted-foreground'>
            The best and worst performances across all categories this season
          </p>
        </div>

        <Tabs defaultValue={Object.keys(groupedData)[0]} className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            {Object.keys(groupedData).map(groupName => (
              <TabsTrigger key={groupName} value={groupName} className='text-xs'>
                {groupName}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedData).map(([groupName, categories]) => (
            <TabsContent key={groupName} value={groupName} className='space-y-6'>
              {categories.map(categoryItem => {
                // Handle combined positional categories
                if (categoryItem.highest || categoryItem.lowest) {
                  const { categoryName, category, highest, lowest } = categoryItem;
                  return (
                    <Card key={categoryName}>
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <div>
                            <CardTitle className='text-lg'>{category.displayName}</CardTitle>
                            {category.description && (
                              <CardDescription>{category.description}</CardDescription>
                            )}
                          </div>
                          <Badge variant='outline' className='ml-2'>
                            {category.statType}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='grid md:grid-cols-2 gap-6'>
                          {/* Hall of Fame Table (Highest) */}
                          {highest?.top?.length > 0 && (
                            <div>
                              <h4 className='font-semibold mb-3 text-green-600 dark:text-green-400 flex items-center gap-2'>
                                🏆 Hall of Fame
                              </h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className='w-12'>#</TableHead>
                                    <TableHead>Team</TableHead>
                                    <TableHead className='text-center'>Score</TableHead>
                                    <TableHead className='w-16'>Week</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {highest.top.map((record: HallOfFameRecord, index: number) => {
                                    return (
                                      <TableRow key={record.id}>
                                        <TableCell className='text-center font-medium'>
                                          {index + 1}
                                        </TableCell>
                                        <TableCell className='font-medium'>
                                          {record.roster.owner?.displayName ||
                                            `Team ${record.roster.id}`}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                          <span className='font-bold text-sm'>
                                            {formatStatValue(record.value, highest.category)}
                                          </span>
                                        </TableCell>
                                        <TableCell className='text-center text-sm text-muted-foreground'>
                                          {record.week}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                          {/* Hall of Shame Table (Lowest) */}
                          {lowest?.bottom?.length > 0 && (
                            <div>
                              <h4 className='font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2'>
                                😞 Hall of Shame
                              </h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className='w-12'>#</TableHead>
                                    <TableHead>Team</TableHead>
                                    <TableHead className='text-center'>Score</TableHead>
                                    <TableHead className='w-16'>Week</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {lowest.bottom.map((record: HallOfFameRecord, index: number) => {
                                    return (
                                      <TableRow key={record.id}>
                                        <TableCell className='text-center font-medium'>
                                          {index + 1}
                                        </TableCell>
                                        <TableCell className='font-medium'>
                                          {record.roster.owner?.displayName ||
                                            `Team ${record.roster.id}`}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                          <span className='font-bold text-sm'>
                                            {formatStatValue(record.value, lowest.category)}
                                          </span>
                                        </TableCell>
                                        <TableCell className='text-center text-sm text-muted-foreground'>
                                          {record.week}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle regular categories
                const { categoryName, category, top, bottom } = categoryItem;
                return (
                  <Card key={categoryName}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='text-lg'>{category.displayName}</CardTitle>
                          {category.description && (
                            <CardDescription>{category.description}</CardDescription>
                          )}
                        </div>
                        <Badge variant='outline' className='ml-2'>
                          {category.statType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid md:grid-cols-2 gap-6'>
                        {/* Hall of Fame Table */}
                        {top?.length > 0 && (
                          <div>
                            <h4 className='font-semibold mb-3 text-green-600 dark:text-green-400 flex items-center gap-2'>
                              🏆 Hall of Fame
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className='w-12'>#</TableHead>
                                  <TableHead>Team</TableHead>
                                  <TableHead className='text-center'>Score</TableHead>
                                  <TableHead className='w-16'>Week</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {top.map((record: HallOfFameRecord, index: number) => {
                                  return (
                                    <TableRow key={record.id}>
                                      <TableCell className='text-center font-medium'>
                                        {index + 1}
                                      </TableCell>
                                      <TableCell className='font-medium'>
                                        {record.roster.owner?.displayName ||
                                          `Team ${record.roster.id}`}
                                      </TableCell>
                                      <TableCell className='text-center'>
                                        <span className='font-bold text-sm'>
                                          {formatStatValue(record.value, category)}
                                        </span>
                                      </TableCell>
                                      <TableCell className='text-center text-sm text-muted-foreground'>
                                        {record.week}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {/* Hall of Shame Table */}
                        {bottom?.length > 0 && (
                          <div>
                            <h4 className='font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2'>
                              😞 Hall of Shame
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className='w-12'>#</TableHead>
                                  <TableHead>Team</TableHead>
                                  <TableHead className='text-center'>Score</TableHead>
                                  <TableHead className='w-16'>Week</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bottom.map((record: HallOfFameRecord, index: number) => {
                                  return (
                                    <TableRow key={record.id}>
                                      <TableCell className='text-center font-medium'>
                                        {index + 1}
                                      </TableCell>
                                      <TableCell className='font-medium'>
                                        {record.roster.owner?.displayName ||
                                          `Team ${record.roster.id}`}
                                      </TableCell>
                                      <TableCell className='text-center'>
                                        <span className='font-bold text-sm'>
                                          {formatStatValue(record.value, category)}
                                        </span>
                                      </TableCell>
                                      <TableCell className='text-center text-sm text-muted-foreground'>
                                        {record.week}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Container>
  );
}
