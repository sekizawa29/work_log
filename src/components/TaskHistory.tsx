import { Trash2, Clock } from 'lucide-react';
import type { TimeEntry, Client } from '../types';
import { formatDuration, formatDateTime } from '../utils/helpers';

interface TaskHistoryProps {
    entries: TimeEntry[];
    clients: Client[];
    onDelete: (id: string) => void;
}

export const TaskHistory = ({ entries, clients, onDelete }: TaskHistoryProps) => {
    const getClientName = (clientId: string) => {
        return clients.find((c) => c.id === clientId)?.name || '不明';
    };

    const getClientColor = (clientId: string) => {
        return clients.find((c) => c.id === clientId)?.color || '#0ea5e9';
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
            };
        }
        acc[key].totalDuration += entry.duration;
        acc[key].entries.push(entry);
        return acc;
    }, {} as Record<string, { taskName: string; clientId: string; totalDuration: number; entries: TimeEntry[] }>);

    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock size={24} />
                作業履歴
            </h2>

            {entries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p>まだ記録がありません</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.values(groupedTasks).map((task) => (
                        <div key={`${task.taskName}-${task.clientId}`} className="border-l-4 pl-4 py-2" style={{ borderColor: getClientColor(task.clientId) }}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800">{task.taskName}</h3>
                                    <p className="text-sm text-slate-500">{getClientName(task.clientId)}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary-600">
                                        {formatDuration(task.totalDuration)}
                                    </div>
                                    <div className="text-xs text-slate-500">合計時間</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {task.entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex justify-between items-center bg-white/50 rounded-lg p-3 hover:bg-white/80 transition-colors group"
                                    >
                                        <div className="flex-1">
                                            <div className="text-sm text-slate-600">
                                                {formatDateTime(entry.startTime)}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {entry.date}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="font-semibold text-slate-700">
                                                {formatDuration(entry.duration)}
                                            </div>
                                            <button
                                                onClick={() => onDelete(entry.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
