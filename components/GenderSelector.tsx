'use client';

import { Gender } from '@/context/ProfileContext';

interface GenderSelectorProps {
    value: Gender | null;
    onChange: (value: Gender) => void;
}

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
    const genders: { id: Gender; label: string; description: string }[] = [
        { id: 'woman', label: '女性', description: '女性向けのコーデを提案します' },
        { id: 'man', label: '男性', description: '男性向けのコーデを提案します' },
        { id: 'other', label: '指定なし', description: 'ユニセックスな提案を含みます' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {genders.map((g) => (
                <button
                    key={g.id}
                    type="button"
                    onClick={() => onChange(g.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${value === g.id
                            ? 'border-black bg-gray-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="font-bold text-gray-900 mb-1">{g.label}</div>
                    <div className="text-xs text-gray-500">{g.description}</div>
                </button>
            ))}
        </div>
    );
}
