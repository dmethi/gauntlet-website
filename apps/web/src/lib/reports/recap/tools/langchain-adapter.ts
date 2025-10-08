/**
 * LangChain Tool Adapter
 * Converts our ReportTool format to LangChain's tool format for Gemini function calling.
 */

import { tool as langchainTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { ReportTool } from './base';

/**
 * Converts a ReportTool's parameters schema to a Zod schema.
 * This is required by LangChain's tool() function.
 */
const convertParametersToZodSchema = (parameters: ReportTool['parameters']): z.ZodObject<any> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  Object.entries(parameters.properties).forEach(([key, prop]) => {
    let zodType: z.ZodTypeAny;

    switch (prop.type) {
      case 'string':
        zodType = z.string().describe(prop.description);
        break;
      case 'number':
        zodType = z.number().describe(prop.description);
        break;
      case 'boolean':
        zodType = z.boolean().describe(prop.description);
        break;
      case 'array':
        zodType = z.array(z.any()).describe(prop.description);
        break;
      case 'object':
        zodType = z.record(z.any()).describe(prop.description);
        break;
      default:
        zodType = z.any().describe(prop.description);
    }

    // Make optional if not required
    if (!parameters.required.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  });

  return z.object(shape);
};

/**
 * Converts a ReportTool to LangChain tool format.
 * This allows Gemini to call our tools via function calling.
 *
 * @param reportTool - The tool to convert
 * @returns A LangChain-compatible tool
 */
export const convertToLangChainTool = (reportTool: ReportTool) => {
  const zodSchema = convertParametersToZodSchema(reportTool.parameters);

  return langchainTool(
    async (args: any) => {
      try {
        const result = await reportTool.execute(args);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: true,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    {
      name: reportTool.name,
      description: reportTool.description,
      schema: zodSchema,
    },
  );
};

/**
 * Converts multiple ReportTools to LangChain tool format.
 *
 * @param reportTools - Array of tools to convert
 * @returns Array of LangChain-compatible tools
 */
export const convertToolsToLangChain = (reportTools: ReportTool[]) => {
  return reportTools.map(convertToLangChainTool);
};
