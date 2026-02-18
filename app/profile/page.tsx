'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile, BodyType, PersonalColor } from '@/context/ProfileContext';
import { BodyTypeSelector } from '@/components/BodyTypeSelector';
import { ColorSelector } from '@/components/ColorSelector';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { profile, loading: profileLoading, updateProfile } = useProfile();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Local state for form
    const [height, setHeight] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [bodyType, setBodyType] = useState<BodyType | null>(null);
    const [personalColor, setPersonalColor] = useState<PersonalColor | null>(null);
    const [stylePreference, setStylePreference] = useState('');

    // Sinc local state with profile context when loaded
    useEffect(() => {
        if (profile) {
            setHeight(profile.height ? profile.height.toString() : '');
            setWeight(profile.weight ? profile.weight.toString() : '');
            setBodyType(profile.body_type);
            setPersonalColor(profile.personal_color);
            setStylePreference(profile.style_preference || '');
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await updateProfile({
                height: height ? parseFloat(height) : null,
                weight: weight ? parseFloat(weight) : null,
                body_type: bodyType,
                personal_color: personalColor,
                style_preference: stylePreference,
            });
            setMessage('プロフィールを保存しました！');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage('保存に失敗しました。');
        } finally {
            setSaving(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">
                        プロフィール編集
                    </h1>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSave} className="space-y-8">

                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">基本情報</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">身長 (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="170"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="60"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Body Type */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">骨格タイプ</h2>
                        <div className="mb-4">
                            <BodyTypeSelector
                                value={bodyType as any}
                                onChange={(val) => setBodyType(val as any)}
                            />
                        </div>
                    </section>


                    {/* Personal Color */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">パーソナルカラー</h2>
                        <ColorSelector
                            value={personalColor as any}
                            onChange={(val) => setPersonalColor(val as any)}
                        />
                    </section>

                    {/* Style Preference */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">好みのスタイル</h2>
                        <textarea
                            value={stylePreference}
                            onChange={(e) => setStylePreference(e.target.value)}
                            placeholder="例：カジュアル、ミニマリスト、ストリート系など"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 focus:outline-none h-24 resize-none"
                        />
                    </section>

                    {/* Submit */}
                    <div className="sticky bottom-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg shadow-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            {saving ? '保存中...' : 'プロフィールを保存'}
                        </button>
                        {message && (
                            <div className="absolute -top-14 left-0 right-0 py-2 px-4 bg-green-100 text-green-800 text-center rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                                {message}
                            </div>
                        )}
                    </div>

                </form>
            </main>
        </div>
    );
}
