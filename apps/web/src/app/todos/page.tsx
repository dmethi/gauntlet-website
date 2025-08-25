'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  CheckCircle,
  Circle,
  Clock,
  Code,
  Database,
  ExternalLink,
  Zap as Lightning,
  Palette,
  Wrench,
  Zap,
} from 'lucide-react';

interface TodoSpec {
  overview: string;
  technicalRequirements: string[];
  dataModels?: string[];
  apiEndpoints?: string[];
  uiComponents?: string[];
  dependencies?: string[];
  acceptanceCriteria: string[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'epic';
  blockers?: string[];
  questions?: string[];
}

// Helper function to create default specs for items that need basic specifications
function createDefaultSpec(title: string, description: string, _category: string): TodoSpec {
  return {
    overview: description || `Implementation of ${title.toLowerCase()}.`,
    technicalRequirements: [`Implement ${title.toLowerCase()}`],
    acceptanceCriteria: [`${title} is fully functional`],
    estimatedComplexity: 'moderate',
  };
}

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  category: 'ui' | 'backend' | 'integration' | 'design' | 'analytics';
  spec: TodoSpec;
}

interface TodoSection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: TodoItem[];
}

const baseWorkTodos: TodoSection = {
  title: 'Base Work',
  description: 'Can be done with current seeded data from past league',
  icon: Wrench,
  items: [
    {
      id: 'chart-color-palette-iteration',
      title: 'Chart color palette iteration',
      description: 'Develop theme-aware chart color palettes for consistent branding',
      status: 'completed',
      priority: 'medium',
      category: 'design',
      spec: {
        overview:
          'Create distinct, theme-aware color palettes for charts that work across light and dark modes while maintaining brand consistency and accessibility.',
        technicalRequirements: [
          'Design separate color palettes for light and dark themes',
          'Implement theme-aware chart color system',
          'Ensure WCAG contrast compliance across all themes',
          'Update all chart components to use new palette system',
          'Test color accessibility for colorblind users',
          'Document color usage guidelines',
        ],
        uiComponents: [
          'Chart color theme system',
          'All recharts components (league-chart.tsx, etc.)',
          'Chart legends and labels',
          'Progress indicators and data visualizations',
        ],
        dependencies: [
          'Brand color palette foundation',
          'Completed light/dark mode system',
          'Tailwind CSS theme configuration',
        ],
        acceptanceCriteria: [
          'Charts display with appropriate colors in both themes',
          'All chart colors meet accessibility contrast requirements',
          'Color palette is consistent across all chart types',
          'Brand colors are properly integrated',
          'Color blind accessibility is maintained',
        ],
        estimatedComplexity: 'moderate',
      },
    },
    {
      id: 'fix-light-dark-mode',
      title: 'Fix light mode / dark mode',
      description: 'Ensure consistent theming across all components',
      status: 'completed',
      priority: 'high',
      category: 'ui',
      spec: {
        overview:
          'The current theme system has inconsistencies across components, especially in chart colors, progress bars, and custom components. Need to audit all components for proper CSS variable usage and ensure seamless theme switching.',
        technicalRequirements: [
          'Audit all components for hardcoded colors',
          'Standardize CSS variable usage across all components',
          'Fix chart theming (recharts integration)',
          'Update custom progress bar and badge colors',
          'Implement theme-aware logo/icon variants',
          'Fix dark mode contrast ratios for accessibility',
        ],
        dataModels: [],
        apiEndpoints: [],
        uiComponents: [
          'ThemeToggle - theme switching component',
          'All chart components (league-chart.tsx, etc.)',
          'Badge variants for different themes',
          'Progress bars and loading indicators',
          'Card and layout components',
        ],
        dependencies: [
          'Tailwind CSS theme configuration',
          'next-themes package',
          'Recharts theme integration',
        ],
        acceptanceCriteria: [
          'All components respect theme switching without page refresh',
          'Charts display correctly in both light and dark modes',
          'No hardcoded colors remain in any component',
          'WCAG contrast requirements met in both themes',
          'Theme preference persists across sessions',
        ],
        estimatedComplexity: 'moderate',
        questions: [],
        // RESOLVED: Use brand palette as guideline, different color palettes for light/dark mode
      },
    },
    {
      id: 'ui-adjustments',
      title: 'UI adjustments (fix charts, fix colors, etc.)',
      description: 'General UI polish and consistency improvements',
      status: 'pending',
      priority: 'low',
      category: 'design',
      spec: {
        overview:
          'General UI polish focusing on chart consistency, color standardization, and component refinement.',
        technicalRequirements: [
          'Standardize chart themes',
          'Fix color inconsistencies',
          'Improve component spacing',
        ],
        acceptanceCriteria: [
          'Charts display consistently',
          'Colors follow design system',
          'Components are properly spaced',
        ],
        estimatedComplexity: 'moderate',
      },
    },
    {
      id: 'animations-touch',
      title: 'Add animations/touch interactions',
      description: 'Implement smooth animations and mobile touch interactions',
      status: 'pending',
      priority: 'medium',
      category: 'ui',
      spec: {
        overview: 'Add smooth animations and touch interactions for better user experience.',
        technicalRequirements: [
          'Add transition animations',
          'Implement touch gestures',
          'Optimize for mobile',
        ],
        acceptanceCriteria: [
          'Smooth transitions between states',
          'Touch-friendly interactions',
          'No performance degradation',
        ],
        estimatedComplexity: 'moderate',
      },
    },
    {
      id: 'connect-sims-engine',
      title: 'Connect to sims engine for win probability',
      description:
        'Integrate with the simulation engine for real-time win probability calculations',
      status: 'pending',
      priority: 'high',
      category: 'integration',
      spec: {
        overview:
          'Integrate the existing Monte Carlo simulation engine (@gauntlet/sim-engine) with the web application to provide real-time win probabilities for matchups. The sim engine already has variance models and matchup simulation logic built with 10 years of historical Sleeper data.',
        technicalRequirements: [
          'Create API endpoints for matchup win probability calculations',
          'Integrate PositionVariance and PlayerVariance models',
          'Implement live game progress tracking for in-game probabilities',
          'Create background job system for pre-calculating probabilities',
          'Add caching layer for simulation results',
          'Implement WebSocket or polling for live updates',
        ],
        dataModels: [
          'PositionVariance - position-level variance constants',
          'PlayerVariance - player-specific variance patterns',
          'ProjectionError - historical projection accuracy',
          'LiveWinProbSample - live probability snapshots',
          'PlayerStats - current projections and actual stats',
          'MatchupSummary - matchup context and results',
        ],
        apiEndpoints: [
          'POST /api/simulations/win-probability - calculate matchup probability',
          'GET /api/simulations/live/[matchupId] - live probability updates',
          'POST /api/simulations/season - full season simulation',
          'GET /api/simulations/cache/[leagueId]/[week] - cached results',
        ],
        uiComponents: [
          'WinProbabilityCard - display win percentages',
          'LiveWinProbabilityTracker - real-time updates',
          'MatchupSimulationModal - detailed simulation breakdown',
          'PlayoffOddsWidget - season-long probabilities',
        ],
        dependencies: [
          '@gauntlet/sim-engine package integration',
          'Background job queue (Bull/Redis or similar)',
          'Real-time communication (WebSocket/Server-Sent Events)',
          'PlayerStats data population',
          'Position and player variance data',
        ],
        acceptanceCriteria: [
          'Win probabilities calculated for all active matchups',
          'Live probability updates during game days',
          'Simulation results cached for performance',
          'Historical accuracy tracking and model validation',
          'Error handling for missing player data',
        ],
        estimatedComplexity: 'complex',
        blockers: [
          'Need current week PlayerStats (projections) populated',
          'Variance models need to be populated with historical data',
        ],
        questions: [],
        // RESOLVED: 10min during games, pre-calculated probabilities, zero simulation detail initially, weekly playoff odds
      },
    },
    {
      id: 'playoff-odds-overview',
      title: 'Add playoff odds to league overview page',
      description: 'Display calculated playoff probabilities on the main overview',
      status: 'pending',
      priority: 'medium',
      category: 'analytics',
      spec: createDefaultSpec(
        'Add playoff odds to league overview page',
        'Display calculated playoff probabilities on the main overview',
        'analytics'
      ),
    },
    {
      id: 'season-sims-playoff-odds',
      title: 'Add season sims for playoff odds',
      description: 'Implement season-long simulations for playoff probability calculations',
      status: 'pending',
      priority: 'medium',
      category: 'analytics',
      spec: createDefaultSpec(
        'Add season sims for playoff odds',
        'Implement season-long simulations for playoff probability calculations',
        'analytics'
      ),
    },
    {
      id: 'data-strategy-optimization',
      title: 'Data strategy optimization',
      description: 'Implement smart data update scheduling and caching strategies',
      status: 'pending',
      priority: 'medium',
      category: 'backend',
      spec: {
        overview:
          'Optimize data fetching and update strategies with intelligent scheduling: 10-minute updates during NFL games, 12-hour updates during the week, and strategic caching to minimize API calls while maintaining data freshness.',
        technicalRequirements: [
          'Implement intelligent update scheduling system',
          'Create game-time detection logic',
          'Build caching layer with expiration strategies',
          'Add data freshness monitoring',
          'Implement selective data updates (only changed data)',
          'Create background job queue for data processing',
          'Add API rate limiting and backoff strategies',
        ],
        dataModels: [
          'DataUpdateLog - track update frequency and success',
          'CacheMetadata - cache expiration and freshness tracking',
          'UpdateSchedule - smart scheduling configuration',
        ],
        dependencies: [
          'NFL game schedule integration',
          'Background job system (Redis/Bull)',
          'Caching infrastructure',
          'Sleeper API rate limiting understanding',
        ],
        acceptanceCriteria: [
          'Data updates every 10 minutes during game times',
          'Data updates every 12 hours during non-game periods',
          'API rate limits are never exceeded',
          'Cache hit ratio above 80% for frequently accessed data',
          'Stale data is automatically refreshed',
        ],
        estimatedComplexity: 'complex',
        blockers: [
          'Need sim engine integration completed first',
          'Requires understanding of NFL game scheduling',
        ],
      },
    },
    {
      id: 'draft-page',
      title: 'Draft page',
      description: 'Create comprehensive draft analysis and visualization page',
      status: 'in_progress',
      priority: 'medium',
      category: 'ui',
      spec: createDefaultSpec(
        'Draft page',
        'Create comprehensive draft analysis and visualization page',
        'ui'
      ),
    },

    {
      id: 'tooltips-explanations',
      title: 'Tooltips for explanations on what advanced analytics mean',
      description: 'Add helpful tooltips to explain complex metrics and analytics',
      status: 'pending',
      priority: 'low',
      category: 'ui',
      spec: createDefaultSpec(
        'Tooltips for explanations on what advanced analytics mean',
        'Add helpful tooltips to explain complex metrics and analytics',
        'ui'
      ),
    },

    {
      id: 'hall-of-fame-shame',
      title: 'Hall of Fame & Shame (STASHED)',
      description:
        'Complete design documented and work stashed for future implementation. See docs/hall-of-fame-design.md',
      status: 'completed',
      priority: 'low',
      category: 'ui',
      spec: createDefaultSpec(
        'Hall of Fame & Shame (STASHED)',
        'Complete design documented and work stashed for future implementation. See docs/hall-of-fame-design.md',
        'ui'
      ),
    },
    {
      id: 'consolidate-sidebar',
      title: 'Consolidate sidebar into just a few tabs',
      description: 'Simplify navigation by reducing sidebar items',
      status: 'pending',
      priority: 'low',
      category: 'ui',
      spec: createDefaultSpec(
        'Consolidate sidebar into just a few tabs',
        'Simplify navigation by reducing sidebar items',
        'ui'
      ),
    },
    {
      id: 'mobile-responsiveness',
      title: 'Implement mobile responsiveness',
      description: 'Ensure all pages work well on mobile devices',
      status: 'completed',
      priority: 'high',
      category: 'ui',
      spec: {
        overview:
          'Comprehensive mobile responsiveness audit and implementation across all pages and components. Focus on touch interactions, readable layouts, and optimal performance on mobile devices.',
        technicalRequirements: [
          'Audit all pages for mobile compatibility',
          'Fix responsive breakpoints and layouts',
          'Optimize touch interactions and gestures',
          'Implement mobile-specific navigation patterns',
          'Optimize chart displays for mobile screens',
          'Fix table responsiveness with proper scrolling',
          'Implement swipe gestures where appropriate',
        ],
        uiComponents: [
          'Mobile navigation drawer',
          'Responsive chart containers',
          'Mobile-optimized tables',
          'Touch-friendly buttons and inputs',
        ],
        acceptanceCriteria: [
          'All pages work perfectly on mobile devices (iOS/Android)',
          'Touch interactions are smooth and intuitive',
          'Charts and tables are readable on small screens',
          'Navigation is mobile-friendly',
          'Performance is optimized for mobile networks',
          'Text is readable without zooming',
        ],
        estimatedComplexity: 'complex',
      },
    },
    {
      id: 'luck-ratings-schedule',
      title: 'Implement luck ratings, schedule comparison',
      description: 'Add advanced analytics for luck-based metrics and schedule strength',
      status: 'pending',
      priority: 'low',
      category: 'analytics',
      spec: createDefaultSpec(
        'Implement luck ratings, schedule comparison',
        'Add advanced analytics for luck-based metrics and schedule strength',
        'analytics'
      ),
    },
    {
      id: 'remove-league-manager',
      title: 'Remove the bottom left league manager thing',
      description: 'Clean up UI by removing unnecessary league manager component',
      status: 'pending',
      priority: 'low',
      category: 'ui',
      spec: createDefaultSpec(
        'Remove the bottom left league manager thing',
        'Clean up UI by removing unnecessary league manager component',
        'ui'
      ),
    },

    {
      id: 'implement-waitlist',
      title: 'Implement waitlist',
      description: 'Create waitlist system for new users',
      status: 'pending',
      priority: 'low',
      category: 'backend',
      spec: createDefaultSpec(
        'Implement waitlist',
        'Create waitlist system for new users',
        'backend'
      ),
    },
  ],
};

const gauntletSpecificTodos: TodoSection = {
  title: 'Gauntlet-Specific Work',
  description: 'Will need temp data in line with new league structure to test UI',
  icon: Zap,
  items: [
    {
      id: 'fix-playoffs-ui',
      title: 'Fix playoffs UI for Gauntlet structure',
      description: 'Build playoffs bracket UI specifically for 6-team Gauntlet playoff format',
      status: 'pending',
      priority: 'medium',
      category: 'ui',
      spec: {
        overview:
          "Design and implement playoffs bracket UI specifically for The Gauntlet's 6-team playoff format with toilet bowl, reseeding, and promotion/relegation implications. This is separate from generic Sleeper leagues since Gauntlet has unique structure.",
        technicalRequirements: [
          'Design 6-team playoff bracket with 2 byes and reseeding',
          'Implement toilet bowl bracket for bottom teams',
          'Add promotion/relegation indicators on playoff results',
          'Create mobile-responsive bracket layout',
          'Add division context to playoff matchups',
          'Implement bracket advancement with Gauntlet rules',
        ],
        dataModels: [
          'League.metadata (Gauntlet division structure)',
          'Division model for tier assignments',
          'MatchupSummary (playoff matchups)',
          'PromotionRelegation tracking',
        ],
        uiComponents: [
          'GauntletPlayoffBracket - 6-team format',
          'ToiletBowlBracket - consolation games',
          'PromotionRelegationIndicator - tier movement',
          'DivisionPlayoffCard - division-aware matchup display',
        ],
        dependencies: [
          'Division system implementation',
          'Gauntlet league structure setup',
          'Promotion/relegation logic',
        ],
        acceptanceCriteria: [
          '6-team playoff bracket displays correctly',
          'Toilet bowl bracket shows consolation games',
          'Promotion/relegation outcomes are clearly indicated',
          'Mobile layout works for complex bracket structure',
          'Division tiers are properly represented',
        ],
        estimatedComplexity: 'complex',
        blockers: [
          'Need division system implemented first',
          'Requires Gauntlet test data structure',
        ],
      },
    },
    {
      id: 'github-actions-data-fetch',
      title: 'Implement GitHub Actions live data collection',
      description: 'Set up automated data pipeline after foundation is complete',
      status: 'pending',
      priority: 'medium',
      category: 'backend',
      spec: {
        overview:
          'Implement automated data collection pipeline using GitHub Actions, scheduled to run after all core functionality is stable. This layers live data on top of the complete foundation.',
        technicalRequirements: [
          'Create GitHub Actions workflow for data ingestion',
          'Set up automated Sleeper API data fetching',
          'Implement simulation runs in CI/CD pipeline',
          'Add error handling and monitoring',
          'Set up secure database connection in Actions',
          'Create notification system for failures',
          'Implement conditional runs (only during season)',
        ],
        dataModels: ['All existing models for data updates'],
        dependencies: [
          'All foundation features completed',
          'Sim engine integration working',
          'Database models stabilized',
          'GitHub Actions runner environment',
          'Database connection secrets',
        ],
        acceptanceCriteria: [
          'Data fetches automatically every 10 minutes during season',
          'Simulations run after successful data updates',
          'Failed runs are monitored and reported',
          'Database is kept in sync with latest data',
          'No rate limit violations on Sleeper API',
        ],
        estimatedComplexity: 'complex',
        blockers: [
          'Wait for foundation Phase 1-2 completion',
          'Need stable sim engine integration',
        ],
      },
    },
    {
      id: 'setup-divisions',
      title: 'Set up divisions',
      description: 'Implement division-based league structure',
      status: 'pending',
      priority: 'high',
      category: 'backend',
      spec: {
        overview:
          'Implement division-based league structure for The Gauntlet multi-tier fantasy football system with promotion and relegation mechanics.',
        technicalRequirements: [
          'Extend League model to support division configuration',
          'Create division management UI and admin tools',
          'Implement promotion/relegation logic',
          'Add division-specific standings and rankings',
          'Create inter-division scheduling system',
          'Build division assignment and management system',
        ],
        dataModels: [
          'League.metadata (division configuration)',
          'New Division model with tier/level structure',
          'Extended Roster model for division assignment',
          'DivisionHistory for tracking movements',
        ],
        apiEndpoints: [
          'GET/POST /api/divisions/[leagueId] - division management',
          'PUT /api/divisions/[divisionId]/promote-relegate - movement logic',
        ],
        acceptanceCriteria: [
          'Leagues can be configured with multiple divisions',
          'Teams are properly assigned to divisions',
          'Division standings are calculated correctly',
          'Promotion/relegation works at season end',
        ],
        estimatedComplexity: 'complex',
        questions: [],
        // RESOLVED: 2 leagues of 12 teams, 3 divisions each, playoff teams promoted, non-playoff relegated, random initial assignment
      },
    },
    {
      id: 'competition-overview-page',
      title: 'Competition overview page (with relegation / promotion odds)',
      description: 'Create comprehensive competition page with promotion/relegation mechanics',
      status: 'pending',
      priority: 'high',
      category: 'ui',
      spec: createDefaultSpec(
        'Competition overview page (with relegation / promotion odds)',
        'Create comprehensive competition page with promotion/relegation mechanics',
        'ui'
      ),
    },
    {
      id: 'winnings-page',
      title: 'Winnings page',
      description: 'Display prize pool distribution and winnings tracking',
      status: 'pending',
      priority: 'medium',
      category: 'ui',
      spec: createDefaultSpec(
        'Winnings page',
        'Display prize pool distribution and winnings tracking',
        'ui'
      ),
    },
    {
      id: 'owner-history-page',
      title: 'Owner history page',
      description: 'Historical performance tracking for league owners',
      status: 'pending',
      priority: 'medium',
      category: 'ui',
      spec: createDefaultSpec(
        'Owner history page',
        'Historical performance tracking for league owners',
        'ui'
      ),
    },
    {
      id: 'draft-transaction-trade-grades',
      title: 'Draft, transaction, and trade grades',
      description: 'Implement grading system for draft picks, transactions, and trades',
      status: 'pending',
      priority: 'medium',
      category: 'analytics',
      spec: createDefaultSpec(
        'Draft, transaction, and trade grades',
        'Implement grading system for draft picks, transactions, and trades',
        'analytics'
      ),
    },
    {
      id: 'nfl-play-by-play',
      title: 'Connection to NFL play by play for key plays tooltip on matchups page',
      description: 'Integrate NFL play-by-play data for enhanced matchup insights',
      status: 'pending',
      priority: 'low',
      category: 'integration',
      spec: createDefaultSpec(
        'Connection to NFL play by play for key plays tooltip on matchups page',
        'Integrate NFL play-by-play data for enhanced matchup insights',
        'integration'
      ),
    },
  ],
};

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    case 'in_progress':
      return <Clock className='h-4 w-4 text-blue-500' />;
    case 'blocked':
      return <AlertCircle className='h-4 w-4 text-red-500' />;
    default:
      return <Circle className='h-4 w-4 text-gray-400' />;
  }
}

function getStatusBadge(status: string) {
  const variants = {
    pending: { variant: 'outline' as const, label: 'Pending' },
    in_progress: { variant: 'default' as const, label: 'In Progress' },
    completed: { variant: 'secondary' as const, label: 'Completed' },
    blocked: { variant: 'destructive' as const, label: 'Blocked' },
  };

  const config = variants[status as keyof typeof variants] || variants.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getPriorityBadge(priority: string) {
  const variants = {
    low: { variant: 'outline' as const, label: 'Low' },
    medium: { variant: 'secondary' as const, label: 'Medium' },
    high: { variant: 'destructive' as const, label: 'High' },
  };

  const config = variants[priority as keyof typeof variants] || variants.medium;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getCategoryBadge(category: string) {
  const categoryLabels = {
    ui: 'UI/UX',
    backend: 'Backend',
    integration: 'Integration',
    design: 'Design',
    analytics: 'Analytics',
  };

  return (
    <Badge variant='outline'>
      {categoryLabels[category as keyof typeof categoryLabels] || category}
    </Badge>
  );
}

function getComplexityColor(complexity: string) {
  const colors = {
    simple: 'text-green-600',
    moderate: 'text-yellow-600',
    complex: 'text-orange-600',
    epic: 'text-red-600',
  };
  return colors[complexity as keyof typeof colors] || colors.moderate;
}

function TodoDetailModal({ item }: { item: TodoItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='h-6 px-2 text-xs hover:bg-muted'>
          Details
          <ExternalLink className='ml-1 h-3 w-3' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              {getStatusIcon(item.status)}
              <span className='font-geizer'>{item.title}</span>
            </div>
            <div className='flex gap-2'>
              {getStatusBadge(item.status)}
              {getPriorityBadge(item.priority)}
              {getCategoryBadge(item.category)}
            </div>
          </DialogTitle>
          <DialogDescription className='text-left'>{item.description}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Overview */}
          <div>
            <h3 className='font-semibold text-lg mb-2 font-geizer'>Overview</h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>{item.spec.overview}</p>
          </div>

          {/* Complexity & Questions */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h4 className='font-semibold mb-2'>Estimated Complexity</h4>
              <Badge
                variant='outline'
                className={getComplexityColor(item.spec.estimatedComplexity)}
              >
                {item.spec.estimatedComplexity.toUpperCase()}
              </Badge>
            </div>
            {item.spec.questions && item.spec.questions.length > 0 && (
              <div>
                <h4 className='font-semibold mb-2 text-yellow-600'>Open Questions</h4>
                <div className='text-xs'>
                  {item.spec.questions.map((question, idx) => (
                    <div key={idx} className='flex items-start gap-1 mb-1'>
                      <span className='text-yellow-500 mt-1'>•</span>
                      <span className='text-muted-foreground'>{question}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Requirements */}
          <div>
            <h3 className='font-semibold mb-3 flex items-center gap-2'>
              <Code className='h-4 w-4' />
              Technical Requirements
            </h3>
            <div className='space-y-1'>
              {item.spec.technicalRequirements.map((req, idx) => (
                <div key={idx} className='flex items-start gap-2 text-sm'>
                  <CheckCircle className='h-3 w-3 text-green-500 mt-1 flex-shrink-0' />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Models */}
          {item.spec.dataModels && item.spec.dataModels.length > 0 && (
            <div>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                <Database className='h-4 w-4' />
                Data Models
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {item.spec.dataModels.map((model, idx) => (
                  <div key={idx} className='bg-muted/50 rounded p-2 text-sm font-mono'>
                    {model}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Endpoints */}
          {item.spec.apiEndpoints && item.spec.apiEndpoints.length > 0 && (
            <div>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                <Lightning className='h-4 w-4' />
                API Endpoints
              </h3>
              <div className='space-y-2'>
                {item.spec.apiEndpoints.map((endpoint, idx) => (
                  <div key={idx} className='bg-muted/50 rounded p-2 text-sm font-mono'>
                    {endpoint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UI Components */}
          {item.spec.uiComponents && item.spec.uiComponents.length > 0 && (
            <div>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                <Palette className='h-4 w-4' />
                UI Components
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {item.spec.uiComponents.map((component, idx) => (
                  <div key={idx} className='bg-muted/50 rounded p-2 text-sm'>
                    {component}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {item.spec.dependencies && item.spec.dependencies.length > 0 && (
            <div>
              <h3 className='font-semibold mb-3'>Dependencies</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {item.spec.dependencies.map((dep, idx) => (
                  <div key={idx} className='text-sm text-muted-foreground'>
                    • {dep}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acceptance Criteria */}
          <div>
            <h3 className='font-semibold mb-3'>Acceptance Criteria</h3>
            <div className='space-y-2'>
              {item.spec.acceptanceCriteria.map((criteria, idx) => (
                <div key={idx} className='flex items-start gap-2 text-sm'>
                  <Circle className='h-3 w-3 text-blue-500 mt-1 flex-shrink-0' />
                  <span>{criteria}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockers */}
          {item.spec.blockers && item.spec.blockers.length > 0 && (
            <div className='border-l-4 border-red-500 pl-4'>
              <h3 className='font-semibold mb-2 text-red-600'>Blockers</h3>
              <div className='space-y-1'>
                {item.spec.blockers.map((blocker, idx) => (
                  <div key={idx} className='flex items-start gap-2 text-sm'>
                    <AlertCircle className='h-3 w-3 text-red-500 mt-1 flex-shrink-0' />
                    <span className='text-red-600'>{blocker}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TodoSection({ section }: { section: TodoSection }) {
  const Icon = section.icon;
  const completedCount = section.items.filter(item => item.status === 'completed').length;
  const totalCount = section.items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Icon className='h-5 w-5 text-gauntlet-crimson' />
          <div className='flex-1'>
            <CardTitle className='text-lg font-geizer'>{section.title}</CardTitle>
            <CardDescription className='font-avenir'>{section.description}</CardDescription>
          </div>
          <div className='text-right'>
            <div className='text-sm font-medium text-muted-foreground'>
              {completedCount} / {totalCount} completed
            </div>
            <div className='text-xs text-muted-foreground'>
              {progressPercentage.toFixed(0)}% done
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className='w-full bg-muted rounded-full h-2'>
          <div
            className='bg-primary h-2 rounded-full transition-all duration-300'
            data-progress={progressPercentage}
            style={
              { width: `${Math.min(100, Math.max(0, progressPercentage))}%` } as React.CSSProperties
            }
          ></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {section.items.map(item => (
            <div
              key={item.id}
              className='border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-start gap-3'>
                <div className='pt-0.5'>{getStatusIcon(item.status)}</div>
                <div className='flex-1 space-y-2'>
                  <div className='flex items-start justify-between gap-4'>
                    <h3 className='font-medium leading-tight'>{item.title}</h3>
                    <div className='flex gap-2 flex-wrap items-center'>
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                      {getCategoryBadge(item.category)}
                      <TodoDetailModal item={item} />
                    </div>
                  </div>
                  {item.description && (
                    <p className='text-sm text-muted-foreground'>{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TodosPage() {
  const allItems = [...baseWorkTodos.items, ...gauntletSpecificTodos.items];
  const totalCompleted = allItems.filter(item => item.status === 'completed').length;
  const totalItems = allItems.length;
  const overallProgress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

  const inProgressItems = allItems.filter(item => item.status === 'in_progress');
  const highPriorityItems = allItems.filter(
    item => item.priority === 'high' && item.status !== 'completed'
  );

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold font-geizer text-foreground'>Development Roadmap</h1>
        <p className='text-muted-foreground mt-2 font-avenir'>
          Track the progress of The Gauntlet website development. This page shows all outstanding
          work and current progress.
        </p>
      </div>

      {/* Overview Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {totalCompleted} / {totalItems}
            </div>
            <div className='text-xs text-muted-foreground mt-1'>
              {overallProgress.toFixed(1)}% complete
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-500'>{inProgressItems.length}</div>
            <div className='text-xs text-muted-foreground mt-1'>Currently active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-500'>{highPriorityItems.length}</div>
            <div className='text-xs text-muted-foreground mt-1'>Needs attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Todo Sections */}
      <div className='space-y-8'>
        <TodoSection section={baseWorkTodos} />
        <TodoSection section={gauntletSpecificTodos} />
      </div>

      {/* Footer */}
      <div className='text-center py-8'>
        <p className='text-sm text-muted-foreground font-avenir'>
          Last updated: {new Date().toLocaleDateString()} • This roadmap is updated as development
          progresses
        </p>
      </div>
    </div>
  );
}
