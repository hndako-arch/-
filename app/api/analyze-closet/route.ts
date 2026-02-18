import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { serverConfig } from '@/lib/server-config';

const genAI = new GoogleGenerativeAI(serverConfig.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST() {
    try {
        if (!serverConfig.geminiApiKey) {
            return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 });
        }

        const { data: items, error } = await supabase
            .from('closet_items')
            .select('*');

        if (error || !items || items.length === 0) {
            return NextResponse.json({ error: 'クローゼットにアイテムがありません' }, { status: 400 });
        }

        const prompt = `
あなたはファッションアナリストです。

以下はユーザーのクローゼットの全アイテムです：
${JSON.stringify(items.map(i => ({ name: i.name, brand: i.brand, category: i.category, color: i.color })))}

タスク：
クローゼットの内容を分析し、以下を日本語で回答してください。

1. **カテゴリバランス**: 各カテゴリ（トップス、ボトムス、アウター等）の数と比率を分析し、バランスが良いか評価
2. **カラーバランス**: 色の偏りを分析し、足りない色を提案
3. **不足アイテム**: 着回し力を上げるために買い足すべきアイテムを3つ具体的に提案（カテゴリ、色、アイテム名を含む）
4. **全体評価**: クローゼット全体の強みと改善点をまとめる

レスポンス形式 (JSONのみ):
{
  "categoryBalance": { "summary": "...", "details": [{"category": "トップス", "count": 5, "percentage": 50}] },
  "colorBalance": { "summary": "...", "missingColors": ["白", "ベージュ"] },
  "recommendations": [
    { "itemName": "白のクルーネックTシャツ", "category": "トップス", "reason": "..." }
  ],
  "overallScore": 75,
  "overallComment": "..."
}
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        const text = response.text();
        const json = JSON.parse(text);

        return NextResponse.json(json);

    } catch (err: any) {
        console.error('Analyze error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
