import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const { profile, weather, apiKey } = await request.json();

        const keyToUse = apiKey || process.env.GEMINI_API_KEY;
        if (!keyToUse) {
            return NextResponse.json({
                error: 'プロフィール画面からGemini APIキーを設定してください。',
                mock: true
            }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(keyToUse);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 1. Fetch all closet items
        const { data: items, error } = await supabase
            .from('closet_items')
            .select('*');

        if (error || !items || items.length === 0) {
            return NextResponse.json({ error: 'クローゼットにアイテムがありません' }, { status: 400 });
        }

        // Build weather context
        const weatherContext = weather
            ? `\n    現在の天気: ${weather.weatherEmoji} ${weather.weatherLabel}、気温 ${weather.temperature}°C（最高 ${weather.maxTemp}°C / 最低 ${weather.minTemp}°C）\n    天気に適した服装も考慮してください。`
            : '';

        const genderContext = profile.gender === 'man' ? '男性向け'
            : profile.gender === 'woman' ? '女性向け'
                : profile.gender === 'other' ? 'ユニセックス/指定なし'
                    : '指定なし';

        // 2. Construct Prompt
        const prompt = `
    あなたはプロのファッションスタイリストです。
    ユーザープロフィール:
    - 希望スタイル性別: ${genderContext}
    - 身長: ${profile.height}cm
    - 骨格タイプ: ${profile.body_type}
    - パーソナルカラー: ${profile.personal_color}
    - 好みのスタイル: ${profile.style_preference}
    ${weatherContext}

    クローゼット内のアイテム (JSON):
    ${JSON.stringify(items.map(i => ({ id: i.id, name: i.name, brand: i.brand, image: i.image_url, category: i.category, color: i.color })))}

    タスク:
    ユーザーのプロフィールと所持アイテムに基づき、3つの異なるコーディネートを提案してください。
    ${weather ? '今日の天気・気温も考慮した実用的なコーデにしてください。' : ''}
    各コーディネートには、トップスとボトムス（必要に応じてアウターなど）を選択してください。
    なぜその組み合わせがユーザーの骨格タイプやパーソナルカラーに合うのか、具体的かつポジティブに日本語で解説してください。

    レスポンス形式 (JSONのみ):
    {
      "outfits": [
        {
          "title": "リラックスした休日の装い",
          "item_ids": ["id1", "id2"],
          "explanation": "この組み合わせは骨格ウェーブのあなたの華奢な上半身を..."
        }
      ]
    }
    `;

        // 3. Call AI
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const text = response.text();
        const json = JSON.parse(text);

        // 4. Map back to full item objects
        const outfits = json.outfits.map((outfit: any) => ({
            ...outfit,
            items: outfit.item_ids.map((id: string) => items.find(i => i.id === id)).filter(Boolean)
        }));

        return NextResponse.json({ outfits });

    } catch (err: any) {
        console.error('AI Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
