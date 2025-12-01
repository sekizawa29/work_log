'use client'

import { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, Pause } from 'lucide-react';
import type { Client } from '@/types';

const DEFAULT_CLIENTS: Client[] = [
    { id: 'personal', name: '個人', color: '#0ea5e9' },
    { id: 'work', name: '仕事', color: '#10b981' },
    { id: 'study', name: '勉強', color: '#f59e0b' },
    { id: 'other', name: 'その他', color: '#8b5cf6' },
];

interface HeroTimerProps {
    onTimerStop: (taskName: string, clientId: string, duration: number) => void;
}

export const HeroTimer = ({ onTimerStop }: HeroTimerProps) => {
    const [taskName, setTaskName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clients, setClients] = useState<Client[]>(DEFAULT_CLIENTS);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const clientWrapperRef = useRef<HTMLDivElement>(null);

    // Timer state
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [pausedAt, setPausedAt] = useState<number | null>(null);
    const [totalPauseDuration, setTotalPauseDuration] = useState(0);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clientWrapperRef.current && !clientWrapperRef.current.contains(event.target as Node)) {
                setShowClientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Timer tick
    useEffect(() => {
        if (!isActive || !startTime || isPaused) return;

        const interval = setInterval(() => {
            const rawElapsed = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(Math.max(0, rawElapsed - totalPauseDuration));
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, startTime, isPaused, totalPauseDuration]);

    const handleStart = () => {
        if (!taskName || !selectedClientId) return;
        setIsActive(true);
        setStartTime(Date.now());
        setElapsed(0);
        setIsPaused(false);
        setPausedAt(null);
        setTotalPauseDuration(0);
    };

    const handlePause = () => {
        setIsPaused(true);
        setPausedAt(Date.now());
    };

    const handleResume = () => {
        if (pausedAt) {
            setTotalPauseDuration(prev => prev + Math.floor((Date.now() - pausedAt) / 1000));
        }
        setIsPaused(false);
        setPausedAt(null);
    };

    const handleStop = () => {
        const effectiveNow = isPaused && pausedAt ? pausedAt : Date.now();
        const rawElapsed = startTime ? Math.floor((effectiveNow - startTime) / 1000) : 0;
        const finalDuration = Math.max(0, rawElapsed - totalPauseDuration);

        onTimerStop(taskName, selectedClientId, finalDuration);

        // Reset timer
        setIsActive(false);
        setStartTime(null);
        setElapsed(0);
        setIsPaused(false);
        setPausedAt(null);
        setTotalPauseDuration(0);
    };

    const handleAddClient = () => {
        if (!newClientName.trim()) return;
        const colors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#6366f1', '#d946ef'];
        const newClient: Client = {
            id: `custom-${Date.now()}`,
            name: newClientName.trim(),
            color: colors[Math.floor(Math.random() * colors.length)],
        };
        setClients(prev => [...prev, newClient]);
        setSelectedClientId(newClient.id);
        setNewClientName('');
        setShowAddClient(false);
    };

    const selectedClient = clients.find(c => c.id === selectedClientId);

    // Format time display
    const displaySeconds = elapsed % 60;
    const displayMinutes = Math.floor((elapsed / 60) % 60);
    const displayHours = Math.floor(elapsed / 3600);

    // Progress ring calculations
    const radius = 120;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const progress = (displaySeconds / 60) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <section className="pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Task Input - Always visible, disabled when active */}
                <div className="glass-card p-6 mb-6 relative z-30">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                タスク名
                            </label>
                            <input
                                type="text"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                placeholder="何に取り組んでいますか？"
                                className="input-field w-full"
                                disabled={isActive}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                クライアント
                            </label>
                            <div className="flex gap-2">
                                <div ref={clientWrapperRef} className="relative flex-1">
                                    <div className={`relative transition-all duration-200 ${showClientDropdown ? 'z-20' : ''}`}>
                                        <button
                                            type="button"
                                            onClick={() => !isActive && setShowClientDropdown(!showClientDropdown)}
                                            className={`input-field w-full text-left relative z-10 flex items-center justify-between focus:border-slate-200 ${showClientDropdown ? 'rounded-b-none focus:ring-0 border-b-slate-200' : ''} ${!selectedClient ? 'text-slate-400' : 'text-slate-800'}`}
                                            disabled={isActive}
                                        >
                                            {selectedClient ? (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: selectedClient.color || '#0ea5e9' }}
                                                    />
                                                    {selectedClient.name}
                                                </div>
                                            ) : 'クライアントを選択'}
                                        </button>
                                        {showClientDropdown && !isActive && (
                                            <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-lg animate-fade-in overflow-hidden z-0">
                                                <div className="max-h-60 overflow-y-auto">
                                                    {clients.map((client) => (
                                                        <button
                                                            key={client.id}
                                                            className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-primary-50 text-slate-700 transition-colors border-t border-slate-100 first:border-t-0"
                                                            onClick={() => {
                                                                setSelectedClientId(client.id);
                                                                setShowClientDropdown(false);
                                                            }}
                                                        >
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: client.color || '#0ea5e9' }}
                                                            />
                                                            {client.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddClient(!showAddClient)}
                                    className="btn-secondary px-4"
                                    disabled={isActive}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {showAddClient && !isActive && (
                            <div className="flex gap-2 animate-in slide-in-from-top duration-200">
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    placeholder="新しいクライアント名"
                                    className="input-field flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddClient()}
                                />
                                <button onClick={handleAddClient} className="btn-primary">
                                    追加
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timer Display */}
                <div className="glass-card p-8 mb-6">
                    <div className="flex flex-col items-center">
                        {/* Circular Progress Timer */}
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <svg
                                className="absolute inset-0 -rotate-90"
                                width="100%"
                                height="100%"
                                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                            >
                                <circle
                                    cx={radius}
                                    cy={radius}
                                    r={normalizedRadius}
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth={strokeWidth}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="heroProgressGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#bae6fd" />
                                        <stop offset="40%" stopColor="#7dd3fc" />
                                        <stop offset="70%" stopColor="#38bdf8" />
                                        <stop offset="100%" stopColor="#0284c7" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx={radius}
                                    cy={radius}
                                    r={normalizedRadius}
                                    fill="none"
                                    stroke="url(#heroProgressGradient)"
                                    strokeWidth={strokeWidth}
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={isActive ? strokeDashoffset : circumference}
                                    className="transition-all duration-300"
                                />
                            </svg>

                            <div className="text-center z-10">
                                <div className="font-bold tracking-tight text-slate-700">
                                    {displayHours > 0 ? (
                                        <span className="text-5xl">
                                            {String(displayHours).padStart(2, '0')}:{String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
                                        </span>
                                    ) : displayMinutes > 0 ? (
                                        <>
                                            <span className="text-6xl">{String(displayMinutes).padStart(2, '0')}</span>
                                            <span className="text-4xl">:{String(displaySeconds).padStart(2, '0')}</span>
                                        </>
                                    ) : (
                                        <span className="text-7xl">{String(displaySeconds).padStart(2, '0')}</span>
                                    )}
                                </div>
                                <div className="text-sm font-medium tracking-widest mt-1 text-slate-400">
                                    {displayHours > 0 ? 'HOURS' : displayMinutes > 0 ? 'MINUTES' : 'SECONDS'}
                                </div>
                            </div>
                        </div>

                        {/* Task Name Display when active */}
                        {isActive && taskName && (
                            <div className="mt-4 text-slate-400 text-sm truncate max-w-full px-4">
                                {taskName}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center gap-4">
                            {!isActive ? (
                                <button
                                    onClick={handleStart}
                                    disabled={!taskName || !selectedClientId}
                                    className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                                >
                                    <Play size={24} fill="currentColor" className="ml-0.5" />
                                </button>
                            ) : (
                                <>
                                    {isPaused ? (
                                        <button
                                            onClick={handleResume}
                                            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                                        >
                                            <Play size={24} fill="currentColor" className="ml-0.5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePause}
                                            className="w-14 h-14 rounded-full bg-slate-100 hover:bg-amber-50 text-slate-400 hover:text-amber-500 border-2 border-slate-200 hover:border-amber-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                                        >
                                            <Pause size={20} fill="currentColor" />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleStop}
                                        className="w-14 h-14 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 border-2 border-slate-200 hover:border-red-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                                    >
                                        <Square size={20} fill="currentColor" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
