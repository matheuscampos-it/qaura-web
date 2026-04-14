'use client'
import { useState, useEffect } from 'react';
import { useAuraStore, Habit } from '@/store/useAuraStore';
import { Modal } from '@/components/features/ui/Modal';

export const HabitModal = () => {
  const { habitModal, closeHabitModal, addHabit, updateHabit } = useAuraStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [goal, setGoal] = useState(1);

  useEffect(() => {
    if (habitModal.isOpen) {
      setName(habitModal.currentName || '');
      setColor(habitModal.currentColor || 'blue');
      setFrequency(habitModal.currentFrequency || 'daily');
      setGoal(habitModal.currentGoal || 1);
    }
  }, [habitModal]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, colorClass: color, frequency, goal_count: goal };
    if (habitModal.habitId) await updateHabit(habitModal.habitId, data);
    else await addHabit(data);
    closeHabitModal();
  };

  return (
    <Modal isOpen={habitModal.isOpen} onClose={closeHabitModal} title={habitModal.habitId ? 'Editar Hábito' : 'Novo Hábito'}>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none" placeholder="Ex: Meditação" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Frequência</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none text-sm">
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Meta (vezes)</label>
            <input type="number" min="1" value={goal} onChange={e => setGoal(Number(e.target.value))} className="w-full p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none text-sm" />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-aura-primary text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all">
          Salvar Hábito
        </button>
      </form>
    </Modal>
  );
};