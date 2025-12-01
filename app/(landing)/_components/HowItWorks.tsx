'use client'

const steps = [
    {
        number: '01',
        title: 'タスクを入力',
        description: '作業内容とクライアントを選択します',
    },
    {
        number: '02',
        title: 'タイマー開始',
        description: 'スタートボタンを押して記録を開始',
    },
    {
        number: '03',
        title: '記録を確認',
        description: '作業履歴と分析で生産性を可視化',
    },
];

export const HowItWorks = () => {
    return (
        <section className="py-20 px-4 bg-white/50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                        使い方
                    </h2>
                    <p className="text-slate-500">
                        3ステップで簡単に時間管理を始められます
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="text-center">
                            <div className="text-5xl font-bold text-primary-200 mb-4">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                {step.title}
                            </h3>
                            <p className="text-slate-500">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
