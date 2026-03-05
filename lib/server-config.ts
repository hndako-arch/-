// Server-side configuration
// GEMINI_API_KEY must be set in Vercel Environment Variables (never in code)

export const serverConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
};
