'use client'

interface CTASectionProps {
    onSignupClick: () => void;
}

export const CTASection = ({ onSignupClick }: CTASectionProps) => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="glass-card p-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                        今すぐ始めよう
                    </h2>
                    <p className="text-slate-500 mb-8">
                        アカウントを作成して、あなたの時間を効率的に管理しましょう。
                        無料で始められます。
                    </p>
                    <button
                        onClick={onSignupClick}
                        className="btn-primary text-lg px-8 py-4"
                    >
                        無料で始める
                    </button>
                </div>
            </div>
        </section>
    );
};
