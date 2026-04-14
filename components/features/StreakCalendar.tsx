'use client'
import React, { useMemo } from 'react';
import { useAuraStore } from '@/store/useAuraStore';

export function StreakCalendar() {
  // Puxamos as tarefas reais do nosso estado global
  const { tasks } = useAuraStore();

  // 1. Filtramos as tarefas concluídas e pegamos as datas delas
  const activeDates = useMemo(() => {
    const dates = tasks
      .filter(task => task.completed && task.dueDate) // Pega as concluídas que têm data
      .map(task => task.dueDate!.split('T')[0]); // Isola só a parte "YYYY-MM-DD"
    
    return new Set(dates);
  }, [tasks]);

  // 2. Gera o array com os últimos 28 dias
  const last28Days = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      return {
        date: d,
        dateString: d.toISOString().split('T')[0],
      };
    });
  }, []);

  // 3. Calcula o streak atual (quantos dias seguidos de trás pra frente)
  let currentStreak = 0;
  for (let i = 27; i >= 0; i--) {
    if (activeDates.has(last28Days[i].dateString)) {
      currentStreak++;
    } else {
      // Se não tem atividade hoje (índice 27), não zera o streak ainda, 
      // dá a chance do usuário fazer a quest de hoje!
      if (i !== 27) break; 
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          🔥 Ofensiva Atual
        </h3>
        <span className="text-xs font-mono font-bold text-aura-primary bg-aura-primary/10 px-2 py-1 rounded-md">
          {currentStreak} dias
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {last28Days.map((day, idx) => {
          const isActive = activeDates.has(day.dateString);
          const isToday = idx === 27;

          return (
            <div
              key={day.dateString}
              title={day.dateString}
              className={`
                aspect-square rounded-md transition-colors duration-300
                ${isActive 
                  ? 'bg-aura-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
                  : 'bg-zinc-100 dark:bg-zinc-800'}
                ${isToday && !isActive ? 'border border-zinc-300 dark:border-zinc-600' : ''}
              `}
            />
          );
        })}
      </div>
      
      <p className="text-[10px] text-zinc-400 mt-3 text-center uppercase tracking-widest font-bold">
        Últimos 28 dias
      </p>
    </div>
  );
}