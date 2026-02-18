'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { WearLogModal } from '@/components/WearLogModal';

type WearRecord = {
    id: string;
    date: string;
    item_ids: string[];
    note: string | null;
    items?: { id: string; name: string; image_url: string }[];
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [records, setRecords] = useState<WearRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fetchRecords = async () => {
        setLoading(true);
        const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

        try {
            const { data: recs } = await supabase
                .from('wear_records')
                .select('*')
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)
                .order('date', { ascending: true });

            if (recs) {
                const { data: allItems } = await supabase.from('closet_items').select('id, name, image_url');
                const enriched = recs.map(r => ({
                    ...r,
                    items: r.item_ids
                        .map((id: string) => allItems?.find(i => i.id === id))
                        .filter(Boolean)
                }));
                setRecords(enriched);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, [year, month]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calendar grid calculations
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    const getDateStr = (day: number) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getRecordForDay = (day: number) =>
        records.find(r => r.date === getDateStr(day));

    const handleDayClick = (day: number) => {
        const dateStr = getDateStr(day);
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const handleModalSaved = () => {
        setShowModal(false);
        fetchRecords();
    };

    const selectedRecord = selectedDate ? records.find(r => r.date === selectedDate) : null;

    const monthLabel = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-center">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-blue-500" />
                        着用記録
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">{monthLabel}</h2>
                    <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Week headers */}
                    <div className="grid grid-cols-7 border-b">
                        {weekDays.map(d => (
                            <div key={d} className={`text-center py-2 text-[10px] font-bold ${d === '日' ? 'text-red-400' : d === '土' ? 'text-blue-400' : 'text-gray-400'}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, i) => {
                                if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;

                                const dateStr = getDateStr(day);
                                const record = getRecordForDay(day);
                                const isToday = dateStr === todayStr;
                                const dayOfWeek = new Date(year, month, day).getDay();

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayClick(day)}
                                        className={`aspect-square flex flex-col items-center justify-center border-b border-r border-gray-50 relative transition-colors
                                            ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        <span className={`text-xs font-medium ${isToday ? 'text-white bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center' :
                                                dayOfWeek === 0 ? 'text-red-400' :
                                                    dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'
                                            }`}>
                                            {day}
                                        </span>
                                        {record && (
                                            <div className="flex gap-0.5 mt-0.5">
                                                {record.items?.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="w-2 h-2 rounded-full bg-purple-400" />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Today's Quick Add */}
                <button
                    onClick={() => {
                        setSelectedDate(todayStr);
                        setShowModal(true);
                    }}
                    className="w-full mt-4 py-3 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    今日の着用を記録する
                </button>

                {/* Selected Day Records */}
                {selectedDate && !showModal && (
                    <div className="mt-4">
                        {records.filter(r => r.date === selectedDate).map(rec => (
                            <div key={rec.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-xs font-medium text-gray-900">
                                        {new Date(rec.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                    </p>
                                    {rec.note && <span className="text-[10px] text-gray-400">- {rec.note}</span>}
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto">
                                    {rec.items?.map(item => (
                                        <div key={item.id} className="w-12 aspect-[3/4] rounded-md overflow-hidden bg-gray-100 shrink-0">
                                            {item.image_url && (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Wear Log Modal */}
            {showModal && selectedDate && (
                <WearLogModal
                    date={selectedDate}
                    onClose={() => setShowModal(false)}
                    onSaved={handleModalSaved}
                    existingItemIds={selectedRecord?.item_ids}
                    existingNote={selectedRecord?.note || undefined}
                    recordId={selectedRecord?.id}
                />
            )}
        </div>
    );
}
