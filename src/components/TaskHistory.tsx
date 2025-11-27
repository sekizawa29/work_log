import { useState, useEffect } from 'react';
import { Trash2, Clock, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import type { TimeEntry, Client } from '../types';
import { formatDuration, formatDateTime } from '../utils/helpers';
import { EditEntryModal } from './EditEntryModal';

interface TaskHistoryProps {
    entries: TimeEntry[];
    clients: Client[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, startTime: number, endTime: number | null) => void;
}

export const TaskHistory = ({ entries, clients, onDelete, onUpdate }: TaskHistoryProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const getClientName = (clientId: string) => {
        return clients.find((c) => c.id === clientId)?.name || '不明';
    };

    const getClientColor = (clientId: string) => {
        return clients.find((c) => c.id === clientId)?.color || '#0ea5e9';
    };

    const handleEditClick = (entry: TimeEntry) => {
        setEditingEntry(entry);
        setIsEditModalOpen(true);
    };

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    // Group entries by task name and client
    const groupedTasks = entries.reduce((acc, entry) => {
        const key = `${entry.taskName}-${entry.clientId}`;
        if (!acc[key]) {
            acc[key] = {
                taskName: entry.taskName,
                clientId: entry.clientId,
                totalDuration: 0,
                entries: [],
                hasActiveEntry: false,
            };
        }
        acc[key].totalDuration += entry.duration;
        acc[key].entries.push(entry);
        if (entry.endTime === null) {
            acc[key].hasActiveEntry = true;
        }
        return acc;
    }, {} as Record<string, { taskName: string; clientId: string; totalDuration: number; entries: TimeEntry[]; hasActiveEntry: boolean }>);

    // Expand groups with active entries on mount or when entries change
    useEffect(() => {
        const newExpanded = new Set<string>();
        Object.entries(groupedTasks).forEach(([key, task]) => {
            if (task.hasActiveEntry) {
                newExpanded.add(key);
            }
        });

        if (newExpanded.size > 0) {
            setExpandedGroups(prev => {
                const next = new Set(prev);
                newExpanded.forEach(key => next.add(key));
                return next;
            });
        }
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
                <div className="space-y-4">
                    {Object.entries(groupedTasks).map(([key, task]) => (
                        <div key={key} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                            <button
                                onClick={() => toggleGroup(key)}
                                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    {expandedGroups.has(key) ? (
                                        <ChevronDown size={20} className="text-slate-400" />
                                    ) : (
                                        <ChevronRight size={20} className="text-slate-400" />
                                    )}
                                    <div
                                        className={`w-4 h-4 rounded-full ${task.hasActiveEntry ? 'animate-pulse-glow' : ''}`}
                                        style={{ backgroundColor: getClientColor(task.clientId) }}
                                    />
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{task.taskName}</h3>
                                        <p className="text-xs text-slate-500">{getClientName(task.clientId)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary-600">
                                        {formatDuration(task.totalDuration)}
                                    </div>
                                    <div className="text-xs text-slate-500">{task.entries.length} 件の記録</div>
                                </div>
                            </button>

                            <div className={`accordion-content ${expandedGroups.has(key) ? 'expanded' : ''}`}>
                                <div className={`bg-slate-50 p-2 space-y-2 ${expandedGroups.has(key) ? 'border-t border-slate-100' : ''}`}>
                                    {task.entries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm text-slate-600">
                                                    {formatDateTime(entry.startTime)}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {entry.date}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="font-semibold text-slate-700 mr-2">
                                                    {formatDuration(entry.duration)}
                                                </div>
                                                <button
                                                    onClick={() => handleEditClick(entry)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50"
                                                    title="編集"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(entry.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
                                                    title="削除"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
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
