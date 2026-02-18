import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat') || '35.6762'; // Tokyo default
        const lon = searchParams.get('lon') || '139.6503';

        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=1`,
            { next: { revalidate: 1800 } } // Cache for 30 min
        );

        if (!res.ok) throw new Error('Weather API error');

        const data = await res.json();

        // Map weather codes to descriptions
        const weatherDescriptions: Record<number, { label: string; emoji: string }> = {
            0: { label: '快晴', emoji: '☀️' },
            1: { label: 'ほぼ晴れ', emoji: '🌤️' },
            2: { label: 'くもり時々晴れ', emoji: '⛅' },
            3: { label: 'くもり', emoji: '☁️' },
            45: { label: '霧', emoji: '🌫️' },
            48: { label: '霧（霜）', emoji: '🌫️' },
            51: { label: '小雨', emoji: '🌦️' },
            53: { label: '雨', emoji: '🌧️' },
            55: { label: '大雨', emoji: '🌧️' },
            61: { label: '小雨', emoji: '🌦️' },
            63: { label: '雨', emoji: '🌧️' },
            65: { label: '大雨', emoji: '🌧️' },
            71: { label: '小雪', emoji: '🌨️' },
            73: { label: '雪', emoji: '❄️' },
            75: { label: '大雪', emoji: '❄️' },
            80: { label: 'にわか雨', emoji: '🌦️' },
            81: { label: 'にわか雨', emoji: '🌧️' },
            82: { label: '激しいにわか雨', emoji: '⛈️' },
            95: { label: '雷雨', emoji: '⛈️' },
        };

        const code = data.current.weather_code;
        const weather = weatherDescriptions[code] || { label: '不明', emoji: '🌈' };

        return NextResponse.json({
            temperature: Math.round(data.current.temperature_2m),
            maxTemp: Math.round(data.daily.temperature_2m_max[0]),
            minTemp: Math.round(data.daily.temperature_2m_min[0]),
            weatherLabel: weather.label,
            weatherEmoji: weather.emoji,
            windSpeed: data.current.wind_speed_10m,
        });
    } catch (err: any) {
        console.error('Weather error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
