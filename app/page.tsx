'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Add router
import { ProductForm } from '@/components/ProductForm';
import { ClosetGrid } from '@/components/ClosetGrid';
import { Settings } from 'lucide-react'; // Import icon

export default function Home() {
  const router = useRouter(); // Initialize router
  const [refreshKey, setRefreshKey] = useState(0);

  const handleItemAdded = () => {
    // Increment key to trigger re-fetch in ClosetGrid
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            My Closet <span className="text-gray-400 font-normal text-sm ml-2">UNIQLO & GU</span>
          </h1>
          <button
            onClick={() => router.push('/profile')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            aria-label="プロフィール設定"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <ProductForm onItemAdded={handleItemAdded} />

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">登録アイテム</h2>
          <ClosetGrid keyTrigger={refreshKey} />
        </div>
      </main>
    </div>
  );
}
