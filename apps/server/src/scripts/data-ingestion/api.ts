import axios, { AxiosInstance } from 'axios';
import { SLEEPER_API_BASE, API_RATE_LIMIT } from './config.js';
import type { ConsoleLogger } from './logger.js';

export class SleeperAPI {
  private client: AxiosInstance;
  private logger: ConsoleLogger;
  private requestCount: number;
  private lastResetTime: number;

  constructor(logger: ConsoleLogger) {
    this.client = axios.create({
      baseURL: SLEEPER_API_BASE,
      timeout: 10000,
    });
    this.logger = logger;
    this.requestCount = 0;
    this.lastResetTime = Date.now();

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async config => {
      await this.checkRateLimit();
      return config;
    });
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    if (now - this.lastResetTime >= API_RATE_LIMIT.perMinute) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= API_RATE_LIMIT.maxRequests) {
      const waitTime = API_RATE_LIMIT.perMinute - (now - this.lastResetTime);
      this.logger.warn(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  private async get(endpoint: string): Promise<any> {
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      this.logger.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getLeague(leagueId: string): Promise<any> {
    return this.get(`/league/${leagueId}`);
  }

  async getUsers(leagueId: string): Promise<any[]> {
    return this.get(`/league/${leagueId}/users`);
  }

  async getRosters(leagueId: string): Promise<any[]> {
    return this.get(`/league/${leagueId}/rosters`);
  }

  async getMatchups(leagueId: string, week: number): Promise<any[]> {
    return this.get(`/league/${leagueId}/matchups/${week}`);
  }

  async getAllPlayers(): Promise<Record<string, any>> {
    return this.get('/players/nfl');
  }

  async getDraft(draftId: string): Promise<any> {
    return this.get(`/draft/${draftId}`);
  }

  async getDraftPicks(draftId: string): Promise<any[]> {
    return this.get(`/draft/${draftId}/picks`);
  }

  async getTransactions(leagueId: string, week: number): Promise<any[]> {
    return this.get(`/league/${leagueId}/transactions/${week}`);
  }

  // Undocumented endpoints used for rollups
  async getWeeklyStats(
    seasonType: string,
    season: number,
    week: number
  ): Promise<Record<string, any>> {
    return this.get(`/stats/nfl/${seasonType}/${season}/${week}`);
  }

  async getWeeklyProjections(
    seasonType: string,
    season: number,
    week: number
  ): Promise<Record<string, any>> {
    return this.get(`/projections/nfl/${seasonType}/${season}/${week}`);
  }
}

export const createAPI = (logger: ConsoleLogger): SleeperAPI => {
  return new SleeperAPI(logger);
};
