'use client'
import { useAuraStore, Habit } from '@/store/useAuraStore';
import { Sparkles, Pencil, Trash2 } from 'lucide-react';

export const HabitCircle = ({ habit }: { habit: Habit }) => {
  const { toggleHabit, removeHabit, openHabitModal } = useAuraStore();
  const isCompleted = habit.completed_count >= habit.goal_count;

  const colorMap: any = {
    blue: 'border-blue-500 text-blue-500 hover:bg-blue-500/10',
    purple: 'border-purple-500 text-purple-500 hover:bg-purple-500/10',
    emerald: 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10',
  };

  const completedColor: any = {
    blue: 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    purple: 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    emerald: 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  };

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      <div className="absolute -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={() => openHabitModal(habit)} className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-white border border-zinc-700"><Pencil size={10} /></button>
        <button onClick={() => removeHabit(habit.id)} className="p-1.5 bg-zinc-800 rounded-full text-zinc-400 hover:text-red-400 border border-zinc-700"><Trash2 size={10} /></button>
      </div>

      <div 
        onClick={() => toggleHabit(habit.id)}
        className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer ${isCompleted ? completedColor[habit.colorClass] : colorMap[habit.colorClass]}`}
      >
        <Sparkles size={16} className={isCompleted ? 'animate-pulse' : 'opacity-50'} />
        <span className="text-[9px] font-black mt-0.5">{habit.completed_count}/{habit.goal_count}</span>
      </div>
      <span className={`text-[9px] uppercase tracking-wider font-bold ${isCompleted ? 'text-aura-primary' : 'text-zinc-500'}`}>{habit.name}</span>
    </div>
  );
};