/**
 * Base interface for all report generation tools.
 * Tools are functions that Gemini can call to fetch data.
 */
export interface ReportTool<TArgs = Record<string, unknown>, TResult = unknown> {
  /** Unique identifier for the tool */
  name: string;

  /** Human-readable description for the AI */
  description: string;

  /** JSON schema for tool arguments */
  parameters: {
    type: 'object';
    properties: Record<
      string,
      {
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
        description: string;
        enum?: string[];
      }
    >;
    required: string[];
  };

  /** Implementation function */
  execute: (args: TArgs) => Promise<TResult>;
}

/**
 * Result of a tool execution.
 * Includes both the data and metadata about the execution.
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime: number; // milliseconds
  timestamp: string;
}

/**
 * Context passed to all tools.
 * Provides access to week, season, and other global data.
 */
export interface ToolContext {
  week: number;
  season: number;
  debug?: boolean;
}
