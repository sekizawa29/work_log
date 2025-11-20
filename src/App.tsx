import { useState } from 'react';
import { Timer as TimerIcon, BarChart3 } from 'lucide-react';
import { Timer } from './components/Timer';
import { TaskInput } from './components/TaskInput';
import { TaskHistory } from './components/TaskHistory';
import { Analytics } from './components/Analytics';
import { useTimeTracking } from './hooks/useTimeTracking';
import './index.css';

function App() {
  const {
    entries,
    clients,
    activeEntry,
    recentTaskNames,
    addClient,
    startTimer,
    stopTimer,
    deleteEntry,
  } = useTimeTracking();

  const [taskName, setTaskName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');

  const handleStart = () => {
    if (taskName.trim() && selectedClientId) {
      startTimer(taskName.trim(), selectedClientId);
    }
  };

  const handleStop = () => {
    stopTimer();
    setTaskName('');
  };

  const handleAddClient = (name: string) => {
    const newClient = addClient(name);
    setSelectedClientId(newClient.id);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TimerIcon size={40} className="text-primary-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Time Tracker
            </h1>
          </div>
          <p className="text-slate-600">シンプルで美しい時間管理</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'tracker'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white/50 backdrop-blur-sm text-slate-700 hover:bg-white/80'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TimerIcon size={20} />
              <span>タイマー</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'analytics'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white/50 backdrop-blur-sm text-slate-700 hover:bg-white/80'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 size={20} />
              <span>分析</span>
            </div>
          </button>
        </div>

        {activeTab === 'tracker' ? (
          <>
            {/* Task Input */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <TaskInput
                clients={clients}
                onAddClient={handleAddClient}
                taskName={activeEntry?.taskName || taskName}
                selectedClientId={activeEntry?.clientId || selectedClientId}
                onTaskNameChange={setTaskName}
                onClientChange={setSelectedClientId}
                disabled={!!activeEntry}
                recentTaskNames={recentTaskNames}
              />
            </div>

            {/* Timer */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <Timer
                isActive={!!activeEntry}
                startTime={activeEntry?.startTime || null}
                taskName={activeEntry?.taskName || taskName}
                onStart={handleStart}
                onStop={handleStop}
              />
            </div>

            {/* History */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <TaskHistory
                entries={entries}
                clients={clients}
                onDelete={deleteEntry}
              />
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <Analytics entries={entries} clients={clients} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
