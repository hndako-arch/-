'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, Sparkles, Heart, CalendarDays, Search } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'クローゼット', href: '/', icon: Shirt },
        { label: 'カレンダー', href: '/calendar', icon: CalendarDays },
        { label: 'AIコーデ', href: '/recommend', icon: Sparkles },
        { label: '分析', href: '/analyze', icon: Search },
        { label: 'お気に入り', href: '/favorites', icon: Heart },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
