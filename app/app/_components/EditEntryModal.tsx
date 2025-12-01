'use client'

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { TimeEntry } from '@/types';

interface EditEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: TimeEntry | null;
    onSave: (id: string, startTime: number, endTime: number | null) => void;
}

export const EditEntryModal = ({ isOpen, onClose, entry, onSave }: EditEntryModalProps) => {
    const [startTime, setStartTime] = useState(() =>
        entry ? new Date(entry.startTime).toISOString().slice(0, 16) : ''
    );
    const [endTime, setEndTime] = useState(() =>
        entry && entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : ''
    );

    if (!isOpen || !entry) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(startTime).getTime();
        const end = endTime ? new Date(endTime).getTime() : null;

        if (end && start > end) {
            alert('終了時間は開始時間より後である必要があります');
            return;
        }

        onSave(entry.id, start, end);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">履歴の編集</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">タスク名</label>
                        <div className="text-slate-900 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                            {entry.taskName}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">開始時間</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">終了時間</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-1">※空欄の場合は「計測中」になります</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm hover:shadow transition-all font-medium flex items-center gap-2"
                        >
                            <Save size={18} />
                            保存する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
