'use client'

import { useState, useEffect } from 'react';
import { Save, Calendar, ArrowRight, Plus, Minus, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { ModeSelector, AppMode } from './ModeSelector';

interface ManualEntryFormProps {
    onAddEntry: (startTime: number, endTime: number, dateStr: string, comment?: string) => void;
    onModeSelect: (mode: AppMode) => void;
    taskName: string;
    selectedClientId: string;
    comment: string;
    onCommentChange: (comment: string) => void;
}

export const ManualEntryForm = ({ onAddEntry, onModeSelect, taskName, selectedClientId, comment, onCommentChange }: ManualEntryFormProps) => {
    const [date, setDate] = useState(formatDate(new Date()));
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    // Duration state (hours and minutes)
    const [inputHours, setInputHours] = useState('00');
    const [inputMinutes, setInputMinutes] = useState('00');

    const formatTimeForInput = (date: Date) => {
        return date.toTimeString().slice(0, 5);
    };

    // Initialize/reset times
    const resetToInitialState = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        setEndTime(formatTimeForInput(now));
        setStartTime(formatTimeForInput(now));
        setInputHours('00');
        setInputMinutes('00');
        setDate(formatDate(new Date()));
        setShowCustom(false);
    };

    // Initialize times on mount
    useEffect(() => {
        resetToInitialState();
    }, []);

    // Recalculate start time when duration changes
    const updateStartTimeFromDuration = (hours: number, minutes: number) => {
        if (!endTime) return;

        const [endH, endM] = endTime.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(endH, endM, 0, 0);

        const durationMs = (hours * 60 + minutes) * 60 * 1000;
        const startDate = new Date(endDate.getTime() - durationMs);
        setStartTime(formatTimeForInput(startDate));
    };

    // Increment/decrement handlers
    const incrementHours = () => {
        const h = Math.min((parseInt(inputHours, 10) || 0) + 1, 23);
        const newValue = String(h).padStart(2, '0');
        setInputHours(newValue);
        updateStartTimeFromDuration(h, parseInt(inputMinutes, 10) || 0);
    };

    const decrementHours = () => {
        const h = Math.max((parseInt(inputHours, 10) || 0) - 1, 0);
        const newValue = String(h).padStart(2, '0');
        setInputHours(newValue);
        updateStartTimeFromDuration(h, parseInt(inputMinutes, 10) || 0);
    };

    const incrementMinutes = () => {
        let m = (parseInt(inputMinutes, 10) || 0) + 5;
        let h = parseInt(inputHours, 10) || 0;
        if (m >= 60) {
            m = 0;
            h = Math.min(h + 1, 23);
            setInputHours(String(h).padStart(2, '0'));
        }
        const newValue = String(m).padStart(2, '0');
        setInputMinutes(newValue);
        updateStartTimeFromDuration(h, m);
    };

    const decrementMinutes = () => {
        let m = (parseInt(inputMinutes, 10) || 0) - 5;
        let h = parseInt(inputHours, 10) || 0;
        if (m < 0) {
            if (h > 0) {
                m = 55;
                h = h - 1;
                setInputHours(String(h).padStart(2, '0'));
            } else {
                m = 0;
            }
        }
        const newValue = String(m).padStart(2, '0');
        setInputMinutes(newValue);
        updateStartTimeFromDuration(h, m);
    };

    // Handle manual time input changes
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        setStartTime(newStart);

        // Recalculate duration
        if (endTime && newStart) {
            const [startH, startM] = newStart.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);

            let startMinutes = startH * 60 + startM;
            let endMinutes = endH * 60 + endM;

            if (endMinutes < startMinutes) {
                endMinutes += 24 * 60;
            }

            const totalMins = endMinutes - startMinutes;
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            setInputHours(String(h).padStart(2, '0'));
            setInputMinutes(String(m).padStart(2, '0'));
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = e.target.value;
        setEndTime(newEnd);

        // Recalculate start time based on current duration
        const h = parseInt(inputHours, 10) || 0;
        const m = parseInt(inputMinutes, 10) || 0;

        const [endH, endM] = newEnd.split(':').map(Number);
        const endDate = new Date();
        endDate.setHours(endH, endM, 0, 0);

        const durationMs = (h * 60 + m) * 60 * 1000;
        const startDate = new Date(endDate.getTime() - durationMs);
        setStartTime(formatTimeForInput(startDate));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !startTime || !endTime) return;

        const [year, month, day] = date.split('-').map(Number);
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startDate = new Date(year, month - 1, day, startH, startM);
        let endDate = new Date(year, month - 1, day, endH, endM);

        if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }

        onAddEntry(startDate.getTime(), endDate.getTime(), date, comment || undefined);

        // Reset to initial state after submission
        resetToInitialState();
    };

    const totalMinutes = (parseInt(inputHours, 10) || 0) * 60 + (parseInt(inputMinutes, 10) || 0);
    const isValid = totalMinutes > 0 && !!taskName && !!selectedClientId;

    return (
        <div className="glass-card p-8 mb-6 relative">
            {/* Mode Selector - Top Left */}
            <div className="absolute top-4 left-4">
                <ModeSelector
                    currentMode="manual"
                    onModeSelect={onModeSelect}
                />
            </div>

            <form onSubmit={handleSubmit}>
                {/* Duration Display - Center */}
                <div className="flex flex-col items-center pt-4">
                    <div className="flex items-center gap-1">
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={incrementHours}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                            <span className="text-7xl font-bold text-slate-700 w-24 text-center">{inputHours}</span>
                            <button
                                type="button"
                                onClick={decrementHours}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                        </div>
                        <span className="text-7xl font-bold text-slate-700">:</span>
                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={incrementMinutes}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                            <span className="text-7xl font-bold text-slate-700 w-24 text-center">{inputMinutes}</span>
                            <button
                                type="button"
                                onClick={decrementMinutes}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Comment Input */}
                    <div className="mt-6 w-full max-w-xs">
                        <div className="relative">
                            <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => onCommentChange(e.target.value)}
                                placeholder="コメントを入力"
                                maxLength={500}
                                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 placeholder:text-slate-400 transition-all"
                            />
                        </div>
                        {comment.length > 0 && (
                            <div className="text-xs text-slate-400 text-right mt-1">
                                {comment.length}/500
                            </div>
                        )}
                    </div>

                    {/* Custom Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowCustom(!showCustom)}
                        className="mt-4 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showCustom ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span>カスタム記録</span>
                    </button>

                    {/* Custom Date and Time Inputs */}
                    {showCustom && (
                        <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        日付
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="input-field w-full pl-9 py-2 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-end gap-2 md:col-span-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            開始
                                        </label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={handleStartTimeChange}
                                            className="input-field w-full py-2 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="pb-2 text-slate-300">
                                        <ArrowRight size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            終了
                                        </label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={handleEndTimeChange}
                                            className="input-field w-full py-2 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={!isValid}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                        >
                            <Save size={24} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
