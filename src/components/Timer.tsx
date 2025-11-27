import { Play, Square } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

interface TimerProps {
    isActive: boolean;
    startTime: number | null;
    taskName: string;
    onStart: () => void;
    onStop: () => void;
}

export const Timer = ({ isActive, startTime, taskName, onStart, onStop }: TimerProps) => {
    const elapsed = useTimer(isActive, startTime);

    const seconds = Math.floor(elapsed % 60);
    const minutes = Math.floor((elapsed / 60) % 60);
    const hours = Math.floor(elapsed / 3600);

    // Progress ring calculations
    const radius = 120;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Progress based on seconds (0-60)
    const progress = (seconds / 60) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="glass-card p-8 mb-6">
            <div className="flex flex-col items-center">
                {/* Circular Progress Timer */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* SVG Ring */}
                    <svg
                        className="absolute inset-0 -rotate-90"
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    >
                        {/* Background Ring */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={normalizedRadius}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />
                        {/* Gradient Definition */}
                        <defs>
                            <linearGradient id="progressGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#bae6fd" />
                                <stop offset="40%" stopColor="#7dd3fc" />
                                <stop offset="70%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#0284c7" />
                            </linearGradient>
                        </defs>
                        {/* Progress Ring */}
                        <circle
                            cx={radius}
                            cy={radius}
                            r={normalizedRadius}
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={isActive ? strokeDashoffset : circumference}
                            className="transition-all duration-300"
                        />
                    </svg>

                    {/* Center Content */}
                    <div className="text-center z-10">
                        <div className="text-slate-700 font-bold tracking-tight">
                            {hours > 0 ? (
                                <span className="text-5xl">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                            ) : minutes > 0 ? (
                                <>
                                    <span className="text-6xl">{String(minutes).padStart(2, '0')}</span>
                                    <span className="text-4xl">:{String(seconds).padStart(2, '0')}</span>
                                </>
                            ) : (
                                <span className="text-7xl">{String(seconds).padStart(2, '0')}</span>
                            )}
                        </div>
                        <div className="text-slate-400 text-sm font-medium tracking-widest mt-1">
                            {hours > 0 ? 'HOURS' : minutes > 0 ? 'MINUTES' : 'SECONDS'}
                        </div>
                    </div>
                </div>

                {/* Task Name */}
                {taskName && (
                    <div className="mt-4 text-slate-400 text-sm truncate max-w-full px-4">
                        {taskName}
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-6">
                    {!isActive ? (
                        <button
                            onClick={onStart}
                            disabled={!taskName}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                        >
                            <Play size={24} fill="currentColor" className="ml-0.5" />
                        </button>
                    ) : (
                        <button
                            onClick={onStop}
                            className="w-14 h-14 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 border-2 border-slate-200 hover:border-red-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                            <Square size={20} fill="currentColor" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
