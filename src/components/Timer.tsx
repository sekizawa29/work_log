import { Play, Square } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { formatDuration } from '../utils/helpers';

interface TimerProps {
    isActive: boolean;
    startTime: number | null;
    taskName: string;
    onStart: () => void;
    onStop: () => void;
}

export const Timer = ({ isActive, startTime, taskName, onStart, onStop }: TimerProps) => {
    const elapsed = useTimer(isActive, startTime);

    return (
        <div className="glass-card p-8 mb-6 flex flex-col items-center">
            {/* Breathing Circle Timer */}
            <div className="relative mb-8 mt-4">
                {/* Outer Glow Ring */}
                <div
                    className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 ${isActive
                            ? 'bg-white/40 border-4 border-primary-400 animate-breathe'
                            : 'bg-white/20 border-4 border-slate-200'
                        }`}
                >
                    {/* Inner Content */}
                    <div className="text-center z-10">
                        <div className={`text-6xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                            {formatDuration(elapsed)}
                        </div>
                        {isActive && (
                            <div className="mt-2 text-primary-600 font-medium animate-pulse flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                <span>Flow State</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative Ring (Optional) */}
                {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-ping opacity-20"></div>
                )}
            </div>

            <div className="text-center w-full max-w-md">
                {taskName && (
                    <div className="text-slate-600 text-lg font-medium mb-6 truncate px-4">
                        {taskName}
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    {!isActive ? (
                        <button
                            onClick={onStart}
                            disabled={!taskName}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg px-8 py-4 rounded-2xl"
                        >
                            <Play size={24} fill="currentColor" />
                            <span>開始</span>
                        </button>
                    ) : (
                        <button
                            onClick={onStop}
                            className="bg-white/80 backdrop-blur text-red-500 border-2 border-red-100 font-medium px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-red-50 hover:border-red-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
                        >
                            <Square size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                            <span>停止</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
