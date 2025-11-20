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
    date: string; // ISO date string (YYYY-MM-DD)
}

export interface Task {
    name: string;
    clientId: string;
    totalDuration: number; // Aggregated duration in seconds
    entries: TimeEntry[];
}
