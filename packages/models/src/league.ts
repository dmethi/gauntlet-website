import { FantasyTeam, League, LeagueSettings } from '@gauntlet/types';
import { generateId } from '@gauntlet/lib';

export class LeagueModel {
  private league: League;

  constructor(league: League) {
    this.league = league;
  }

  /**
   * Create a new league
   */
  static create(
    name: string,
    ownerId: string,
    settings: LeagueSettings,
    season: number = new Date().getFullYear()
  ): LeagueModel {
    const league: League = {
      id: generateId(),
      name,
      ownerId,
      teams: [],
      settings,
      season,
      currentWeek: 1,
      status: 'draft',
    };

    return new LeagueModel(league);
  }

  /**
   * Add a team to the league
   */
  addTeam(team: FantasyTeam): void {
    if (this.league.teams.length >= this.league.settings.teamCount) {
      throw new Error('League is full');
    }

    if (this.league.teams.some(t => t.ownerId === team.ownerId)) {
      throw new Error('User already has a team in this league');
    }

    this.league.teams.push(team);

    // Auto-advance to active status when league is full
    if (
      this.league.teams.length === this.league.settings.teamCount &&
      this.league.status === 'draft'
    ) {
      this.league.status = 'active';
    }
  }

  /**
   * Remove a team from the league
   */
  removeTeam(teamId: string): void {
    const teamIndex = this.league.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }

    this.league.teams.splice(teamIndex, 1);
  }

  /**
   * Get league standings sorted by wins and points
   */
  getStandings(): FantasyTeam[] {
    return [...this.league.teams].sort((a, b) => {
      // Sort by wins first, then by points for
      if (a.wins !== b.wins) {
        return b.wins - a.wins;
      }
      return b.pointsFor - a.pointsFor;
    });
  }

  /**
   * Get playoff eligible teams
   */
  getPlayoffTeams(): FantasyTeam[] {
    const standings = this.getStandings();
    return standings.slice(0, this.league.settings.playoffTeams);
  }

  /**
   * Advance to next week
   */
  advanceWeek(): void {
    if (this.league.currentWeek >= 18) {
      throw new Error('Cannot advance beyond week 18');
    }

    this.league.currentWeek++;

    // Check if we should advance to playoffs
    if (this.league.currentWeek > 14 && this.league.status === 'active') {
      this.league.status = 'playoffs';
    }
  }

  /**
   * Complete the season
   */
  completeSeason(): void {
    this.league.status = 'complete';
  }

  /**
   * Get team by owner ID
   */
  getTeamByOwner(ownerId: string): FantasyTeam | undefined {
    return this.league.teams.find(t => t.ownerId === ownerId);
  }

  /**
   * Get team by team ID
   */
  getTeamById(teamId: string): FantasyTeam | undefined {
    return this.league.teams.find(t => t.id === teamId);
  }

  /**
   * Check if user is league owner
   */
  isOwner(userId: string): boolean {
    return this.league.ownerId === userId;
  }

  /**
   * Check if trades are allowed
   */
  areTradesAllowed(): boolean {
    return this.league.currentWeek <= this.league.settings.tradeDeadline;
  }

  /**
   * Get league data
   */
  toJSON(): League {
    return { ...this.league };
  }
}
