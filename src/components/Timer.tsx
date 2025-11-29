import { useState, useEffect } from 'react';
import { Play, Square, ArrowLeftRight } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

type TimerMode = 'free' | 'goal';

interface TimerProps {
    isActive: boolean;
    startTime: number | null;
    taskName: string;
    onStart: () => void;
    onStop: () => void;
    targetDuration?: number;
    timerMode: TimerMode;
    onModeChange: (mode: TimerMode) => void;
    targetSeconds: number;
    onTargetSecondsChange: (seconds: number) => void;
}

export const Timer = ({
    isActive,
    startTime,
    taskName,
    targetDuration,
    onStart,
    onStop,
    timerMode,
    onModeChange,
    targetSeconds,
    onTargetSecondsChange,
}: TimerProps) => {
    const elapsed = useTimer(isActive, startTime);

    // Input state for goal timer editing
    const [inputHours, setInputHours] = useState('00');
    const [inputMinutes, setInputMinutes] = useState('00');
    const [inputSeconds, setInputSeconds] = useState('00');

    // Sync input fields with targetSeconds when it changes externally
    useEffect(() => {
        if (!isActive && timerMode === 'goal') {
            const h = Math.floor(targetSeconds / 3600);
            const m = Math.floor((targetSeconds % 3600) / 60);
            const s = targetSeconds % 60;
            setInputHours(String(h).padStart(2, '0'));
            setInputMinutes(String(m).padStart(2, '0'));
            setInputSeconds(String(s).padStart(2, '0'));
        }
    }, [targetSeconds, isActive, timerMode]);

    // Update parent when input changes
    const updateTargetFromInputs = (h: string, m: string, s: string) => {
        const hours = parseInt(h, 10) || 0;
        const minutes = parseInt(m, 10) || 0;
        const seconds = parseInt(s, 10) || 0;
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        onTargetSecondsChange(totalSeconds);
    };

    const handleHoursChange = (value: string) => {
        const numValue = value.replace(/\D/g, '').slice(0, 2);
        setInputHours(numValue);
        updateTargetFromInputs(numValue, inputMinutes, inputSeconds);
    };

    const handleMinutesChange = (value: string) => {
        const numValue = value.replace(/\D/g, '').slice(0, 2);
        const clamped = Math.min(parseInt(numValue, 10) || 0, 59);
        const formatted = String(clamped).padStart(2, '0');
        setInputMinutes(numValue.length === 0 ? '' : formatted);
        updateTargetFromInputs(inputHours, numValue, inputSeconds);
    };

    const handleSecondsChange = (value: string) => {
        const numValue = value.replace(/\D/g, '').slice(0, 2);
        const clamped = Math.min(parseInt(numValue, 10) || 0, 59);
        const formatted = String(clamped).padStart(2, '0');
        setInputSeconds(numValue.length === 0 ? '' : formatted);
        updateTargetFromInputs(inputHours, inputMinutes, numValue);
    };

    const handleInputBlur = (type: 'hours' | 'minutes' | 'seconds') => {
        // Pad with zeros on blur
        if (type === 'hours') {
            setInputHours(String(parseInt(inputHours, 10) || 0).padStart(2, '0'));
        } else if (type === 'minutes') {
            setInputMinutes(String(Math.min(parseInt(inputMinutes, 10) || 0, 59)).padStart(2, '0'));
        } else {
            setInputSeconds(String(Math.min(parseInt(inputSeconds, 10) || 0, 59)).padStart(2, '0'));
        }
    };

    // Calculate display values
    let displaySeconds = 0;
    let displayMinutes = 0;
    let displayHours = 0;
    let isOvertime = false;
    let progress = 0;
    let colorState: 'normal' | 'warning' | 'danger' = 'normal';

    if (targetDuration) {
        const remaining = targetDuration - elapsed;
        isOvertime = remaining < 0;
        const absRemaining = Math.abs(remaining);

        displaySeconds = Math.floor(absRemaining % 60);
        displayMinutes = Math.floor((absRemaining / 60) % 60);
        displayHours = Math.floor(absRemaining / 3600);

        progress = Math.max(0, Math.min(100, (remaining / targetDuration) * 100));

        if (isOvertime || remaining < targetDuration * 0.3) {
            colorState = 'danger';
        } else if (remaining <= targetDuration * 0.7) {
            colorState = 'warning';
        }
    } else {
        displaySeconds = Math.floor(elapsed % 60);
        displayMinutes = Math.floor((elapsed / 60) % 60);
        displayHours = Math.floor(elapsed / 3600);
        progress = (displaySeconds / 60) * 100;
    }

    // Progress ring calculations
    const radius = 120;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getGradientColors = () => {
        switch (colorState) {
            case 'danger':
                return (
                    <>
                        <stop offset="0%" stopColor="#fca5a5" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </>
                );
            case 'warning':
                return (
                    <>
                        <stop offset="0%" stopColor="#fdba74" />
                        <stop offset="100%" stopColor="#f97316" />
                    </>
                );
            default:
                return (
                    <>
                        <stop offset="0%" stopColor="#bae6fd" />
                        <stop offset="40%" stopColor="#7dd3fc" />
                        <stop offset="70%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                    </>
                );
        }
    };

    // Check if goal mode is editable (not active and in goal mode)
    const isGoalEditable = !isActive && timerMode === 'goal';

    // Render editable time input for goal mode
    const renderEditableTime = () => (
        <div className="flex items-center font-bold text-slate-700">
            <input
                type="text"
                value={inputHours}
                onChange={(e) => handleHoursChange(e.target.value)}
                onBlur={() => handleInputBlur('hours')}
                className="w-14 text-center text-5xl bg-transparent focus:outline-none focus:bg-slate-100 rounded-lg transition-colors"
                placeholder="00"
            />
            <span className="text-5xl">:</span>
            <input
                type="text"
                value={inputMinutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                onBlur={() => handleInputBlur('minutes')}
                className="w-14 text-center text-5xl bg-transparent focus:outline-none focus:bg-slate-100 rounded-lg transition-colors"
                placeholder="00"
            />
            <span className="text-5xl">:</span>
            <input
                type="text"
                value={inputSeconds}
                onChange={(e) => handleSecondsChange(e.target.value)}
                onBlur={() => handleInputBlur('seconds')}
                className="w-14 text-center text-5xl bg-transparent focus:outline-none focus:bg-slate-100 rounded-lg transition-colors"
                placeholder="00"
            />
        </div>
    );

    // Render normal time display
    const renderTimeDisplay = () => (
        <div className={`font-bold tracking-tight ${isOvertime ? 'text-red-500' : 'text-slate-700'}`}>
            {isOvertime && <span className="text-4xl mr-1">-</span>}
            {displayHours > 0 ? (
                <span className="text-5xl">{String(displayHours).padStart(2, '0')}:{String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}</span>
            ) : displayMinutes > 0 ? (
                <>
                    <span className="text-6xl">{String(displayMinutes).padStart(2, '0')}</span>
                    <span className="text-4xl">:{String(displaySeconds).padStart(2, '0')}</span>
                </>
            ) : (
                <span className="text-7xl">{String(displaySeconds).padStart(2, '0')}</span>
            )}
        </div>
    );

    return (
        <div className="glass-card p-8 mb-6 relative">
            {/* Mode Selector - Top Left */}
            {!isActive && (
                <div className="absolute top-4 left-4">
                    <button
                        onClick={() => onModeChange(timerMode === 'free' ? 'goal' : 'free')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ArrowLeftRight size={18} />
                        <span className="text-lg font-bold">
                            {timerMode === 'free' ? 'フリータイマー' : 'ゴールタイマー'}
                        </span>
                    </button>
                </div>
            )}

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
                                {getGradientColors()}
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
                        {isGoalEditable ? renderEditableTime() : renderTimeDisplay()}
                        <div className={`text-sm font-medium tracking-widest mt-1 ${isOvertime ? 'text-red-400' : 'text-slate-400'}`}>
                            {isGoalEditable ? 'SET TIME' : targetDuration ? (isOvertime ? 'OVERTIME' : 'REMAINING') : (displayHours > 0 ? 'HOURS' : displayMinutes > 0 ? 'MINUTES' : 'SECONDS')}
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
                            disabled={!taskName || (timerMode === 'goal' && targetSeconds === 0)}
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
