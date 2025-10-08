import { createGeminiClient } from './gemini-client';
import { HumanMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Test tool for validating function calling works.
 * This is a simple calculator tool using LangChain's tool format.
 */
const testTool = tool(
  (input: { a: number; b: number }) => {
    return input.a + input.b;
  },
  {
    name: 'calculate_sum',
    description: 'Calculates the sum of two numbers',
    schema: z.object({
      a: z.number().describe('First number'),
      b: z.number().describe('Second number'),
    }),
  },
);

/**
 * Tests that Gemini can call functions correctly.
 * This validates the function calling capability we'll use for data fetching.
 */
export const testFunctionCalling = async (): Promise<boolean> => {
  const client = createGeminiClient();

  try {
    // Bind the tool to the client
    const clientWithTools = client.bind({
      tools: [testTool],
    });

    // Ask Gemini to use the tool
    const response = await clientWithTools.invoke([
      new HumanMessage({
        content:
          'Use the calculate_sum tool to add 42 and 58. You MUST use the tool, do not calculate manually.',
      }),
    ]);

    // Check if Gemini called the function
    const hasToolCall = response.tool_calls && response.tool_calls.length > 0;

    if (!hasToolCall) {
      throw new Error('Gemini did not call the function');
    }

    const toolCall = response.tool_calls[0];
    const args = toolCall.args;

    if (args.a !== 42 || args.b !== 58) {
      throw new Error(`Incorrect arguments: ${JSON.stringify(args)}`);
    }

    // eslint-disable-next-line no-console
    console.log('[FUNCTION CALLING] Tool called with correct arguments:', args);
    return true;
  } catch (error) {
    throw new Error(
      `Function calling test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
