import React from 'react';
import { PersonalColor } from '@/context/ProfileContext';

interface ColorSelectorProps {
    value: PersonalColor | null;
    onChange: (value: PersonalColor) => void;
}

const COLORS: { type: PersonalColor; title: string; desc: string; color: string }[] = [
    { type: 'Spring', title: 'イエベ春', desc: '明るく華やか。暖かみのあるイエローベースの色。', color: 'bg-yellow-100' },
    { type: 'Summer', title: 'ブルベ夏', desc: '優しく爽やか。涼しげなブルーベースの色。', color: 'bg-blue-100' },
    { type: 'Autumn', title: 'イエベ秋', desc: '落ち着いた深み。暖かいアースカラー。', color: 'bg-orange-100' },
    { type: 'Winter', title: 'ブルベ冬', desc: '鮮やかでクリア。コントラストの強いブルーベースの色。', color: 'bg-purple-100' },
];

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COLORS.map((item) => (
                <button
                    key={item.type}
                    type="button"
                    onClick={() => onChange(item.type)}
                    className={`p-4 border rounded-xl text-left transition-all relative overflow-hidden ${value === item.type
                        ? 'border-gray-900 ring-1 ring-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                >
                    <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-xl ${item.color}`} />
                    <div className="font-semibold text-gray-900 relative z-10">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1 relative z-10">{item.desc}</div>
                </button>
            ))}
        </div>
    );
}
