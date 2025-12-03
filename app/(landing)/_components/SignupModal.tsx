'use client'

import { useState, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = useMemo(() => createClient(), []);

    if (!isOpen) return null;

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/callback?next=/app`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="relative p-6 pb-4">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex justify-center mb-4">
                        <img src="/ticlog-logo.png" alt="Ticlog" className="h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-800">
                        記録を保存しましょう
                    </h2>
                    <p className="text-center text-slate-500 mt-2">
                        アカウントを作成して、作業時間を記録・分析
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 4.66c1.61 0 3.02.56 4.13 1.62L19.16 3.2C17.28 1.45 14.79 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Googleで続ける
                            </>
                        )}
                    </button>

                    <p className="text-xs text-slate-400 text-center mt-4">
                        続けることで、
                        <a href="#" className="text-primary-600 hover:underline">利用規約</a>
                        および
                        <a href="#" className="text-primary-600 hover:underline">プライバシーポリシー</a>
                        に同意したものとみなされます。
                    </p>
                </div>
            </div>
        </div>
    );
};
