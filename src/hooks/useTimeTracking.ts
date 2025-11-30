import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TimeEntry, Client } from '../types';
import { generateId, formatDate } from '../utils/helpers';
import { generateClientColor } from '../utils/colors';
import { supabase } from '../lib/supabase';



export const useTimeTracking = (userId?: string) => {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

    // Fetch data from Supabase
    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            // Fetch Clients
            const { data: clientsData } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: true });

            if (clientsData) {
                const clientsWithColors = await Promise.all(clientsData.map(async (c) => {
                    // Migration: If color is default blue, generate a new one
                    if (c.color === '#0ea5e9') {
                        const newColor = generateClientColor(c.name);
                        // Update Supabase silently
                        await supabase
                            .from('clients')
                            .update({ color: newColor })
                            .eq('id', c.id);
                        return { ...c, color: newColor };
                    }
                    return {
                        id: c.id,
                        name: c.name,
                        color: c.color
                    };
                }));

                setClients(clientsWithColors.map(c => ({
                    id: c.id,
                    name: c.name,
                    color: c.color
                })));
            }

            // Fetch Time Entries
            const { data: entriesData } = await supabase
                .from('time_entries')
                .select('*')
                .order('start_time', { ascending: false });

            if (entriesData) {
                const mappedEntries: TimeEntry[] = entriesData.map(e => ({
                    id: e.id,
                    taskName: e.task_name,
                    clientId: e.client_id,
                    startTime: new Date(e.start_time).getTime(),
                    endTime: e.end_time ? new Date(e.end_time).getTime() : null,
                    duration: e.duration || 0,
                    targetDuration: e.target_duration,
                    date: formatDate(new Date(e.start_time)),
                }));

                setEntries(mappedEntries);

                // Find active entry (endTime is null)
                const active = mappedEntries.find(e => e.endTime === null);
                if (active) {
                    setActiveEntry(active);
                }
            }
        };

        fetchData();
    }, [userId]);

    const addClient = useCallback(async (name: string, color?: string) => {
        if (!userId) return null;

        const newClient = {
            user_id: userId,
            name,
            color: color || generateClientColor(name),
        };

        // Optimistic update
        const tempId = generateId();
        const optimisticClient = { id: tempId, ...newClient };
        setClients(prev => [...prev, optimisticClient]);

        const { data, error } = await supabase
            .from('clients')
            .insert([newClient])
            .select()
            .single();

        if (error) {
            console.error('Error adding client:', error);
            setClients(prev => prev.filter(c => c.id !== tempId)); // Revert
            return null;
        }

        if (data) {
            // Replace optimistic client with real one
            setClients(prev => prev.map(c => c.id === tempId ? { id: data.id, name: data.name, color: data.color } : c));
            return { id: data.id, name: data.name, color: data.color };
        }
        return null;
    }, [userId]);

    const startTimer = useCallback(async (taskName: string, clientId: string, targetDuration?: number) => {
        if (!userId) return;

        const startTime = new Date();

        const newEntryPayload = {
            user_id: userId,
            task_name: taskName,
            client_id: clientId,
            start_time: startTime.toISOString(),
            end_time: null,
            duration: 0,
            target_duration: targetDuration || null,
        };

        // Optimistic update
        const tempId = generateId();
        const optimisticEntry: TimeEntry = {
            id: tempId,
            taskName,
            clientId,
            startTime: startTime.getTime(),
            endTime: null,
            duration: 0,
            targetDuration,
            date: formatDate(startTime),
        };

        setActiveEntry(optimisticEntry);
        setEntries(prev => [optimisticEntry, ...prev]);

        const { data, error } = await supabase
            .from('time_entries')
            .insert([newEntryPayload])
            .select()
            .single();

        if (error) {
            console.error('Error starting timer:', error);
            setActiveEntry(null);
            setEntries(prev => prev.filter(e => e.id !== tempId));
            return;
        }

        if (data) {
            // Update ID with real one
            const realEntry: TimeEntry = {
                id: data.id,
                taskName: data.task_name,
                clientId: data.client_id,
                startTime: new Date(data.start_time).getTime(),
                endTime: null,
                duration: 0,
                targetDuration: data.target_duration,
                date: formatDate(new Date(data.start_time)),
            };
            setActiveEntry(realEntry);
            setEntries(prev => prev.map(e => e.id === tempId ? realEntry : e));
        }
    }, [userId]);

    const stopTimer = useCallback(async (totalPauseDuration: number = 0) => {
        if (!activeEntry || !userId) return;

        const endTime = new Date();
        const rawDuration = Math.floor((endTime.getTime() - activeEntry.startTime) / 1000);
        const duration = Math.max(0, rawDuration - totalPauseDuration);

        // Optimistic update
        const completedEntry: TimeEntry = {
            ...activeEntry,
            endTime: endTime.getTime(),
            duration,
        };

        setActiveEntry(null);
        setEntries(prev => prev.map(e => e.id === activeEntry.id ? completedEntry : e));

        const { error } = await supabase
            .from('time_entries')
            .update({
                end_time: endTime.toISOString(),
                duration: duration
            })
            .eq('id', activeEntry.id);

        if (error) {
            console.error('Error stopping timer:', error);
            // Revert (this is tricky, maybe just show error)
        }
    }, [activeEntry, userId]);

    const deleteEntry = useCallback(async (id: string) => {
        if (!userId) return;

        // Optimistic update
        setEntries(prev => prev.filter(e => e.id !== id));

        const { error } = await supabase
            .from('time_entries')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting entry:', error);
            // Fetch to revert?
        }
    }, [userId]);

    const deleteClient = useCallback(async (id: string) => {
        if (!userId) return;

        // Optimistic update
        setClients(prev => prev.filter(c => c.id !== id));

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting client:', error);
            // Fetch to revert?
        }
    }, [userId]);

    const recentTaskNames = Array.from(new Set(entries.map(e => e.taskName))).slice(0, 10);

    // Sort clients by most recent usage
    const sortedClients = useMemo(() => {
        // Create a map of clientId to most recent usage time
        const clientLastUsed = new Map<string, number>();
        entries.forEach(entry => {
            if (!clientLastUsed.has(entry.clientId)) {
                clientLastUsed.set(entry.clientId, entry.startTime);
            }
        });

        // Sort clients: recently used first, then unused clients
        return [...clients].sort((a, b) => {
            const aTime = clientLastUsed.get(a.id) ?? 0;
            const bTime = clientLastUsed.get(b.id) ?? 0;
            return bTime - aTime; // Descending order (most recent first)
        });
    }, [clients, entries]);

    return {
        entries,
        clients: sortedClients,
        activeEntry,
        recentTaskNames,
        addClient,
        startTimer,
        stopTimer,
        deleteEntry,
        deleteClient,
        updateEntry: async (id: string, startTime: number, endTime: number | null) => {
            if (!userId) return;

            const duration = endTime ? Math.floor((endTime - startTime) / 1000) : 0;
            const date = formatDate(new Date(startTime));

            // Optimistic update
            setEntries(prev => prev.map(e => {
                if (e.id === id) {
                    return {
                        ...e,
                        startTime,
                        endTime,
                        duration,
                        date
                    };
                }
                return e;
            }));

            const { error } = await supabase
                .from('time_entries')
                .update({
                    start_time: new Date(startTime).toISOString(),
                    end_time: endTime ? new Date(endTime).toISOString() : null,
                    duration
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating entry:', error);
                // Revert logic could be complex, for now just log error
                // Ideally we should fetch the original data back
            }
        },
    };
};
