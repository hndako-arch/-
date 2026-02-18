'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Trash2, ExternalLink, Sparkles, Loader2 } from 'lucide-react';

type FavoriteOutfit = {
    id: string;
    title: string;
    explanation: string;
    item_ids: string[];
    created_at: string;
    items?: {
        id: string;
        name: string;
        brand: string;
        image_url: string;
        item_url: string;
    }[];
};

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<FavoriteOutfit[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const { data: favs, error } = await supabase
                .from('favorite_outfits')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!favs) { setFavorites([]); return; }

            // Fetch all closet items to map item_ids to full objects
            const { data: allItems } = await supabase
                .from('closet_items')
                .select('*');

            const enriched = favs.map(fav => ({
                ...fav,
                items: fav.item_ids
                    .map((id: string) => allItems?.find(item => item.id === id))
                    .filter(Boolean)
            }));

            setFavorites(enriched);
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteFavorite = async (id: string) => {
        try {
            await supabase.from('favorite_outfits').delete().eq('id', id);
            setFavorites(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error('Error deleting favorite:', err);
        }
    };

    useEffect(() => { fetchFavorites(); }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                        お気に入りコーデ
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                        <p className="text-gray-400 text-sm">読み込み中...</p>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm">
                            お気に入りのコーデはまだありません。
                        </p>
                        <p className="text-gray-300 text-xs mt-1">
                            AIコーデページで ♡ を押して保存しましょう
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {favorites.map((fav) => (
                            <div key={fav.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                                    <h3 className="font-bold text-base">{fav.title}</h3>
                                    <button
                                        onClick={() => deleteFavorite(fav.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Items Grid */}
                                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100">
                                    {fav.items?.map((item) => (
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
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{fav.explanation}</p>
                                    </div>
                                </div>

                                <div className="px-4 pb-3">
                                    <p className="text-[10px] text-gray-300">
                                        {new Date(fav.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} に保存
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
