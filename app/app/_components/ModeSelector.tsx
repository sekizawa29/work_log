'use client'

import { ArrowLeftRight } from 'lucide-react';

export type AppMode = 'free' | 'goal' | 'manual';

interface ModeSelectorProps {
    currentMode: AppMode;
    onModeSelect: (mode: AppMode) => void;
    disabled?: boolean;
}

const modes: AppMode[] = ['free', 'goal', 'manual'];

export const ModeSelector = ({ currentMode, onModeSelect, disabled = false }: ModeSelectorProps) => {
    const getLabel = (mode: AppMode) => {
        switch (mode) {
            case 'free': return 'フリータイマー';
            case 'goal': return 'ゴールタイマー';
            case 'manual': return '直接記録';
        }
    };

    const handleClick = () => {
        if (disabled) return;
        const currentIndex = modes.indexOf(currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        onModeSelect(modes[nextIndex]);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
        >
            <ArrowLeftRight size={18} />
            <span className="text-lg font-bold">
                {getLabel(currentMode)}
            </span>
        </button>
    );
};
