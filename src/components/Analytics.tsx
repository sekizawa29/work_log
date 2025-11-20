import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimeEntry, Client } from '../types';
import { formatDuration } from '../utils/helpers';

interface AnalyticsProps {
    entries: TimeEntry[];
    clients: Client[];
}

export const Analytics = ({ entries, clients }: AnalyticsProps) => {
    // Client distribution data
    const clientData = clients.map(client => {
        const totalTime = entries
            .filter(e => e.clientId === client.id)
            .reduce((sum, e) => sum + e.duration, 0);
        return {
            name: client.name,
            value: totalTime,
            color: client.color || '#0ea5e9',
        };
    }).filter(d => d.value > 0);

    // Daily time data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const dailyData = last7Days.map(date => {
        const dayTotal = entries
            .filter(e => e.date === date)
            .reduce((sum, e) => sum + e.duration, 0);
        return {
            date: new Date(date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
            hours: Number((dayTotal / 3600).toFixed(1)),
        };
    });

    const totalHours = entries.reduce((sum, e) => sum + e.duration, 0);

    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">分析</h2>

            {entries.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p>データがありません</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl shadow-lg">
                            <div className="text-sm opacity-90">総作業時間</div>
                            <div className="text-3xl font-bold mt-2">{formatDuration(totalHours)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                            <div className="text-sm opacity-90">総タスク数</div>
                            <div className="text-3xl font-bold mt-2">{entries.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                            <div className="text-sm opacity-90">クライアント数</div>
                            <div className="text-3xl font-bold mt-2">{clients.length}</div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        {clientData.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-4">クライアント別時間配分</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={clientData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {clientData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatDuration(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Bar Chart */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">過去7日間の作業時間</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#64748b" />
                                    <YAxis stroke="#64748b" label={{ value: '時間', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        formatter={(value: number) => [`${value}時間`, '作業時間']}
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="hours" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
