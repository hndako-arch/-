import React from 'react';
import { BodyType } from '@/context/ProfileContext';

interface BodyTypeSelectorProps {
    value: BodyType | null;
    onChange: (value: BodyType) => void;
}

const BODY_TYPES: { type: BodyType; title: string; desc: string }[] = [
    { type: 'Straight', title: 'ストレート', desc: '体に厚みがあり、重心が高め。筋肉質でハリのある質感。' },
    { type: 'Wave', title: 'ウェーブ', desc: '上半身が華奢で、重心が低め。肌質が柔らかい質感。' },
    { type: 'Natural', title: 'ナチュラル', desc: '関節や骨が目立ち、フレームを感じる体型。ラフな着こなしが得意。' },
];

export function BodyTypeSelector({ value, onChange }: BodyTypeSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BODY_TYPES.map((item) => (
                <button
                    key={item.type}
                    type="button"
                    onClick={() => onChange(item.type)}
                    className={`p-4 border rounded-xl text-left transition-all ${value === item.type
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                >
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                </button>
            ))}
        </div>
    );
}
