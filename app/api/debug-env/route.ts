import { NextResponse } from 'next/server';

// Temporary debug endpoint to verify server-side env vars
export async function GET() {
    return NextResponse.json({
        geminiKey: process.env.GEMINI_API_KEY ? `SET (${process.env.GEMINI_API_KEY.substring(0, 8)}...)` : 'NOT SET',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? 'YES' : 'NO',
    });
}
