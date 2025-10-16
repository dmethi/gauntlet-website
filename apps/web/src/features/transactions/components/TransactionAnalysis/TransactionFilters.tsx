/**
 * Transaction Filters
 *
 * Filter controls for transaction analysis (team, league, grade, search).
 */

import { memo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Search } from 'lucide-react';
import type { SortBy, SortOrder } from './utils';

/**
 * Props for TransactionFilters component
 */
export interface TransactionFiltersProps {
  readonly teamFilter: string;
  readonly leagueFilter: string;
  readonly gradeFilter: string;
  readonly searchTerm: string;
  readonly sortBy: SortBy;
  readonly sortOrder: SortOrder;
  readonly uniqueTeams: string[];
  readonly uniqueLeagues: string[];
  readonly onTeamFilterChange: (value: string) => void;
  readonly onLeagueFilterChange: (value: string) => void;
  readonly onGradeFilterChange: (value: string) => void;
  readonly onSearchChange: (value: string) => void;
  readonly onSortByChange: (value: SortBy) => void;
  readonly onSortOrderToggle: () => void;
  readonly filteredCount: number;
  readonly totalCount: number;
}

/**
 * Transaction filter and sort controls
 *
 * Provides UI for filtering and sorting transactions.
 *
 * @example
 * <TransactionFilters
 *   teamFilter={teamFilter}
 *   onTeamFilterChange={setTeamFilter}
 *   ...
 * />
 */
export const TransactionFilters = memo<TransactionFiltersProps>(props => {
  const {
    teamFilter,
    leagueFilter,
    gradeFilter,
    searchTerm,
    sortBy,
    sortOrder,
    uniqueTeams,
    uniqueLeagues,
    onTeamFilterChange,
    onLeagueFilterChange,
    onGradeFilterChange,
    onSearchChange,
    onSortByChange,
    onSortOrderToggle,
    filteredCount,
    totalCount,
  } = props;

  return (
    <div className="space-y-4">
      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Team Filter */}
        <Select value={teamFilter} onValueChange={onTeamFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {uniqueTeams.map(team => (
              <SelectItem key={team} value={team || ''}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* League Filter */}
        <Select value={leagueFilter} onValueChange={onLeagueFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Leagues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            {uniqueLeagues.map(league => (
              <SelectItem key={league} value={league || ''}>
                {league}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grade Filter */}
        <Select value={gradeFilter} onValueChange={onGradeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
            <SelectItem value="F">F</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>

          <button
            title="Sort"
            onClick={onSortOrderToggle}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredCount} of {totalCount} transactions
        </div>
      </div>
    </div>
  );
});

TransactionFilters.displayName = 'TransactionFilters';
