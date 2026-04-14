// components/features/TaskList.tsx
'use client'
import { useAuraStore } from '@/store/useAuraStore';
import { CheckCircle2, Circle, Calendar, Hash, Trash2, Pencil } from 'lucide-react';

export const TaskList = () => {
  const { tasks, journeys, toggleTask, activeJourneyId, removeTask, openTaskModal } = useAuraStore();

  const filteredTasks = tasks.filter(task => {
    if (activeJourneyId === 'all') return true;
    return task.journeyId === activeJourneyId;
  });

  if (filteredTasks.length === 0) return <p className="text-center text-zinc-500 py-12 text-sm italic">Sua aura está limpa nesta jornada.</p>;

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => {
        const journey = task.journeyId ? journeys.find(j => j.id === task.journeyId) : null;
        return (
          <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border group transition-all duration-200 ${ task.completed ? 'bg-zinc-100 dark:bg-zinc-900/40 border-transparent opacity-60' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-aura-primary/50' }`}>
            {/* AGORA SÓ CHAMA O TOGGLE */}
            <button onClick={() => toggleTask(task.id)} className={`flex-shrink-0 transition-colors ${task.completed ? 'text-aura-success' : 'text-zinc-400 hover:text-aura-primary'}`}>
              {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`font-medium block truncate ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>{task.text}</span>
              <div className="flex gap-3 mt-1.5 items-center flex-wrap">
                {journey && <span className="text-[10px] font-bold uppercase flex items-center gap-1" style={{ color: journey.color }}><Hash size={10}/>{journey.name}</span>}
                {task.dueDate && <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium"><Calendar size={11}/>{new Date(task.dueDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.,', ' -')}</span>}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => openTaskModal(task)} className="p-2 text-zinc-500 hover:text-aura-primary transition-colors"><Pencil size={18} /></button>
              <button onClick={() => removeTask(task.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};