'use client'

import Link from 'next/link';

export const LandingHeader = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center">
                        <img src="/ticlog-logo.png" alt="Ticlog" className="h-8" />
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                    >
                        ログイン
                    </Link>
                </div>
            </div>
        </header>
    );
};
