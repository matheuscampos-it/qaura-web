// components/features/HabitCircle.tsx
'use client'
import { useAuraStore } from '@/store/useAuraStore';
import type { Habit } from '@/store/useAuraStore';
import { Sparkles, Pencil, Trash2 } from 'lucide-react';

interface HabitCircleProps {
  id: string;
  name: string;
  colorClass: string;
}

export const HabitCircle = ({ id, name, colorClass }: HabitCircleProps) => {
  const { completedHabits, toggleHabit, removeHabit, updateHabit } = useAuraStore();
  const isCompleted = completedHabits.includes(id);

  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 text-blue-500 hover:bg-blue-500/10',
    purple: 'border-purple-500 text-purple-500 hover:bg-purple-500/10',
    emerald: 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10',
  };

  const completedColorMap: Record<string, string> = {
    blue: 'bg-blue-500 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    purple: 'bg-purple-500 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    emerald: 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]',
  };

  const activeClasses = isCompleted ? completedColorMap[colorClass] : colorMap[colorClass];

  // Troque a função handleEdit atual por esta:
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    useAuraStore.getState().openHabitModal(id, name, colorClass as Habit['colorClass']);
  };

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      {/* Botões de Ação (Aparecem no Hover) */}
      <div className="absolute -top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={handleEdit} className="p-1 bg-zinc-800 rounded-full text-zinc-400 hover:text-white border border-zinc-700">
          <Pencil size={10} />
        </button>
        <button onClick={() => removeHabit(id)} className="p-1 bg-zinc-800 rounded-full text-zinc-400 hover:text-red-400 border border-zinc-700">
          <Trash2 size={10} />
        </button>
      </div>

      <div 
        onClick={() => toggleHabit(id)}
        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 active:scale-90 cursor-pointer ${activeClasses}`}
      >
        <Sparkles size={20} className={isCompleted ? 'scale-110' : 'opacity-80'} />
      </div>
      <span className={`text-[10px] uppercase tracking-wider font-bold ${isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
        {name}
      </span>
    </div>
  );
};