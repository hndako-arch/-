'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Check, Loader2 } from 'lucide-react';

type ClosetItem = {
    id: string;
    name: string;
    brand: string;
    image_url: string;
    category: string;
};

type Props = {
    date: string; // YYYY-MM-DD
    onClose: () => void;
    onSaved: () => void;
    existingItemIds?: string[];
    existingNote?: string;
    recordId?: string;
};

export function WearLogModal({ date, onClose, onSaved, existingItemIds, existingNote, recordId }: Props) {
    const [items, setItems] = useState<ClosetItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(existingItemIds || []));
    const [note, setNote] = useState(existingNote || '');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            const { data } = await supabase.from('closet_items').select('id, name, brand, image_url, category');
            setItems(data || []);
            setLoading(false);
        };
        fetchItems();
    }, []);

    const toggleItem = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        if (selectedIds.size === 0) return;
        setSaving(true);

        try {
            if (recordId) {
                await supabase.from('wear_records').update({
                    item_ids: Array.from(selectedIds),
                    note: note || null,
                }).eq('id', recordId);
            } else {
                await supabase.from('wear_records').insert({
                    date,
                    item_ids: Array.from(selectedIds),
                    note: note || null,
                });
            }
            onSaved();
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
        month: 'long', day: 'numeric', weekday: 'short'
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white w-full max-w-md rounded-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                    <h3 className="font-bold text-gray-900">{displayDate} の着用記録</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400 mb-3">着用したアイテムを選択してください</p>
                            <div className="grid grid-cols-3 gap-2">
                                {items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleItem(item.id)}
                                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${selectedIds.has(item.id)
                                            ? 'border-black shadow-md scale-[1.02]'
                                            : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="aspect-[3/4] bg-gray-100">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">
                                                    画像なし
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-gray-600 p-1 truncate">{item.name}</p>
                                        {selectedIds.has(item.id) && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label className="text-xs text-gray-400 block mb-1">メモ（任意）</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="例: デートコーデ、通勤用"
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer - Always visible */}
                <div className="p-4 border-t shrink-0 bg-white rounded-b-2xl">
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedIds.size === 0}
                        className="w-full py-3 bg-black text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {selectedIds.size > 0 ? `${selectedIds.size}アイテムを記録` : 'アイテムを選択してください'}
                    </button>
                </div>
            </div>
        </div>
    );
}
