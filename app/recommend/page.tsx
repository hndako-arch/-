'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, Loader2, ExternalLink, Heart, CloudSun } from 'lucide-react';

type Outfit = {
    title: string;
    explanation: string;
    items: {
        id: string;
        name: string;
        brand: string;
        image_url: string;
        item_url: string;
    }[];
};

type WeatherData = {
    temperature: number;
    maxTemp: number;
    minTemp: number;
    weatherLabel: string;
    weatherEmoji: string;
};

export default function RecommendPage() {
    const { profile } = useProfile();
    const [outfits, setOutfits] = useState<Outfit[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Fetch weather on mount
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Try to get user's location
                let lat = '35.6762';
                let lon = '139.6503';
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = pos.coords.latitude.toString();
                    lon = pos.coords.longitude.toString();
                } catch { /* Use Tokyo default */ }

                const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
                if (res.ok) {
                    const data = await res.json();
                    setWeather(data);
                }
            } catch { /* Weather is optional */ }
        };
        fetchWeather();
    }, []);

    const handleRecommend = async () => {
        if (!profile) return;
        setLoading(true);
        setError(null);
        setSavedIndexes(new Set());

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, weather }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.mock) {
                    setError("AI機能の設定に問題があります。しばらくしてからお試しください。");
                } else {
                    throw new Error(data.error || '生成に失敗しました');
                }
                return;
            }

            setOutfits(data.outfits);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const saveToFavorites = async (outfit: Outfit, index: number) => {
        try {
            const { error: dbError } = await supabase.from('favorite_outfits').insert({
                title: outfit.title,
                explanation: outfit.explanation,
                item_ids: outfit.items.map(i => i.id),
            });

            if (dbError) throw dbError;
            setSavedIndexes(prev => new Set(prev).add(index));
        } catch (err: any) {
            console.error('Save error:', err);
            setError(`保存エラー: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
                        AIスタイリスト
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {/* Weather Badge */}
                {weather && (
                    <div className="flex items-center justify-center gap-3 mb-4 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <CloudSun className="w-4 h-4 text-blue-400" />
                        <span className="text-lg">{weather.weatherEmoji}</span>
                        <span className="text-sm font-medium text-gray-700">{weather.weatherLabel}</span>
                        <span className="text-sm text-gray-900 font-bold">{weather.temperature}°C</span>
                        <span className="text-[10px] text-gray-400">
                            {weather.minTemp}° / {weather.maxTemp}°
                        </span>
                    </div>
                )}

                {!outfits && !loading && (
                    <div className="text-center py-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">新しいコーデを見つけませんか？</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                あなたのプロフィール（{profile?.body_type}、{profile?.personal_color}）
                                {weather ? `と今日の天気（${weather.weatherEmoji}${weather.temperature}°C）` : ''}
                                に基づき、クローゼットから最適なアイテムを提案します。
                            </p>
                            <button
                                onClick={handleRecommend}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                コーデを提案してもらう
                            </button>
                        </div>
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">スタイリストが考え中...</p>
                        <p className="text-gray-400 text-xs mt-2">
                            {weather ? `${weather.weatherEmoji} ${weather.temperature}°C に合う` : '骨格タイプに合う'}アイテムを選んでいます...
                        </p>
                    </div>
                )}

                {outfits && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {outfits.map((outfit, idx) => (
                            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{outfit.title}</h3>
                                        <span className="text-xs text-gray-300">パターン {idx + 1}</span>
                                    </div>
                                    <button
                                        onClick={() => saveToFavorites(outfit, idx)}
                                        disabled={savedIndexes.has(idx)}
                                        className={`p-2 rounded-full transition-all ${savedIndexes.has(idx)
                                                ? 'text-red-400'
                                                : 'text-gray-400 hover:text-red-400 active:scale-90'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${savedIndexes.has(idx) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                {/* Items Grid */}
                                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100">
                                    {outfit.items.map((item) => (
                                        <div key={item.id} className="relative aspect-[3/4] bg-white">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">画像なし</div>
                                            )}
                                            <a
                                                href={item.item_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute bottom-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>

                                {/* Commentary */}
                                <div className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{outfit.explanation}</p>
                                        </div>
                                    </div>
                                </div>

                                {savedIndexes.has(idx) && (
                                    <div className="px-5 pb-3">
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <Heart className="w-3 h-3 fill-current" /> お気に入りに保存しました
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={() => { setOutfits(null); setSavedIndexes(new Set()); }}
                            className="w-full py-3 text-gray-500 hover:text-gray-900 text-sm font-medium"
                        >
                            もう一度提案してもらう
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
