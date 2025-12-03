'use client'

import { useState, useEffect } from 'react';
import { Timer } from './Timer';
import { TaskInput } from './TaskInput';
import { ManualEntryForm } from './ManualEntryForm';
import { TaskHistory } from './TaskHistory';
import { Analytics } from './Analytics';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { Clock, BarChart3, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { AppMode } from './ModeSelector';

type Tab = 'timer' | 'analytics';
type TimerMode = 'free' | 'goal';
type InputMode = 'timer' | 'manual';

const PENDING_TIMER_KEY = 'ticlog_pending_timer';

interface PendingTimer {
    taskName: string;
    clientId: string;
    duration: number;
    timestamp: number;
}

interface AppContentProps {
    user: User;
}

export const AppContent = ({ user }: AppContentProps) => {
    const router = useRouter();
    const supabase = createClient();

    const {
        entries,
        clients,
        activeEntry,
        recentTaskNames,
        addClient,
        startTimer,
        stopTimer,

        deleteEntry,
        deleteClient,
        updateEntry,
        addManualEntry,
    } = useTimeTracking(user.id);

    const [activeTab, setActiveTab] = useState<Tab>('timer');
    const [inputMode, setInputMode] = useState<InputMode>('timer');
    const [taskName, setTaskName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [timerMode, setTimerMode] = useState<TimerMode>('free');
    const [targetSeconds, setTargetSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [pausedAt, setPausedAt] = useState<number | null>(null);
    const [totalPauseDuration, setTotalPauseDuration] = useState(0);

    // Check for pending timer from landing page
    useEffect(() => {
        const pendingTimerStr = localStorage.getItem(PENDING_TIMER_KEY);
        if (pendingTimerStr) {
            try {
                const pendingTimer: PendingTimer = JSON.parse(pendingTimerStr);
                // Only use if less than 1 hour old
                if (Date.now() - pendingTimer.timestamp < 3600000) {
                    setTaskName(pendingTimer.taskName);
                    // Note: clientId from landing page is local, need to handle
                    // For now, just set the task name
                }
                localStorage.removeItem(PENDING_TIMER_KEY);
            } catch (e) {
                localStorage.removeItem(PENDING_TIMER_KEY);
            }
        }
    }, []);

    // Sync taskName with activeEntry
    useEffect(() => {
        if (activeEntry) {
            setTaskName(activeEntry.taskName);
            setSelectedClientId(activeEntry.clientId);
        }
    }, [activeEntry]);

    const handleStart = async () => {
        if (!taskName || !selectedClientId) return;
        const target = timerMode === 'goal' ? targetSeconds : undefined;
        await startTimer(taskName, selectedClientId, target);
    };

    const handleStop = async () => {
        await stopTimer(totalPauseDuration);
        setTaskName('');
        setSelectedClientId('');
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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleManualEntry = async (startTime: number, endTime: number, dateStr: string) => {
        if (!taskName || !selectedClientId) {
            alert('タスク名とクライアントを選択してください');
            return;
        }

        await addManualEntry(taskName, selectedClientId, startTime, endTime, dateStr);
        setTaskName('');
        setSelectedClientId('');
        // Stay in manual mode - don't switch back to timer
    };

    const handleModeSelect = (mode: AppMode) => {
        if (mode === 'manual') {
            setInputMode('manual');
        } else {
            setInputMode('timer');
            setTimerMode(mode);
        }
    };

    const isTimerActive = !!activeEntry;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <img src="/ticlog-logo.png" alt="Ticlog" className="h-8" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="text-sm">ログアウト</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-6 gap-2">
                    <button
                        onClick={() => setActiveTab('timer')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'timer'
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-[#FBFDFF] text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <Clock size={18} />
                        タイマー
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${activeTab === 'analytics'
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-[#FBFDFF] text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <BarChart3 size={18} />
                        分析
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'timer' ? (
                    <>
                        <TaskInput
                            clients={clients}
                            onAddClient={addClient}
                            taskName={taskName}
                            selectedClientId={selectedClientId}
                            onTaskNameChange={setTaskName}
                            onClientChange={setSelectedClientId}
                            disabled={isTimerActive}
                            recentTaskNames={recentTaskNames}
                            onDeleteClient={deleteClient}
                        />

                        {inputMode === 'timer' ? (
                            <Timer
                                isActive={isTimerActive}
                                startTime={activeEntry?.startTime ?? null}
                                taskName={taskName}
                                targetDuration={timerMode === 'goal' && isTimerActive ? activeEntry?.targetDuration : undefined}
                                onStart={handleStart}
                                onStop={handleStop}
                                timerMode={timerMode}
                                onModeChange={setTimerMode}
                                onModeSelect={handleModeSelect}
                                targetSeconds={targetSeconds}
                                onTargetSecondsChange={setTargetSeconds}
                                isPaused={isPaused}
                                pausedAt={pausedAt}
                                totalPauseDuration={totalPauseDuration}
                                onPause={handlePause}
                                onResume={handleResume}
                            />
                        ) : (
                            <ManualEntryForm
                                onAddEntry={handleManualEntry}
                                onModeSelect={handleModeSelect}
                                taskName={taskName}
                                selectedClientId={selectedClientId}
                            />
                        )}
                        <TaskHistory
                            entries={entries}
                            clients={clients}
                            onDelete={deleteEntry}
                            onUpdate={updateEntry}
                            isPaused={isPaused}
                            pausedAt={pausedAt}
                            totalPauseDuration={totalPauseDuration}
                        />
                    </>
                ) : (
                    <Analytics
                        entries={entries}
                        clients={clients}
                        isPaused={isPaused}
                        pausedAt={pausedAt}
                        totalPauseDuration={totalPauseDuration}
                    />
                )}
            </div>
        </div>
    );
};
