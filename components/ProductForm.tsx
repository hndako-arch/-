'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Loader2 } from 'lucide-react';

type ProductData = {
    title: string;
    imageUrl: string | null;
    url: string;
    productId: string;
    brand: string;
    category?: string;
    colors?: { code: string; name: string; imageUrl?: string }[];
};

const CATEGORIES = ['トップス', 'アウター', 'ボトムス', 'インナー', 'ルームウェア', '小物・その他', '未分類'];

export function ProductForm({ onItemAdded }: { onItemAdded: () => void }) {
    const [brand, setBrand] = useState<'UNIQLO' | 'GU'>('UNIQLO');
    const [productId, setProductId] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<ProductData | null>(null);
    const [selectedColor, setSelectedColor] = useState<{ code: string; name: string; imageUrl?: string } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('未分類');
    const [error, setError] = useState<string | null>(null);

    const fetchProductInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) return;

        setLoading(true);
        setError(null);
        setPreview(null);
        setSelectedColor(null);

        try {
            const res = await fetch(`/api/scrape-product?brand=${brand}&productId=${productId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '商品情報の取得に失敗しました');
            }

            setPreview(data.data);
            setSelectedCategory(data.data.category || '未分類');
            if (data.data.colors && data.data.colors.length > 0) {
                setSelectedColor(data.data.colors[0]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addToCloset = async () => {
        if (!preview) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('closet_items').insert({
                brand: preview.brand,
                product_id: preview.productId,
                name: preview.title,
                image_url: selectedColor?.imageUrl || preview.imageUrl,
                item_url: preview.url,
                color: selectedColor?.name || null,
                color_code: selectedColor?.code || null,
                category: selectedCategory,
            });

            if (error) throw error;

            // Reset form
            setProductId('');
            setPreview(null);
            setSelectedColor(null);
            setError(null);
            // Notify parent to refresh grid
            onItemAdded();
        } catch (err: any) {
            setError(err.message || 'クローゼットへの保存に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">アイテムを追加</h2>

            <form onSubmit={fetchProductInfo} className="space-y-4">
                {/* Brand Selection */}
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="brand"
                            value="UNIQLO"
                            checked={brand === 'UNIQLO'}
                            onChange={() => setBrand('UNIQLO')}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="font-medium text-gray-700">UNIQLO</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="brand"
                            value="GU"
                            checked={brand === 'GU'}
                            onChange={() => setBrand('GU')}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">GU</span>
                    </label>
                </div>

                {/* Product ID Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        placeholder="商品番号 (例: 465187)"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <button
                        type="submit"
                        disabled={loading || !productId}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        情報を取得
                    </button>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>

            {/* Preview Section */}
            {preview && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50 flex gap-4 items-start animate-in fade-in slide-in-from-top-2">
                    <div className="w-24 aspect-[3/4] bg-gray-200 rounded-md overflow-hidden shrink-0 shadow-inner">
                        {(selectedColor?.imageUrl || preview.imageUrl) ? (
                            <img src={selectedColor?.imageUrl || preview.imageUrl || ''} alt={preview.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">画像なし</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{preview.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{preview.brand} - {preview.productId}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {/* Color Selector */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">カラー</label>
                                {preview.colors && preview.colors.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {preview.colors.map((c) => (
                                            <button
                                                key={c.code}
                                                onClick={() => setSelectedColor(c)}
                                                className={`px-2 py-0.5 text-[10px] border rounded-full transition-all ${selectedColor?.code === c.code
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                {c.code}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">データなし</p>
                                )}
                            </div>

                            {/* Category Selector */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">カテゴリ</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-2 py-1 text-xs border rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mt-6">
                            <a
                                href={preview.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-xs text-center border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                ページを見る
                            </a>
                            <button
                                onClick={addToCloset}
                                disabled={loading || (preview.colors && preview.colors.length > 0 && !selectedColor)}
                                className="px-4 py-2 bg-black text-white text-xs rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 flex-grow transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                クローゼットに追加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
