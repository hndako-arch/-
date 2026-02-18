// Server-side configuration - NOT committed to git
// This file provides fallback values when environment variables are unavailable

export const serverConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY || 'AIzaSyDDqKcMywr80d6DEdn63NlDYF98Cqh15HU',
};
