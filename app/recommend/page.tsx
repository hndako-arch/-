'use client';

import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { Sparkles, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';

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

export default function RecommendPage() {
    const { profile } = useProfile();
    const [outfits, setOutfits] = useState<Outfit[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRecommend = async () => {
        if (!profile) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.mock) {
                    setError(".env.local に GEMINI_API_KEY を設定してAI機能を有効にしてください。");
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
                {!outfits && !loading && (
                    <div className="text-center py-12">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">新しいコーデを見つけませんか？</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                あなたのプロフィール（{profile?.body_type}、{profile?.personal_color}）に基づき、
                                クローゼットから最適なアイテムを提案します。
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
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">スタイリストが考え中...</p>
                        <p className="text-gray-400 text-xs mt-2">骨格タイプに合うアイテムを選んでいます...</p>
                    </div>
                )}

                {outfits && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {outfits.map((outfit, idx) => (
                            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="p-4 bg-gray-900 text-white flex justify-between items-baseline">
                                    <h3 className="font-bold text-lg">{outfit.title}</h3>
                                    <span className="text-xs text-gray-300">パターン {idx + 1}</span>
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
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {outfit.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setOutfits(null)}
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
