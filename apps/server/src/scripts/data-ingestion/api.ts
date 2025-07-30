import axios, { AxiosInstance } from 'axios';
import { SLEEPER_API_BASE, API_RATE_LIMIT } from './config';
import { Logger } from './types';
import type {
  SleeperUser,
  SleeperLeague,
  SleeperRoster,
  SleeperMatchup,
  SleeperPlayer,
  SleeperDraft,
  SleeperDraftPick,
  SleeperTransaction,
} from './types';

export class SleeperAPI {
  private client: AxiosInstance;
  private logger: Logger;
  private requestCount: number;
  private lastResetTime: number;

  constructor(logger: Logger) {
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

  private async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint);
      return response.data;
    } catch (error) {
      this.logger.error(`API request failed: ${endpoint}`, error as Error);
      throw error;
    }
  }

  async getLeague(leagueId: string): Promise<SleeperLeague> {
    return this.get<SleeperLeague>(`/league/${leagueId}`);
  }

  async getUsers(leagueId: string): Promise<SleeperUser[]> {
    return this.get<SleeperUser[]>(`/league/${leagueId}/users`);
  }

  async getRosters(leagueId: string): Promise<SleeperRoster[]> {
    return this.get<SleeperRoster[]>(`/league/${leagueId}/rosters`);
  }

  async getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
    return this.get<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);
  }

  async getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
    return this.get<Record<string, SleeperPlayer>>('/players/nfl');
  }

  async getDraft(draftId: string): Promise<SleeperDraft> {
    return this.get<SleeperDraft>(`/draft/${draftId}`);
  }

  async getDraftPicks(draftId: string): Promise<SleeperDraftPick[]> {
    return this.get<SleeperDraftPick[]>(`/draft/${draftId}/picks`);
  }

  async getTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
    return this.get<SleeperTransaction[]>(`/league/${leagueId}/transactions/${week}`);
  }
}

export const createAPI = (logger: Logger): SleeperAPI => {
  return new SleeperAPI(logger);
};
