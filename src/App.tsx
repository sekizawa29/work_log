import { useState, useEffect } from 'react';
import { Timer as TimerIcon, BarChart3, LogOut } from 'lucide-react';
import { Timer } from './components/Timer';
import { TaskInput } from './components/TaskInput';
import { TaskHistory } from './components/TaskHistory';
import { Analytics } from './components/Analytics';
import { Auth } from './components/Auth';
import { useTimeTracking } from './hooks/useTimeTracking';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import './index.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const {
    entries,
    clients,
    activeEntry,
    recentTaskNames,
    addClient,
    startTimer,
    stopTimer,
    deleteEntry,
    updateEntry,
    deleteClient,
  } = useTimeTracking(session?.user.id);

  const [taskName, setTaskName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [targetSeconds, setTargetSeconds] = useState(0);
  const [timerMode, setTimerMode] = useState<'free' | 'goal'>('free');
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics'>('tracker');

  const handleStart = () => {
    if (taskName.trim() && selectedClientId) {
      const targetDuration = timerMode === 'goal' && targetSeconds > 0 ? targetSeconds : undefined;
      startTimer(taskName.trim(), selectedClientId, targetDuration);
    }
  };

  const handleStop = () => {
    stopTimer();
    setTaskName('');
    setTargetSeconds(0);
    setTimerMode('free');
  };

  const handleAddClient = async (name: string) => {
    const newClient = await addClient(name);
    if (newClient) {
      setSelectedClientId(newClient.id);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center animate-fade-in relative">
          <div className="flex items-center justify-center">
            <img src="/ticlog-logo.png" alt="Ticlog" className="h-15" />
          </div>

          <button
            onClick={handleSignOut}
            className="absolute right-0 top-0 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="ログアウト"
          >
            <LogOut size={20} />
          </button>
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
            <div className="animate-fade-in relative z-20" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <TaskInput
                clients={clients}
                onAddClient={handleAddClient}
                taskName={activeEntry?.taskName || taskName}
                selectedClientId={activeEntry?.clientId || selectedClientId}
                onTaskNameChange={setTaskName}
                onClientChange={setSelectedClientId}
                disabled={!!activeEntry}
                recentTaskNames={recentTaskNames}
                onDeleteClient={deleteClient}
              />
            </div>

            {/* Timer */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <Timer
                isActive={!!activeEntry}
                startTime={activeEntry?.startTime || null}
                taskName={activeEntry?.taskName || taskName}
                targetDuration={activeEntry?.targetDuration}
                onStart={handleStart}
                onStop={handleStop}
                timerMode={timerMode}
                onModeChange={setTimerMode}
                targetSeconds={targetSeconds}
                onTargetSecondsChange={setTargetSeconds}
              />
            </div>

            {/* History */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <TaskHistory
                entries={entries}
                clients={clients}
                onDelete={deleteEntry}
                onUpdate={updateEntry}
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
