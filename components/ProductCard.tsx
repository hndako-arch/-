import React, { useState } from 'react';
import { Trash2, Edit2, Loader2, Check, X, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ProductCardProps = {
    item: {
        id: string;
        brand: string;
        name: string;
        image_url: string | null;
        product_id: string;
        item_url: string | null;
        color?: string | null;
        color_code?: string | null;
        category?: string | null;
    };
    onUpdate?: () => void;
};

const CATEGORIES = ['トップス', 'アウター', 'ボトムス', 'インナー', 'ルームウェア', '小物・その他', '未分類'];

export function ProductCard({ item, onUpdate }: ProductCardProps) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newCategory, setNewCategory] = useState(item.category || '未分類');

    const handleDelete = async () => {
        if (!confirm('このアイテムをクローゼットから削除しますか？')) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('closet_items').delete().eq('id', item.id);
            if (error) throw error;
            onUpdate?.();
        } catch (err) {
            console.error('Delete error:', err);
            alert('削除に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('closet_items')
                .update({
                    category: newCategory
                })
                .eq('id', item.id);
            if (error) throw error;
            setIsEditing(false);
            onUpdate?.();
        } catch (err) {
            console.error('Update error:', err);
            alert('更新に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white group relative">
            <div className="aspect-[3/4] relative bg-gray-100">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        画像なし
                    </div>
                )}

                {/* Brand and Category Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider w-fit">
                        {item.brand}
                    </span>
                    {!isEditing && item.category && (
                        <span className="bg-white/90 text-gray-800 text-[10px] px-2 py-0.5 rounded shadow-sm border border-gray-100 flex items-center gap-1 w-fit">
                            <Tag className="w-2.5 h-2.5" />
                            {item.category}
                        </span>
                    )}
                </div>

                {/* Delete Button (Overlay) */}
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 text-red-600 rounded-full shadow-md transition-opacity hover:bg-red-50 border border-red-100 z-10"
                    title="削除"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>

            <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5em] leading-tight">
                    {item.name}
                </h3>

                <div className="flex flex-col gap-2 mt-2">
                    {isEditing ? (
                        <div className="space-y-2 p-2 bg-gray-50 rounded-lg">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">カテゴリを変更</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black w-full bg-white text-gray-900 font-medium"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} className="text-gray-900">
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewCategory(item.category || '未分類');
                                    }}
                                    className="text-gray-400 p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="text-green-600 p-1 hover:bg-green-100 rounded"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <p className="text-[10px] font-mono text-gray-400">ID: {item.product_id}</p>
                                {item.color && (
                                    <span className="text-[10px] text-gray-500">
                                        / {item.color}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 text-gray-400 hover:text-black transition-colors"
                                title="カテゴリ編集"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <a
                            href={item.item_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            詳細を見る
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
