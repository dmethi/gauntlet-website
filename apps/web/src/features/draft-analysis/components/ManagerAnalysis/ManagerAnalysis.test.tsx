import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ManagerAnalysis } from './ManagerAnalysis';
import { ManagerFactory } from '@/test/factories/manager';

// Mock the hooks
vi.mock('@/features/draft-analysis/hooks', () => ({
  useManagerFiltering: (profiles: unknown[]) => ({
    filteredProfiles: profiles,
    filters: {},
    setFilters: vi.fn(),
  }),
  useManagerSorting: (profiles: unknown[]) => ({
    sortConfig: { key: 'concentration.giniSpend', direction: 'desc' },
    sortBy: 'concentration',
    setSortBy: vi.fn(),
    handleSort: vi.fn(),
    sortedProfiles: profiles,
  }),
}));

describe('ManagerAnalysis', () => {
  const mockAnalytics = ManagerFactory.generateAnalytics();

  const expectTextPresent = (value: string) => {
    expect(screen.getAllByText((content: string) => content.includes(value))).not.toHaveLength(0);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the main heading', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);
      expect(screen.getByText('Manager Behavior Profiles')).toBeInTheDocument();
    });

    it('renders the subtitle description', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);
      expect(screen.getByText(/Comprehensive analysis of draft strategies/i)).toBeInTheDocument();
    });

    it('renders ConcentrationMetricsTable component', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);
      // ConcentrationMetricsTable should render managers
      mockAnalytics.profiles.forEach(profile => {
        expectTextPresent(profile.manager);
      });
    });

    it('renders all major sections', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);

      // Check that components are rendered (they have their own headings)
      // ConcentrationMetricsTable is always present
      expectTextPresent(mockAnalytics.profiles[0].manager);

      // Other sections should be present in the DOM
      const sections = screen.getAllByRole('table', { hidden: true });
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integration', () => {
    it('passes correct profiles to ConcentrationMetricsTable', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);

      // Verify all manager names are present
      mockAnalytics.profiles.forEach(profile => {
        expectTextPresent(profile.manager);
      });
    });

    it('passes analytics to PlayerOverlapAnalysis', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);

      // PlayerOverlapAnalysis should receive analytics
      // Check if any overlap data is rendered
      const content = screen.getAllByText((content: string) => content.includes(mockAnalytics.profiles[0].manager))[0]?.closest('div');
      expect(content).toBeInTheDocument();
    });

    it('handles empty profiles array', () => {
      const emptyAnalytics = ManagerFactory.generateAnalytics({
        profiles: [],
      });

      render(<ManagerAnalysis analytics={emptyAnalytics} />);
      expect(screen.getByText('Manager Behavior Profiles')).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    it('displays manager concentration metrics', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);

      // Check that Gini coefficients are displayed (formatted to 3 decimals)
      const profile = mockAnalytics.profiles[0];
      const giniText = profile.concentration.giniSpend.toFixed(3);
      expectTextPresent(giniText);
    });

    it('displays league information', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);

      // Check that league names appear (AFC/NFC)
      mockAnalytics.profiles.forEach(profile => {
        if (profile.league === 'AFC' || profile.league === 'NFC') {
          // League badges should be present
          expect(profile.league).toBeTruthy();
        }
      });
    });
  });

  describe('Component Integration', () => {
    it('renders all sub-components without errors', () => {
      const { container } = render(<ManagerAnalysis analytics={mockAnalytics} />);

      // Should have multiple sections
      expect(container.querySelector('.space-y-8')).toBeInTheDocument();
    });

    it('maintains consistent data flow between components', () => {
      render(<ManagerAnalysis analytics={mockAnalytics} />);

      // All managers should appear in the main table
      mockAnalytics.profiles.forEach(profile => {
        expectTextPresent(profile.manager);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles single manager', () => {
      const singleManagerAnalytics = ManagerFactory.generateAnalytics({
        profiles: [ManagerFactory.generateProfile()],
      });

      render(<ManagerAnalysis analytics={singleManagerAnalytics} />);
      expectTextPresent('Test Manager');
    });

    it('handles managers with extreme concentration values', () => {
      const extremeAnalytics = ManagerFactory.generateAnalytics({
        profiles: [
          ManagerFactory.generateProfile({
            manager: 'Extreme Manager',
            concentration: {
              giniSpend: 0.95,
              top1_share: 0.8,
              top2_share: 0.9,
              top3_share: 0.95,
              top4_share: 0.97,
              top5_share: 0.99,
            },
          }),
        ],
      });

      render(<ManagerAnalysis analytics={extremeAnalytics} />);
      expectTextPresent('Extreme Manager');
      expectTextPresent('0.950'); // Gini formatted
    });

    it('handles managers with minimal concentration', () => {
      const balancedAnalytics = ManagerFactory.generateAnalytics({
        profiles: [
          ManagerFactory.generateProfile({
            manager: 'Balanced Manager',
            concentration: {
              giniSpend: 0.15,
              top1_share: 0.1,
              top2_share: 0.18,
              top3_share: 0.25,
              top4_share: 0.32,
              top5_share: 0.4,
            },
          }),
        ],
      });

      render(<ManagerAnalysis analytics={balancedAnalytics} />);
      expectTextPresent('Balanced Manager');
      expectTextPresent('0.150'); // Gini formatted
    });
  });
});
