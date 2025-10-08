/**
 * Custom error class for tool execution failures.
 */
export class ToolExecutionError extends Error {
  constructor(
    public toolName: string,
    public args: unknown,
    public originalError: unknown,
    message?: string,
  ) {
    super(
      message ||
        `Tool '${toolName}' failed: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`,
    );
    this.name = 'ToolExecutionError';
  }
}

/**
 * Creates a standardized tool error from any thrown value.
 */
export const createToolError = (
  toolName: string,
  args: unknown,
  error: unknown,
): ToolExecutionError => {
  return new ToolExecutionError(toolName, args, error);
};

/**
 * Checks if an error is a tool execution error.
 */
export const isToolExecutionError = (error: unknown): error is ToolExecutionError => {
  return error instanceof ToolExecutionError;
};
