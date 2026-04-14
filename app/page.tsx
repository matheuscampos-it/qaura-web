'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { supabase } from '@/lib/supabase';
import { Moon, Sun, Plus, LogOut, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { InputNLP } from '@/components/features/InputNLP';
import { HabitCircle } from '@/components/features/HabitCircle';
import { TaskList } from '@/components/features/TaskList';
import { Sidebar } from '@/components/features/sidebar';
import { TaskModal } from '@/components/features/TaskModal';
import { HabitModal } from '@/components/features/HabitModal';
import { JourneyModal } from '@/components/features/JourneyModal';
import { StreakCalendar } from '@/components/features/StreakCalendar';
import { StatsDashboard } from '@/components/features/StatsDashboard';
import { useAuraStore } from '@/store/useAuraStore';

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [habitsRef] = useAutoAnimate();
  
  const { 
    auraPoints, 
    habits, 
    activeJourneyId, 
    journeys, 
    openHabitModal, 
    fetchInitialData 
  } = useAuraStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
      else fetchInitialData();
    };
    checkAuth();
  }, [fetchInitialData, router]);

  // --- Lógica de Gamificação e Slots ---
  const xpPerLevel = 500;
  const currentLevel = Math.floor(auraPoints / xpPerLevel) + 1;
  const currentXP = auraPoints % xpPerLevel;
  const progressPercentage = (currentXP / xpPerLevel) * 100;
  
  // Regra de Negócio: Slots = Nível + 2
  const slotLimit = currentLevel + 2;

  const getRankTitle = (level: number) => {
    if (level < 3) return 'Aprendiz Arcano';
    if (level < 6) return 'Desperto da Alvorada';
    if (level < 10) return 'Guerreiro de Aura';
    return 'Mestre Lendário';
  };

  // A variável que estava faltando:
  const currentTitle = activeJourneyId === 'all' 
    ? 'Minhas Quests' 
    : journeys.find(j => j.id === activeJourneyId)?.name || 'Jornada';

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
      <Sidebar />

      <main className="flex-1 p-8 sm:p-12 lg:p-20 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-20">
          
          {/* HEADER SECTION */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
            <div className="space-y-2">
              <h1 className="text-6xl font-black bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent tracking-tighter">
                QAura
              </h1>
              <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.5em] pl-1">
                {getRankTitle(currentLevel)}
              </p>
            </div>

            <div className="flex flex-col gap-5 w-full xl:w-[450px]">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-aura-primary uppercase tracking-wider">Nível {currentLevel}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5 tracking-widest">
                    Capacidade: {slotLimit} Slots
                  </span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-aura-primary transition-all shadow-sm">
                    {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
                  </button>
                  <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
              <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-800/60 rounded-full p-1 border border-zinc-300 dark:border-zinc-700 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-aura-primary to-aura-secondary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                  style={{ width: `${progressPercentage}%` }} 
                />
              </div>
            </div>
          </header>

          {/* DASHBOARD & CALENDAR */}
          <section className="flex flex-col 2xl:flex-row gap-10 items-start">
            <div className="w-full 2xl:w-[400px] shrink-0">
              <StreakCalendar />
            </div>
            <div className="w-full flex-1">
               <StatsDashboard />
            </div>
          </section>

          {/* HABITS SECTION COM LOCK MECÂNICA */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em]">Inventário de Hábitos</h3>
              <div className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[10px] font-black text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                {habits.length} / {slotLimit} UTILIZADOS
              </div>
            </div>
            
            <div ref={habitsRef} className="flex gap-10 justify-center lg:justify-start items-center flex-wrap py-4">
              {habits.map(h => <HabitCircle key={h.id} habit={h} />)}
              
              {habits.length < slotLimit ? (
                <button 
                  onClick={() => openHabitModal()} 
                  className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-aura-primary hover:border-aura-primary transition-all hover:bg-aura-primary/5 group"
                >
                  <Plus size={32} className="group-hover:rotate-90 transition-transform" />
                </button>
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50 bg-zinc-50 dark:bg-zinc-900/20">
                  <Lock size={20} />
                  <span className="text-[8px] font-bold mt-1 uppercase tracking-tighter">Bloqueado</span>
                </div>
              )}
            </div>
          </section>

          {/* NLP INPUT */}
          <section className="max-w-4xl mx-auto w-full">
            <InputNLP />
          </section>

          {/* QUESTS SECTION */}
          <section className="pb-40 space-y-12">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
               <h2 className="text-zinc-500 dark:text-zinc-400 text-sm font-black uppercase tracking-[0.4em]">
                {currentTitle}
               </h2>
               <div className="flex gap-4 items-center">
                 <span className="text-[10px] font-bold text-zinc-400">SAGAS: {journeys.length}/{slotLimit}</span>
                 <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                 <div className="text-[10px] font-black text-aura-primary tracking-widest uppercase">Live Data</div>
               </div>
            </div>
            <TaskList />
          </section>

        </div>
      </main>

      <TaskModal />
      <HabitModal />
      <JourneyModal />
    </div>
  );
}