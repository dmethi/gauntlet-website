declare class ChatGoogleGenerativeAI {
  constructor(options: unknown);
}
let options = { apiKey: 'configured', model: 'gemini', maxOutputTokens: 512 };
new ChatGoogleGenerativeAI(options);
declare const request: { headers: { get: (name: string) => string | null } };
declare function requiredCronAuthorization(): string;
let expectedAuthorization = requiredCronAuthorization();
const authorized = request.headers.get('authorization') === expectedAuthorization;
let env = process.env;
const configuredKey = env.GEMINI_API_KEY;
void authorized;
void configuredKey;
