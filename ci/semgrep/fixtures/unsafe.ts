declare const request: { body: unknown; headers: { get: (key: string) => string | null } };
declare const logger: { info: (...values: unknown[]) => void };
declare class ChatGoogleGenerativeAI { constructor(options: unknown); }

logger.info("request", request.body);
const ctx = request;
logger.info("aliased request", ctx.body);
const authorized = request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
const cronSecret = process.env.CRON_SECRET;
const indirectlyAuthorized = request.headers.get("authorization") === `Bearer ${cronSecret}`;
const key = process.env.GEMINI_API_KEY || "development-key";
let env = process.env;
const aliasedKey = env.GEMINI_API_KEY || "development-key";
new ChatGoogleGenerativeAI({ apiKey: key, model: "gemini" });
let options = { apiKey: key, model: "gemini" };
new ChatGoogleGenerativeAI(options);
let expectedAuthorization = `Bearer ${process.env.CRON_SECRET}`;
const expectedHeaderAuthorized = request.headers.get("authorization") === expectedAuthorization;

void authorized;
void indirectlyAuthorized;
void aliasedKey;
void expectedHeaderAuthorized;
