'use client'

import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="py-12 px-4 border-t border-slate-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center">
                        <img src="/ticlog-logo.png" alt="Ticlog" className="h-6" />
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="#" className="hover:text-slate-700 transition-colors">
                            プライバシーポリシー
                        </Link>
                        <Link href="#" className="hover:text-slate-700 transition-colors">
                            利用規約
                        </Link>
                    </div>
                    <div className="text-sm text-slate-400">
                        © 2024 Ticlog. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};
