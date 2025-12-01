'use client'

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import * as wanakana from 'wanakana';
import type { Client } from '@/types';

// Japanese text matching helper
const matchesJapanese = (input: string, target: string): boolean => {
    if (!input || !target) return false;

    const lowerInput = input.toLowerCase();
    const lowerTarget = target.toLowerCase();

    // Direct match
    if (lowerTarget.includes(lowerInput)) return true;

    // Convert input to hiragana and katakana for comparison
    const inputHiragana = wanakana.toHiragana(input);
    const inputKatakana = wanakana.toKatakana(input);
    const inputRomaji = wanakana.toRomaji(input);

    // Convert target to hiragana and romaji for comparison
    const targetHiragana = wanakana.toHiragana(target);
    const targetKatakana = wanakana.toKatakana(target);
    const targetRomaji = wanakana.toRomaji(target);

    // Check various combinations
    return (
        targetHiragana.includes(inputHiragana) ||
        targetKatakana.includes(inputKatakana) ||
        targetHiragana.includes(inputKatakana) ||
        targetKatakana.includes(inputHiragana) ||
        targetRomaji.toLowerCase().includes(inputRomaji.toLowerCase()) ||
        lowerTarget.includes(inputRomaji.toLowerCase())
    );
};

interface TaskInputProps {
    clients: Client[];
    onAddClient: (name: string) => void;
    taskName: string;
    selectedClientId: string;
    onTaskNameChange: (name: string) => void;
    onClientChange: (clientId: string) => void;
    disabled?: boolean;
    recentTaskNames?: string[];
    onDeleteClient: (id: string) => void;
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
    onDeleteClient,
}: TaskInputProps) => {
    const [showAddClient, setShowAddClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const clientWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
            if (clientWrapperRef.current && !clientWrapperRef.current.contains(event.target as Node)) {
                setShowClientDropdown(false);
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

    const filteredSuggestions = recentTaskNames.filter(name => {
        if (name === taskName) return false;
        // Show all when input is empty, filter when typing
        if (!taskName.trim()) return true;
        return matchesJapanese(taskName, name);
    });

    const selectedClient = clients.find(c => c.id === selectedClientId);

    return (
        <div className="glass-card p-6 mb-6 relative z-30">
            <div className="space-y-4">
                <div ref={wrapperRef} className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        タスク名
                    </label>
                    <div className={`relative transition-all duration-200 ${showSuggestions && filteredSuggestions.length > 0 ? 'z-20' : ''}`}>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => {
                                onTaskNameChange(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="何に取り組んでいますか？"
                            className={`input-field w-full relative z-10 focus:border-slate-200 ${showSuggestions && filteredSuggestions.length > 0
                                ? 'rounded-b-none focus:ring-0 border-b-slate-200'
                                : ''
                                }`}
                            disabled={disabled}
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
                            <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-lg animate-fade-in overflow-hidden z-0">
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            className="w-full text-left px-4 py-3 hover:bg-primary-50 text-slate-700 transition-colors block border-t border-slate-100 first:border-t-0"
                                            onClick={() => {
                                                onTaskNameChange(suggestion);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
                                    onClick={() => !disabled && setShowClientDropdown(!showClientDropdown)}
                                    className={`input-field w-full text-left relative z-10 flex items-center justify-between focus:border-slate-200 ${showClientDropdown
                                        ? 'rounded-b-none focus:ring-0 border-b-slate-200'
                                        : ''
                                        } ${!selectedClient ? 'text-slate-400' : 'text-slate-800'}`}
                                    disabled={disabled}
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
                                {showClientDropdown && !disabled && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-t-0 border-slate-200 rounded-b-xl shadow-lg animate-fade-in overflow-hidden z-0">
                                        <div className="max-h-60 overflow-y-auto">
                                            {clients.length === 0 ? (
                                                <div className="px-4 py-3 text-slate-400 text-sm">
                                                    クライアントがいません
                                                </div>
                                            ) : (
                                                clients.map((client) => (
                                                    <div
                                                        key={client.id}
                                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 text-slate-700 transition-colors border-t border-slate-100 first:border-t-0 group"
                                                    >
                                                        <button
                                                            className="flex-1 text-left flex items-center gap-2"
                                                            onClick={() => {
                                                                onClientChange(client.id);
                                                                setShowClientDropdown(false);
                                                            }}
                                                        >
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: client.color || '#0ea5e9' }}
                                                            />
                                                            {client.name}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`「${client.name}」を削除してもよろしいですか？`)) {
                                                                    onDeleteClient(client.id);
                                                                }
                                                            }}
                                                            className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="削除"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
