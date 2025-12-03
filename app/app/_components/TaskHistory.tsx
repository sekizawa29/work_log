'use client'

import { useState, useEffect, useMemo } from 'react';
import { Trash2, Clock, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import type { TimeEntry, Client } from '@/types';
import { formatDuration, formatDateTime } from '@/utils/helpers';
import { EditEntryModal } from './EditEntryModal';

interface TaskHistoryProps {
    entries: TimeEntry[];
    clients: Client[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, startTime: number, endTime: number | null) => void;
    isPaused?: boolean;
    pausedAt?: number | null;
    totalPauseDuration?: number;
}

export const TaskHistory = ({ entries, clients, onDelete, onUpdate, isPaused = false, pausedAt = null, totalPauseDuration = 0 }: TaskHistoryProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [now, setNow] = useState(Date.now());
    const [visibleCount, setVisibleCount] = useState(5);

    // Update current time every second for active entries (but not when paused)
    const hasActiveEntry = entries.some(e => e.endTime === null);
    useEffect(() => {
        if (!hasActiveEntry || isPaused) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [hasActiveEntry, isPaused]);

    const getEntryDuration = (entry: TimeEntry): number => {
        if (entry.endTime === null) {
            const effectiveNow = isPaused && pausedAt ? pausedAt : now;
            const rawElapsed = Math.floor((effectiveNow - entry.startTime) / 1000);
            return Math.max(0, rawElapsed - totalPauseDuration);
        }
        return entry.duration;
    };

    const handleEditClick = (entry: TimeEntry) => {
        setEditingEntry(entry);
        setIsEditModalOpen(true);
    };

    const toggleClient = (clientId: string) => {
        setExpandedClients(prev => {
            const next = new Set(prev);
            if (next.has(clientId)) {
                next.delete(clientId);
            } else {
                next.add(clientId);
            }
            return next;
        });
    };

    const toggleTask = (taskKey: string) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskKey)) {
                next.delete(taskKey);
            } else {
                next.add(taskKey);
            }
            return next;
        });
    };

    // Group entries by client, then by task
    const clientTaskGroups = useMemo(() => {
        return clients.map(client => {
            const clientEntries = entries.filter(e => e.clientId === client.id);
            const taskMap = clientEntries.reduce((acc, entry) => {
                if (!acc[entry.taskName]) {
                    acc[entry.taskName] = {
                        taskName: entry.taskName,
                        totalDuration: 0,
                        entries: [],
                        hasActiveEntry: false,
                        latestUpdate: 0,
                    };
                }
                acc[entry.taskName].totalDuration += getEntryDuration(entry);
                acc[entry.taskName].entries.push(entry);
                // 最新の更新時刻を追跡（endTimeがnullなら進行中なので最大値）
                const entryTime = entry.endTime ?? Number.MAX_SAFE_INTEGER;
                if (entryTime > acc[entry.taskName].latestUpdate) {
                    acc[entry.taskName].latestUpdate = entryTime;
                }
                if (entry.endTime === null) {
                    acc[entry.taskName].hasActiveEntry = true;
                }
                return acc;
            }, {} as Record<string, { taskName: string; totalDuration: number; entries: TimeEntry[]; hasActiveEntry: boolean; latestUpdate: number }>);

            // タスクを更新順にソート
            const tasks = Object.values(taskMap).sort((a, b) => b.latestUpdate - a.latestUpdate);
            const totalDuration = tasks.reduce((sum, t) => sum + t.totalDuration, 0);
            const hasActiveEntry = tasks.some(t => t.hasActiveEntry);
            // クライアントの最新更新時刻
            const latestUpdate = tasks.length > 0 ? tasks[0].latestUpdate : 0;

            return {
                clientId: client.id,
                clientName: client.name,
                clientColor: client.color || '#0ea5e9',
                tasks,
                totalDuration,
                hasActiveEntry,
                latestUpdate,
            };
        }).filter(g => g.totalDuration > 0).sort((a, b) => b.latestUpdate - a.latestUpdate);
    }, [clients, entries, now, isPaused, pausedAt, totalPauseDuration]);

    // Expand clients and tasks with active entries
    useEffect(() => {
        clientTaskGroups.forEach(group => {
            if (group.hasActiveEntry) {
                setExpandedClients(prev => {
                    const next = new Set(prev);
                    next.add(group.clientId);
                    return next;
                });
                group.tasks.forEach(task => {
                    if (task.hasActiveEntry) {
                        setExpandedTasks(prev => {
                            const next = new Set(prev);
                            next.add(`${group.clientId}-${task.taskName}`);
                            return next;
                        });
                    }
                });
            }
        });
    }, [entries]);

    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                作業履歴
            </h2>

            {entries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p>まだ記録がありません</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {clientTaskGroups.slice(0, visibleCount).map((group) => (
                        <div key={group.clientId} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                            <button
                                onClick={() => toggleClient(group.clientId)}
                                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedClients.has(group.clientId) ? (
                                        <ChevronDown size={20} className="text-slate-400" />
                                    ) : (
                                        <ChevronRight size={20} className="text-slate-400" />
                                    )}
                                    <div
                                        className={`w-4 h-4 rounded-full ${group.hasActiveEntry ? 'animate-pulse-glow' : ''}`}
                                        style={{ backgroundColor: group.clientColor }}
                                    />
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{group.clientName}</h4>
                                        <p className="text-xs text-slate-500">{group.tasks.length} 件の案件</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary-600">
                                        {formatDuration(group.totalDuration)}
                                    </div>
                                </div>
                            </button>

                            <div className={`accordion-content ${expandedClients.has(group.clientId) ? 'expanded' : ''}`}>
                                <div>
                                    <div className={`bg-slate-50 p-3 space-y-2 ${expandedClients.has(group.clientId) ? 'border-t border-slate-100' : ''}`}>
                                        {group.tasks.map((task) => {
                                            const taskKey = `${group.clientId}-${task.taskName}`;
                                            return (
                                                <div key={taskKey} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                                    <button
                                                        onClick={() => toggleTask(taskKey)}
                                                        className="w-full flex justify-between items-center p-3 hover:bg-slate-50 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {expandedTasks.has(taskKey) ? (
                                                                <ChevronDown size={16} className="text-slate-400" />
                                                            ) : (
                                                                <ChevronRight size={16} className="text-slate-400" />
                                                            )}
                                                            <span className={`text-sm text-slate-700 ${task.hasActiveEntry ? 'font-semibold' : ''}`}>
                                                                {task.taskName}
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-slate-800">{formatDuration(task.totalDuration)}</span>
                                                    </button>

                                                    <div className={`accordion-content ${expandedTasks.has(taskKey) ? 'expanded' : ''}`}>
                                                        <div>
                                                            <div className={`bg-slate-50 p-2 space-y-1 ${expandedTasks.has(taskKey) ? 'border-t border-slate-100' : ''}`}>
                                                                {task.entries.map((entry) => (
                                                                    <div
                                                                        key={entry.id}
                                                                        className="flex justify-between items-center bg-white rounded-lg p-2 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="text-xs text-slate-500">
                                                                            {formatDateTime(entry.startTime)}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <div className="text-sm font-medium text-slate-600 mr-1">
                                                                                {formatDuration(getEntryDuration(entry))}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleEditClick(entry)}
                                                                                className="text-slate-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                                                                                title="編集"
                                                                            >
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => onDelete(entry.id)}
                                                                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                                                title="削除"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* More Button */}
                    {clientTaskGroups.length > visibleCount && (
                        <button
                            onClick={() => setVisibleCount(prev => prev + 5)}
                            className="w-full py-4 flex items-center justify-center gap-3 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <span className="w-12 h-0.5 bg-slate-300 rounded-full"></span>
                            <span className="text-sm font-bold tracking-widest">more</span>
                            <span className="w-12 h-0.5 bg-slate-300 rounded-full"></span>
                        </button>
                    )}
                </div>
            )}

            <EditEntryModal
                key={editingEntry ? editingEntry.id : 'closed'}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                entry={editingEntry}
                onSave={onUpdate}
            />
        </div>
    );
};
