// app/page.tsx
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { supabase } from '@/lib/supabase';
import { Moon, Sun, Plus, LogOut } from 'lucide-react';

import { InputNLP } from '@/components/features/InputNLP';
import { HabitCircle } from '@/components/features/HabitCircle';
import { TaskList } from '@/components/features/TaskList';
import { Sidebar } from '@/components/features/sidebar';
import { TaskModal } from '@/components/features/TaskModal';
import { HabitModal } from '@/components/features/HabitModal';
import { JourneyModal } from '@/components/features/JourneyModal';
import { useAuraStore } from '@/store/useAuraStore';

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // Vital para evitar Hydration Error
  const [habitsRef] = useAutoAnimate();
  
  const { 
    auraPoints, 
    habits, 
    activeJourneyId, 
    journeys, 
    openHabitModal, 
    fetchInitialData 
  } = useAuraStore();

  // 1. Evita erro de Hydration: o botão de tema só renderiza no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Proteção de Rota e Carga de Dados
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchInitialData();
      }
    };
    checkAuth();
  }, [fetchInitialData, router]);

  // Lógica de Gamificação
  const xpPerLevel = 500;
  const currentLevel = Math.floor(auraPoints / xpPerLevel) + 1;
  const currentXP = auraPoints % xpPerLevel;
  const progressPercentage = (currentXP / xpPerLevel) * 100;

  const getRankTitle = (level: number) => {
    if (level < 3) return 'Novato';
    if (level < 6) return 'Desperto';
    if (level < 10) return 'Caçador';
    if (level < 20) return 'Mestre de Aura';
    return 'Lendário';
  };

  const currentTitle = activeJourneyId === 'all' 
    ? 'Quests de Hoje' 
    : journeys.find(j => j.id === activeJourneyId)?.name.toUpperCase() || 'QUESTS';

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
      
      <Sidebar />

      <main className="flex-1 p-6 sm:p-12 h-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 mt-4">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent tracking-tight">
                QAura
              </h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                {getRankTitle(currentLevel)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 w-full sm:w-72">
              <div className="flex items-center gap-3">
                {/* O Botão de Tema só aparece após a montagem para evitar erro */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-aura-primary transition-all shadow-sm"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                )}

                <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <span className="text-xs font-bold text-aura-primary">
                    Lvl {currentLevel}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-2 font-mono">
                    {currentXP}/{xpPerLevel} XP
                  </span>
                </div>

                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/login');
                  }}
                  className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>

              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-aura-primary to-aura-secondary transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </header>

          <section ref={habitsRef} className="mb-14 flex gap-6 justify-center items-center flex-wrap">
            {habits.map(h => (
              <HabitCircle key={h.id} id={h.id} name={h.name} colorClass={h.colorClass as any} />
            ))}
            
            <button 
              onClick={() => openHabitModal()} 
              className="w-14 h-14 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-aura-primary hover:border-aura-primary transition-all"
            >
              <Plus size={24} />
            </button>
          </section>

          <section className="mb-16">
            <InputNLP />
          </section>

          <section className="pb-20">
            <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              {currentTitle}
            </h2>
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