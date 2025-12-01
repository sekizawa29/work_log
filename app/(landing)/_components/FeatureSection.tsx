'use client'

import { Clock, BarChart3, Users, Zap } from 'lucide-react';

const features = [
    {
        icon: Clock,
        title: 'シンプルな時間記録',
        description: 'ワンクリックでタイマーを開始。タスク名とクライアントを選んですぐに記録を始められます。',
    },
    {
        icon: BarChart3,
        title: '詳細な分析',
        description: 'クライアント別・タスク別の作業時間を可視化。日別・週別・月別のレポートで生産性を把握。',
    },
    {
        icon: Users,
        title: 'クライアント管理',
        description: '複数のクライアントやプロジェクトを簡単に管理。色分けで一目で識別できます。',
    },
    {
        icon: Zap,
        title: 'ゴールタイマー',
        description: '目標時間を設定してタイマーを開始。残り時間をカウントダウンで表示。',
    },
];

export const FeatureSection = () => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                        機能紹介
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Ticlogは、フリーランサーやリモートワーカーのための
                        シンプルで使いやすい時間管理ツールです。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <feature.icon className="w-7 h-7 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
