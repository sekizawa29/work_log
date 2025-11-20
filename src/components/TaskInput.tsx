import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import type { Client } from '../types';

interface TaskInputProps {
    clients: Client[];
    onAddClient: (name: string) => void;
    taskName: string;
    selectedClientId: string;
    onTaskNameChange: (name: string) => void;
    onClientChange: (clientId: string) => void;
    disabled?: boolean;
    recentTaskNames?: string[];
}

export const TaskInput = ({
    clients,
    onAddClient,
    taskName,
    selectedClientId,
    onTaskNameChange,
    onClientChange,
    disabled = false,
    recentTaskNames = [],
}: TaskInputProps) => {
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddClient = () => {
        if (newClientName.trim()) {
            onAddClient(newClientName.trim());
            setNewClientName('');
            setShowAddClient(false);
        }
    };

    const filteredSuggestions = recentTaskNames.filter(
        name => name.toLowerCase().includes(taskName.toLowerCase()) && name !== taskName
    );

    return (
        <div className="glass-card p-6 mb-6">
            <div className="space-y-4">
                <div ref={wrapperRef} className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        タスク名
                    </label>
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => {
                            onTaskNameChange(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="何に取り組んでいますか？"
                        className="input-field"
                        disabled={disabled}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
                        <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 max-h-60 overflow-auto animate-fade-in">
                            {filteredSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-4 py-2 hover:bg-primary-50 text-slate-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    onClick={() => {
                                        onTaskNameChange(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        クライアント
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedClientId}
                            onChange={(e) => onClientChange(e.target.value)}
                            className="input-field flex-1"
                            disabled={disabled}
                        >
                            <option value="">クライアントを選択</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowAddClient(!showAddClient)}
                            className="btn-secondary px-4"
                            disabled={disabled}
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {showAddClient && (
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
    );
};
