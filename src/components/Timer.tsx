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
        <div className="glass-card p-8 mb-6">
            <div className="text-center">
                <div className="mb-6">
                    <div className={`text-7xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2 ${isActive ? 'animate-pulse-slow' : ''}`}>
                        {formatDuration(elapsed)}
                    </div>
                    {taskName && (
                        <div className="text-slate-600 text-lg font-medium">
                            {taskName}
                        </div>
                    )}
                    {isActive && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-primary-600">
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                            <span>記録中...</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    {!isActive ? (
                        <button
                            onClick={onStart}
                            disabled={!taskName}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play size={20} />
                            <span>開始</span>
                        </button>
                    ) : (
                        <button
                            onClick={onStop}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <Square size={20} />
                            <span>停止</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
