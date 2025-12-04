'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TimeEntry, Client } from '@/types';
import { generateId, formatDate } from '@/utils/helpers';
import { generateClientColor } from '@/utils/colors';
import { createClient } from '@/lib/supabase/client';

export const useTimeTracking = (userId?: string) => {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

    const supabase = useMemo(() => createClient(), []);

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
                    comment: e.comment || undefined,
                    isPaused: e.is_paused || false,
                    pausedAt: e.paused_at ? new Date(e.paused_at).getTime() : null,
                    totalPauseDuration: e.total_pause_duration || 0,
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
    }, [userId, supabase]);

    const startTimer = useCallback(async (taskName: string, clientId: string, targetDuration?: number, comment?: string) => {
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
            comment: comment || null,
            is_paused: false,
            paused_at: null,
            total_pause_duration: 0,
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
            comment,
            isPaused: false,
            pausedAt: null,
            totalPauseDuration: 0,
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
                comment: data.comment || undefined,
                isPaused: false,
                pausedAt: null,
                totalPauseDuration: 0,
                date: formatDate(new Date(data.start_time)),
            };
            setActiveEntry(realEntry);
            setEntries(prev => prev.map(e => e.id === tempId ? realEntry : e));
        }
    }, [userId, supabase]);

    const updateComment = useCallback(async (id: string, comment: string) => {
        if (!userId) return;

        const trimmedComment = comment.slice(0, 500); // Enforce 500 char limit

        // Optimistic update
        setEntries(prev => prev.map(e => {
            if (e.id === id) {
                return { ...e, comment: trimmedComment || undefined };
            }
            return e;
        }));

        // Also update activeEntry if it matches
        setActiveEntry(prev => {
            if (prev && prev.id === id) {
                return { ...prev, comment: trimmedComment || undefined };
            }
            return prev;
        });

        const { error } = await supabase
            .from('time_entries')
            .update({ comment: trimmedComment || null })
            .eq('id', id);

        if (error) {
            console.error('Error updating comment:', error);
        }
    }, [userId, supabase]);

    const pauseTimer = useCallback(async () => {
        if (!activeEntry || !userId) return;

        const pausedAt = Date.now();

        // Optimistic update
        const pausedEntry: TimeEntry = {
            ...activeEntry,
            isPaused: true,
            pausedAt,
        };

        setActiveEntry(pausedEntry);
        setEntries(prev => prev.map(e => e.id === activeEntry.id ? pausedEntry : e));

        const { error } = await supabase
            .from('time_entries')
            .update({
                is_paused: true,
                paused_at: new Date(pausedAt).toISOString(),
            })
            .eq('id', activeEntry.id);

        if (error) {
            console.error('Error pausing timer:', error);
        }
    }, [activeEntry, userId, supabase]);

    const resumeTimer = useCallback(async () => {
        if (!activeEntry || !userId || !activeEntry.pausedAt) return;

        const now = Date.now();
        const additionalPauseDuration = Math.floor((now - activeEntry.pausedAt) / 1000);
        const newTotalPauseDuration = (activeEntry.totalPauseDuration || 0) + additionalPauseDuration;

        // Optimistic update
        const resumedEntry: TimeEntry = {
            ...activeEntry,
            isPaused: false,
            pausedAt: null,
            totalPauseDuration: newTotalPauseDuration,
        };

        setActiveEntry(resumedEntry);
        setEntries(prev => prev.map(e => e.id === activeEntry.id ? resumedEntry : e));

        const { error } = await supabase
            .from('time_entries')
            .update({
                is_paused: false,
                paused_at: null,
                total_pause_duration: newTotalPauseDuration,
            })
            .eq('id', activeEntry.id);

        if (error) {
            console.error('Error resuming timer:', error);
        }
    }, [activeEntry, userId, supabase]);

    const stopTimer = useCallback(async () => {
        if (!activeEntry || !userId) return;

        const endTime = new Date();
        const rawDuration = Math.floor((endTime.getTime() - activeEntry.startTime) / 1000);

        // Calculate final pause duration (include current pause if paused)
        let finalPauseDuration = activeEntry.totalPauseDuration || 0;
        if (activeEntry.isPaused && activeEntry.pausedAt) {
            finalPauseDuration += Math.floor((endTime.getTime() - activeEntry.pausedAt) / 1000);
        }

        const duration = Math.max(0, rawDuration - finalPauseDuration);

        // Optimistic update
        const completedEntry: TimeEntry = {
            ...activeEntry,
            endTime: endTime.getTime(),
            duration,
            isPaused: false,
            pausedAt: null,
            totalPauseDuration: finalPauseDuration,
        };

        setActiveEntry(null);
        setEntries(prev => prev.map(e => e.id === activeEntry.id ? completedEntry : e));

        const { error } = await supabase
            .from('time_entries')
            .update({
                end_time: endTime.toISOString(),
                duration: duration,
                is_paused: false,
                paused_at: null,
                total_pause_duration: finalPauseDuration,
            })
            .eq('id', activeEntry.id);

        if (error) {
            console.error('Error stopping timer:', error);
            // Revert (this is tricky, maybe just show error)
        }
    }, [activeEntry, userId, supabase]);

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
    }, [userId, supabase]);

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
    }, [userId, supabase]);

    const allTaskNames = Array.from(new Set(entries.map(e => e.taskName)));
    const recentTaskNames = allTaskNames.slice(0, 10);

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

    const updateEntry = useCallback(async (id: string, startTime: number, endTime: number | null, comment?: string) => {
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
                    date,
                    comment
                };
            }
            return e;
        }));

        const { error } = await supabase
            .from('time_entries')
            .update({
                start_time: new Date(startTime).toISOString(),
                end_time: endTime ? new Date(endTime).toISOString() : null,
                duration,
                comment: comment || null
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating entry:', error);
            // Revert logic could be complex, for now just log error
            // Ideally we should fetch the original data back
        }
    }, [userId, supabase]);

    const addManualEntry = useCallback(async (
        taskName: string,
        clientId: string,
        startTime: number,
        endTime: number,
        dateStr: string, // YYYY-MM-DD
        comment?: string
    ) => {
        if (!userId) return;

        const duration = Math.floor((endTime - startTime) / 1000);

        // Construct full ISO strings for DB
        // Note: The startTime/endTime passed here should already be timestamps that include the correct date
        // But if they are just times on the specific date, we might need to be careful.
        // Assuming the caller constructs the full timestamp correctly.

        const newEntryPayload = {
            user_id: userId,
            task_name: taskName,
            client_id: clientId,
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            duration: duration,
            comment: comment || null,
        };

        // Optimistic update
        const tempId = generateId();
        const optimisticEntry: TimeEntry = {
            id: tempId,
            taskName,
            clientId,
            startTime,
            endTime,
            duration,
            targetDuration: undefined,
            comment,
            date: dateStr,
        };

        setEntries(prev => [optimisticEntry, ...prev]);

        const { data, error } = await supabase
            .from('time_entries')
            .insert([newEntryPayload])
            .select()
            .single();

        if (error) {
            console.error('Error adding manual entry:', error);
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
                endTime: data.end_time ? new Date(data.end_time).getTime() : null,
                duration: data.duration || 0,
                targetDuration: data.target_duration,
                comment: data.comment || undefined,
                date: formatDate(new Date(data.start_time)),
            };
            setEntries(prev => prev.map(e => e.id === tempId ? realEntry : e));
        }
    }, [userId, supabase]);

    return {
        entries,
        clients: sortedClients,
        activeEntry,
        recentTaskNames,
        allTaskNames,
        addClient,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        deleteEntry,
        deleteClient,
        updateEntry,
        updateComment,
        addManualEntry,
    };
};
