export interface Client {
    id: string;
    name: string;
    color?: string;
}

export interface TimeEntry {
    id: string;
    taskName: string;
    clientId: string;
    startTime: number; // Unix timestamp
    endTime: number | null; // null if still running
    duration: number; // in seconds
    targetDuration?: number; // in seconds, optional
    comment?: string; // optional comment (max 500 chars)
    isPaused?: boolean; // whether timer is currently paused
    pausedAt?: number | null; // Unix timestamp when paused
    totalPauseDuration?: number; // total paused time in seconds
    date: string; // ISO date string (YYYY-MM-DD)
}

export interface Task {
    name: string;
    clientId: string;
    totalDuration: number; // Aggregated duration in seconds
    entries: TimeEntry[];
}
