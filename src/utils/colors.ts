// Tailwind CSS colors that work well with the primary sky blue theme
export const CLIENT_COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#f43f5e', // rose-500
    '#64748b', // slate-500
];

export const generateClientColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % CLIENT_COLORS.length;
    return CLIENT_COLORS[index];
};
