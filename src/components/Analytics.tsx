import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TimeEntry, Client } from '../types';
import { formatDuration } from '../utils/helpers';

type DateFilter = 'all' | 'today' | 'thisWeek' | 'thisMonth';

interface AnalyticsProps {
    entries: TimeEntry[];
    clients: Client[];
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
            const monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 7);
            return { start: monday, end: sunday };
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
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return days;
};

const filterLabels: Record<DateFilter, string> = {
    all: 'All',
    today: 'Today',
    thisWeek: 'Week',
    thisMonth: 'Month',
};

export const Analytics = ({ entries, clients }: AnalyticsProps) => {
    const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
    const [dateFilter, setDateFilter] = useState<DateFilter>('thisMonth');
    const [now, setNow] = useState(Date.now());
    const [hasAnimated, setHasAnimated] = useState(false);

    // Update current time every second for active entries
    // Update current time every second for active entries
    // Only start updating AFTER the initial animation is done to prevent stuttering
    const hasActiveEntry = entries.some(e => e.endTime === null);
    React.useEffect(() => {
        if (!hasActiveEntry || !hasAnimated) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [hasActiveEntry, hasAnimated]);

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
            return Math.floor((now - entry.startTime) / 1000);
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
                acc[entry.taskName] = { taskName: entry.taskName, totalDuration: 0, entryCount: 0 };
            }
            acc[entry.taskName].totalDuration += getEntryDuration(entry);
            acc[entry.taskName].entryCount += 1;
            return acc;
        }, {} as Record<string, { taskName: string; totalDuration: number; entryCount: number }>);

        const tasks = Object.values(taskMap).sort((a, b) => b.totalDuration - a.totalDuration);
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
                    {/* Summary */}
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="text-sm opacity-90">総作業時間</div>
                        <div className="text-3xl font-bold mt-2">{formatDuration(totalHours)}</div>
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
                                                    {group.tasks.map((task, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm"
                                                        >
                                                            <span className="text-sm text-slate-700">{task.taskName}</span>
                                                            <span className="font-semibold text-slate-800">{formatDuration(task.totalDuration)}</span>
                                                        </div>
                                                    ))}
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
        </div>
    );
};
