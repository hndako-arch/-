'use client';

import { useState } from 'react';
import { Search, Loader2, ShoppingBag, Palette, BarChart3, Star } from 'lucide-react';

type AnalysisResult = {
    categoryBalance: {
        summary: string;
        details: { category: string; count: number; percentage: number }[];
    };
    colorBalance: {
        summary: string;
        missingColors: string[];
    };
    recommendations: {
        itemName: string;
        category: string;
        reason: string;
    }[];
    overallScore: number;
    overallComment: string;
};

export default function AnalyzePage() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/analyze-closet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '分析に失敗しました');
            setResult(data);
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
                        <Search className="w-5 h-5 text-emerald-500" />
                        クローゼット分析
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {!result && !loading && (
                    <div className="text-center py-12">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">クローゼットを分析</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                AIがあなたのクローゼットを分析し、足りないアイテムやカラーバランスを教えてくれます。
                            </p>
                            <button
                                onClick={handleAnalyze}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                分析を開始する
                            </button>
                        </div>
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">AIが分析中...</p>
                        <p className="text-gray-400 text-xs mt-2">カテゴリ・カラーバランスをチェックしています</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {/* Overall Score */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-3">
                                <span className="text-2xl font-bold text-white">{result.overallScore}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{result.overallComment}</p>
                        </div>

                        {/* Category Balance */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-blue-500" />
                                カテゴリバランス
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">{result.categoryBalance.summary}</p>
                            <div className="space-y-2">
                                {result.categoryBalance.details.map(d => (
                                    <div key={d.category} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-16 shrink-0">{d.category}</span>
                                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                                                style={{ width: `${Math.min(d.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 w-6 text-right">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Color Balance */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <Palette className="w-4 h-4 text-pink-500" />
                                カラーバランス
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">{result.colorBalance.summary}</p>
                            {result.colorBalance.missingColors.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">不足している色</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.colorBalance.missingColors.map(c => (
                                            <span key={c} className="px-2.5 py-1 text-xs bg-pink-50 text-pink-600 rounded-full border border-pink-100">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <ShoppingBag className="w-4 h-4 text-orange-500" />
                                おすすめ買い足しアイテム
                            </h3>
                            <div className="space-y-3">
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                                        <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                            <Star className="w-3.5 h-3.5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{rec.itemName}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{rec.category}</p>
                                            <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-3 text-gray-500 hover:text-gray-900 text-sm font-medium"
                        >
                            もう一度分析する
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
