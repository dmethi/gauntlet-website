import type { ReportTool, ToolContext, ToolExecutionResult } from './base';
import { createToolError } from './errors';

/**
 * Tool registry interface defining all available methods.
 */
export interface ToolRegistry {
  register: <TArgs, TResult>(tool: ReportTool<TArgs, TResult>) => void;
  getTool: (name: string) => ReportTool | undefined;
  getAllTools: () => ReportTool[];
  getToolDefinitions: () => Array<{
    name: string;
    description: string;
    parameters: ReportTool['parameters'];
  }>;
  execute: <T = unknown>(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolContext,
  ) => Promise<ToolExecutionResult<T>>;
  getExecutionHistory: () => Array<{
    toolName: string;
    args: unknown;
    result: ToolExecutionResult;
  }>;
  clearHistory: () => void;
  getStats: () => {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    totalTime: number;
  };
}

/**
 * Registry for all available report tools.
 * Manages tool registration, lookup, and execution.
 */
export const createToolRegistry = (): ToolRegistry => {
  const tools = new Map<string, ReportTool>();
  const executionHistory: Array<{
    toolName: string;
    args: unknown;
    result: ToolExecutionResult;
  }> = [];

  const registry = {
    /**
     * Register a new tool in the registry.
     */
    register: <TArgs, TResult>(tool: ReportTool<TArgs, TResult>): void => {
      if (tools.has(tool.name)) {
        throw new Error(`Tool '${tool.name}' is already registered`);
      }

      tools.set(tool.name, tool as ReportTool);
      // eslint-disable-next-line no-console
      console.log(`[TOOL REGISTRY] Registered tool: ${tool.name}`);
    },

    /**
     * Get a tool by name.
     */
    getTool: (name: string): ReportTool | undefined => {
      return tools.get(name);
    },

    /**
     * Get all registered tools.
     * Used to provide tool definitions to Gemini.
     */
    getAllTools: (): ReportTool[] => {
      return Array.from(tools.values());
    },

    /**
     * Get tool definitions in LangChain format.
     * Transforms our tool interface to what Gemini expects.
     */
    getToolDefinitions: () => {
      return Array.from(tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      }));
    },

    /**
     * Execute a tool by name with arguments.
     * Handles errors and tracks execution metrics.
     */
    execute: <T = unknown>(
      toolName: string,
      args: Record<string, unknown>,
      context: ToolContext,
    ): Promise<ToolExecutionResult<T>> => {
      return (async (): Promise<ToolExecutionResult<T>> => {
        const startTime = Date.now();
        const tool = tools.get(toolName);

        if (!tool) {
          return {
            success: false,
            error: `Tool '${toolName}' not found`,
            executionTime: 0,
            timestamp: new Date().toISOString(),
          };
        }

        try {
          if (context.debug) {
            // eslint-disable-next-line no-console
            console.log(`[TOOL EXECUTE] ${toolName}`, {
              args,
              context: { week: context.week, season: context.season },
            });
          }

          const data = await tool.execute(args);
          const executionTime = Date.now() - startTime;

          const result: ToolExecutionResult<T> = {
            success: true,
            data: data as T,
            executionTime,
            timestamp: new Date().toISOString(),
          };

          executionHistory.push({
            toolName,
            args,
            result,
          });

          if (context.debug) {
            // eslint-disable-next-line no-console
            console.log(`[TOOL EXECUTE] ${toolName} completed in ${executionTime}ms`);
          }

          return result;
        } catch (error) {
          const executionTime = Date.now() - startTime;
          const toolError = createToolError(toolName, args, error);

          const result: ToolExecutionResult<T> = {
            success: false,
            error: toolError.message,
            executionTime,
            timestamp: new Date().toISOString(),
          };

          executionHistory.push({
            toolName,
            args,
            result,
          });

          // eslint-disable-next-line no-console
          console.error(`[TOOL EXECUTE] ${toolName} failed:`, toolError);

          return result;
        }
      })();
    },

    /**
     * Get execution history for debugging.
     */
    getExecutionHistory: () => {
      return executionHistory;
    },

    /**
     * Clear execution history.
     */
    clearHistory: (): void => {
      executionHistory.length = 0;
    },

    /**
     * Get execution statistics.
     */
    getStats: () => {
      const totalExecutions = executionHistory.length;
      const successfulExecutions = executionHistory.filter(e => e.result.success).length;
      const totalTime = executionHistory.reduce((sum, e) => sum + e.result.executionTime, 0);

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions: totalExecutions - successfulExecutions,
        successRate: totalExecutions > 0 ? successfulExecutions / totalExecutions : 0,
        averageExecutionTime: totalExecutions > 0 ? totalTime / totalExecutions : 0,
        totalTime,
      };
    },
  };

  return registry;
};

/**
 * Global tool registry instance.
 * All report tools should be registered here.
 */
export const toolRegistry = createToolRegistry();
