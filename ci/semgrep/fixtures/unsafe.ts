declare const request: { body: unknown; headers: { get: (key: string) => string | null } };
declare const logger: { info: (...values: unknown[]) => void };
declare class ChatGoogleGenerativeAI { constructor(options: unknown); }

logger.info("request", request.body);
const authorized = request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
const key = process.env.GEMINI_API_KEY || "development-key";
new ChatGoogleGenerativeAI({ apiKey: key, model: "gemini" });

void authorized;
