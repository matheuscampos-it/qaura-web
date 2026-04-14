'use client'
import React from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { CheckCircle2, Flame, Compass, Sparkles } from 'lucide-react';

export function StatsDashboard() {
  const { tasks, journeys, auraPoints } = useAuraStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const focusRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const stats = [
    { label: 'Triunfos', value: completedTasks, desc: 'Quests concluídas', icon: <CheckCircle2 className="text-emerald-500" size={24} />, color: 'bg-emerald-500/10' },
    { label: 'Domínio', value: `${focusRate}%`, desc: 'Taxa de foco', icon: <Flame className="text-orange-500" size={24} />, color: 'bg-orange-500/10' },
    { label: 'Sagas', value: journeys.length, desc: 'Jornadas ativas', icon: <Compass className="text-blue-500" size={24} />, color: 'bg-blue-500/10' },
    { label: 'Energia', value: auraPoints, desc: 'Poder da Aura', icon: <Sparkles className="text-purple-500" size={24} />, color: 'bg-purple-500/10' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="relative overflow-hidden p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-aura-primary/5 transition-all duration-500 group"
        >
          {/* Decoração de fundo sutil */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700 ${stat.color.replace('/10', '/40')}`} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl ${stat.color} transition-transform group-hover:rotate-6`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                Status
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
                {stat.value}
              </h3>
              <div>
                <p className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">
                  {stat.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}