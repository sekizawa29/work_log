import { useState, useEffect, useCallback } from 'react';
import type { TimeEntry, Client } from '../types';
import { generateId, formatDate } from '../utils/helpers';

const STORAGE_KEY_ENTRIES = 'timeEntries';
const STORAGE_KEY_CLIENTS = 'clients';

export const useTimeTracking = () => {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

    // Load data from localStorage on mount
    useEffect(() => {
        const savedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
        const savedClients = localStorage.getItem(STORAGE_KEY_CLIENTS);

        if (savedEntries) {
            setEntries(JSON.parse(savedEntries));
        }

        if (savedClients) {
            setClients(JSON.parse(savedClients));
        } else {
            // Initialize with default client
            const defaultClient: Client = {
                id: generateId(),
                name: 'デフォルト',
                color: '#0ea5e9',
            };
            setClients([defaultClient]);
            localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify([defaultClient]));
        }
    }, []);

    // Save entries to localStorage whenever they change
    useEffect(() => {
        if (entries.length > 0) {
            localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
        }
    }, [entries]);

    // Save clients to localStorage whenever they change
    useEffect(() => {
        if (clients.length > 0) {
            localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
        }
    }, [clients]);

    const addClient = useCallback((name: string, color?: string) => {
        const newClient: Client = {
            id: generateId(),
            name,
            color: color || '#0ea5e9',
        };
        setClients((prev) => [...prev, newClient]);
        return newClient;
    }, []);

    const startTimer = useCallback((taskName: string, clientId: string) => {
        const newEntry: TimeEntry = {
            id: generateId(),
            taskName,
            clientId,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            date: formatDate(new Date()),
        };
        setActiveEntry(newEntry);
    }, []);

    const stopTimer = useCallback(() => {
        if (activeEntry) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - activeEntry.startTime) / 1000);
            const completedEntry: TimeEntry = {
                ...activeEntry,
                endTime,
                duration,
            };
            setEntries((prev) => [completedEntry, ...prev]);
            setActiveEntry(null);
        }
    }, [activeEntry]);

    const deleteEntry = useCallback((id: string) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }, []);

    const recentTaskNames = Array.from(new Set(entries.map(e => e.taskName))).slice(0, 10);

    return {
        entries,
        clients,
        activeEntry,
        recentTaskNames,
        addClient,
        startTimer,
        stopTimer,
        deleteEntry,
    };
};
