'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import type { TimeEntry, Client } from '@/types';
import { formatDuration, formatDateTime, formatDate } from '@/utils/helpers';
import { EditEntryModal } from './EditEntryModal';

type DateFilter = 'all' | 'today' | 'thisWeek' | 'lastWeek' | 'thisMonth';

interface AnalyticsProps {
    entries: TimeEntry[];
    clients: Client[];
    isPaused?: boolean;
    pausedAt?: number | null;
    totalPauseDuration?: number;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, startTime: number, endTime: number | null, comment?: string) => void;
}

const getDateRange = (filter: DateFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
        case 'all':
            return null;
        case 'today':
            return {
                start: today,
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            };
        case 'thisWeek': {
            const dayOfWeek = today.getDay();
            // 日曜始まりの週 (日曜日 = 0)
            const sunday = new Date(today);
            sunday.setDate(today.getDate() - dayOfWeek);
            const nextSunday = new Date(sunday);
            nextSunday.setDate(sunday.getDate() + 7);
            return { start: sunday, end: nextSunday };
        }
        case 'lastWeek': {
            const dayOfWeek = today.getDay();
            // 先週の日曜日
            const lastSunday = new Date(today);
            lastSunday.setDate(today.getDate() - dayOfWeek - 7);
            const thisSunday = new Date(lastSunday);
            thisSunday.setDate(lastSunday.getDate() + 7);
            return { start: lastSunday, end: thisSunday };
        }
        case 'thisMonth': {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            return { start: firstDay, end: lastDay };
        }
    }
};

const getDaysInRange = (filter: DateFilter): string[] => {
    const range = getDateRange(filter);
    if (!range) return [];

    const days: string[] = [];
    const current = new Date(range.start);
    while (current < range.end) {
        days.push(formatDate(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};

const filterLabels: Record<DateFilter, string> = {
    all: 'All',
    today: 'Today',
    thisWeek: 'Week',
    lastWeek: 'Last Week',
    thisMonth: 'Month',
};

export const Analytics = ({ entries, clients, isPaused = false, pausedAt = null, totalPauseDuration = 0, onDelete, onUpdate }: AnalyticsProps) => {
    const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth');
    const [now, setNow] = useState(Date.now());
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

    const handleEditClick = (entry: TimeEntry) => {
        setEditingEntry(entry);
        setIsEditModalOpen(true);
    };

    // Update current time every second for active entries (but not when paused)
    const hasActiveEntry = entries.some(e => e.endTime === null);
    React.useEffect(() => {
        if (!hasActiveEntry || !hasAnimated || isPaused) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [hasActiveEntry, hasAnimated, isPaused]);

    // Disable animation after initial render to prevent label flickering
    useEffect(() => {
        if (!hasAnimated) {
            const timer = setTimeout(() => {
                setHasAnimated(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [hasAnimated]);

    const getEntryDuration = (entry: TimeEntry): number => {
        if (entry.endTime === null) {
            const effectiveNow = isPaused && pausedAt ? pausedAt : now;
            const rawElapsed = Math.floor((effectiveNow - entry.startTime) / 1000);
            return Math.max(0, rawElapsed - totalPauseDuration);
        }
        return entry.duration;
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

    // Filter entries by date range
    const filteredEntries = useMemo(() => {
        const range = getDateRange(dateFilter);
        if (!range) return entries;

        return entries.filter(entry => {
            // Include active (in-progress) entries for "today" filter
            if (dateFilter === 'today' && entry.endTime === null) {
                return true;
            }
            const entryDate = new Date(entry.startTime);
            return entryDate >= range.start && entryDate < range.end;
        });
    }, [entries, dateFilter]);

    // Client distribution data
    const clientData = useMemo(() => clients.map(client => {
        const totalTime = filteredEntries
            .filter(e => e.clientId === client.id)
            .reduce((sum, e) => sum + getEntryDuration(e), 0);
        return {
            name: client.name,
            value: totalTime,
            color: client.color || '#0ea5e9',
        };
    }).filter(d => d.value > 0), [clients, filteredEntries, now]);

    // Group tasks by client
    const clientTaskGroups = useMemo(() => clients.map(client => {
        const clientEntries = filteredEntries.filter(e => e.clientId === client.id);
        const taskMap = clientEntries.reduce((acc, entry) => {
            if (!acc[entry.taskName]) {
                acc[entry.taskName] = { taskName: entry.taskName, totalDuration: 0, entryCount: 0, entries: [] as TimeEntry[] };
            }
            acc[entry.taskName].totalDuration += getEntryDuration(entry);
            acc[entry.taskName].entryCount += 1;
            acc[entry.taskName].entries.push(entry);
            return acc;
        }, {} as Record<string, { taskName: string; totalDuration: number; entryCount: number; entries: TimeEntry[] }>);

        const tasks = Object.values(taskMap)
            .map(task => ({
                ...task,
                entries: task.entries.sort((a, b) => b.startTime - a.startTime), // 新しい順
            }))
            .sort((a, b) => b.totalDuration - a.totalDuration);
        const totalDuration = tasks.reduce((sum, t) => sum + t.totalDuration, 0);

        return {
            clientId: client.id,
            clientName: client.name,
            clientColor: client.color || '#0ea5e9',
            tasks,
            totalDuration,
        };
    }).filter(g => g.totalDuration > 0).sort((a, b) => b.totalDuration - a.totalDuration), [clients, filteredEntries, now]);

    // Daily time data for bar chart
    const showBarChart = dateFilter !== 'all' && dateFilter !== 'today';
    const dailyData = useMemo(() => {
        if (!showBarChart) return [];

        const days = getDaysInRange(dateFilter);
        return days.map(date => {
            const dayTotal = filteredEntries
                .filter(e => e.date === date)
                .reduce((sum, e) => sum + getEntryDuration(e), 0);
            return {
                date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
                hours: Number((dayTotal / 3600).toFixed(1)),
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredEntries, dateFilter, showBarChart, now]);

    const totalHours = filteredEntries.reduce((sum, e) => sum + getEntryDuration(e), 0);

    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">分析</h2>

            {/* Date Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {(Object.keys(filterLabels) as DateFilter[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateFilter === filter
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {filterLabels[filter]}
                    </button>
                ))}
            </div>

            {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p>この期間のデータがありません</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary - Total Work Time */}
                    <div className="flex flex-col items-center py-6">
                        <div className="text-sm font-medium text-slate-400 tracking-wider uppercase mb-2">総作業時間</div>
                        <div className="text-5xl font-bold text-slate-700 tracking-tight">{formatDuration(totalHours)}</div>
                        <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full mt-4"></div>
                    </div>

                    {/* Charts */}
                    <div className={`grid grid-cols-1 ${showBarChart ? 'lg:grid-cols-2' : ''} gap-6`}>
                        {/* Pie Chart */}
                        {clientData.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">クライアント別時間配分</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={clientData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            animationDuration={1000}
                                            isAnimationActive={!hasAnimated}
                                        >
                                            {clientData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatDuration(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Bar Chart */}
                        {showBarChart && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">日別の作業時間</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" stroke="#64748b" />
                                        <YAxis stroke="#64748b" label={{ value: '時間', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip
                                            formatter={(value: number) => [`${value}時間`, '作業時間']}
                                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                        <Bar dataKey="hours" fill="#0ea5e9" radius={[8, 8, 0, 0]} animationDuration={1000} isAnimationActive={!hasAnimated} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Task Breakdown by Client */}
                    {clientTaskGroups.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">クライアント別の作業時間</h3>
                            <div className="space-y-3">
                                {clientTaskGroups.map((group) => (
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
                                                    className="w-4 h-4 rounded-full"
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
                                                                        <span className="text-sm text-slate-700">{task.taskName}</span>
                                                                        <span className="text-xs text-slate-400">({task.entryCount}件)</span>
                                                                    </div>
                                                                    <span className="font-semibold text-slate-800">{formatDuration(task.totalDuration)}</span>
                                                                </button>

                                                                <div className={`accordion-content ${expandedTasks.has(taskKey) ? 'expanded' : ''}`}>
                                                                    <div>
                                                                        <div className={`bg-slate-50 p-2 space-y-1 ${expandedTasks.has(taskKey) ? 'border-t border-slate-100' : ''}`}>
                                                                            {task.entries.map((entry) => (
                                                                                <div
                                                                                    key={entry.id}
                                                                                    className="bg-white rounded-lg p-2 hover:shadow-sm transition-all group"
                                                                                >
                                                                                    <div className="flex justify-between items-center">
                                                                                        <div className="text-xs text-slate-500">
                                                                                            {formatDateTime(entry.startTime)}
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <div className="text-sm font-medium text-slate-600 mr-1">
                                                                                                {formatDuration(getEntryDuration(entry))}
                                                                                            </div>
                                                                                            {onUpdate && (
                                                                                                <button
                                                                                                    onClick={() => handleEditClick(entry)}
                                                                                                    className="text-slate-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                                                                                                    title="編集"
                                                                                                >
                                                                                                    <Pencil size={14} />
                                                                                                </button>
                                                                                            )}
                                                                                            {onDelete && (
                                                                                                <button
                                                                                                    onClick={() => onDelete(entry.id)}
                                                                                                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                                                                    title="削除"
                                                                                                >
                                                                                                    <Trash2 size={14} />
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    {entry.comment && (
                                                                                        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500">
                                                                                            <MessageSquare size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                                                                                            <span className="break-words">{entry.comment}</span>
                                                                                        </div>
                                                                                    )}
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
                            </div>
                        </div>
                    )}
                </div>
            )}

            {onUpdate && (
                <EditEntryModal
                    key={editingEntry ? editingEntry.id : 'closed'}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    entry={editingEntry}
                    onSave={onUpdate}
                />
            )}
        </div>
    );
};
