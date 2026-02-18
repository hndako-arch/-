'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCard } from './ProductCard';
import { Filter } from 'lucide-react';

type ClosetItem = {
    id: string;
    brand: string;
    name: string;
    image_url: string | null;
    product_id: string;
    item_url: string | null;
    color?: string;
    color_code?: string;
    category?: string;
    created_at: string;
};

const CATEGORIES = ['すべて', 'トップス', 'アウター', 'ボトムス', 'インナー', 'ルームウェア', '小物・その他', '未分類'];

export function ClosetGrid({ keyTrigger }: { keyTrigger: number }) {
    const [items, setItems] = useState<ClosetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('すべて');

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('closet_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setItems(data || []);
        } catch (err: any) {
            console.error('Error fetching items:', err);
            setError(err.message || 'Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [keyTrigger]); // Refresh when keyTrigger changes

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'すべて') return items;
        return items.filter(item => item.category === selectedCategory);
    }, [items, selectedCategory]);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">読み込み中...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">エラー: {error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Filter className="w-4 h-4" />
                    <span>カテゴリ表示</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat
                                ? 'bg-black text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                            {cat !== 'すべて' && (
                                <span className="ml-1.5 opacity-60">
                                    ({items.filter(i => i.category === cat).length})
                                </span>
                            )}
                            {cat === 'すべて' && (
                                <span className="ml-1.5 opacity-60">
                                    ({items.length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                    {selectedCategory === 'すべて'
                        ? 'クローゼットが空です。アイテムを追加してください！'
                        : `「${selectedCategory}」のアイテムはありません。`}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredItems.map((item) => (
                        <ProductCard key={item.id} item={item} onUpdate={fetchItems} />
                    ))}
                </div>
            )}
        </div>
    );
}
