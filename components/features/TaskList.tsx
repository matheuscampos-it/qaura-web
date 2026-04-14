'use client'
import React from 'react';
import { useAuraStore, Task } from '@/store/useAuraStore';
import { CheckCircle2, Circle, Trash2, Calendar, AlertCircle, Clock, PlayCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function TaskList() {
  const { tasks, activeJourneyId, journeys, updateTaskStatus, toggleTask, deleteTask, openTaskModal } = useAuraStore();
  
  const currentJourney = journeys.find(j => j.id === activeJourneyId);
  const isStepsView = currentJourney?.type === 'steps';
  const filteredTasks = tasks.filter(t => activeJourneyId === 'all' ? true : t.journeyId === activeJourneyId);

  if (filteredTasks.length === 0) return <div className="text-center py-20 opacity-30 italic text-sm">Sua aura está limpa por aqui...</div>;

  // --- VISÃO KANBAN (ETAPAS) ---
  if (isStepsView) {
    const columns: { label: string, status: Task['status'], color: string }[] = [
      { label: 'Para Fazer', status: 'todo', color: 'zinc' },
      { label: 'Em Progresso', status: 'doing', color: 'blue' },
      { label: 'Concluído', status: 'done', color: 'emerald' },
      { label: 'Bloqueado', status: 'problem', color: 'red' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
        {columns.map(col => (
          <div key={col.status} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-2">
              <div className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-[0_0_8px_rgba(var(--color-${col.color}-500),0.5)]`} />
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">{col.label}</h3>
            </div>

            <div className="space-y-4 min-h-[200px] p-2 rounded-[2.5rem]">
              {filteredTasks.filter(t => t.status === col.status).map(task => (
                <div key={task.id} className="group bg-white dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:ring-2 hover:ring-aura-primary/20 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-100 leading-tight">{task.text}</h4>
                    <button onClick={() => openTaskModal(task.id, task.text)} className="p-1.5 text-zinc-400 hover:text-aura-primary transition-colors">
                      <Pencil size={14} />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-3 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {columns.filter(c => c.status !== col.status).map(c => (
                      <button 
                        key={c.status}
                        onClick={() => updateTaskStatus(task.id, c.status)}
                        className="text-[10px] font-bold uppercase px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-aura-primary hover:text-white rounded-xl transition-all"
                      >
                        {c.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- VISÃO LISTA ---
  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <div 
          key={task.id}
          className={`group flex flex-col p-6 rounded-[2rem] border transition-all duration-300 ${
            task.completed 
              ? 'bg-zinc-50/50 dark:bg-zinc-900/40 border-transparent opacity-50' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 flex-1">
              <button 
                onClick={() => toggleTask(task.id)}
                className={`transition-all hover:scale-110 ${task.completed ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-aura-primary'}`}
              >
                {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
              </button>

              <div className="flex flex-col">
                <span className={`text-lg font-bold ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
                  {task.text}
                </span>
                {task.dueDate && (
                  <span className="text-xs font-bold text-zinc-400 uppercase mt-1 flex items-center gap-1">
                    <Calendar size={12} /> {format(new Date(task.dueDate), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openTaskModal(task.id, task.text)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-aura-primary transition-all">
                <Pencil size={18} />
              </button>
              <button onClick={() => deleteTask(task.id)} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {task.description && !task.completed && (
            <p className="mt-4 ml-11 text-sm text-zinc-500 dark:text-zinc-400 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4 py-1 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}