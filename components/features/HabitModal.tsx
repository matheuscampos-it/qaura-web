// components/features/HabitModal.tsx
'use client'
import { useState, useEffect } from 'react';
import { useAuraStore, Habit } from '@/store/useAuraStore';
import { Modal } from '@/components/features/ui/Modal';

const COLOR_OPTIONS: Habit['colorClass'][] = ['blue', 'purple', 'emerald', 'orange', 'rose'];

export const HabitModal = () => {
  const { habitModal, closeHabitModal, addHabit, updateHabit } = useAuraStore();
  
  const [name, setName] = useState('');
  const [color, setColor] = useState<Habit['colorClass']>('blue');

  const isEditing = !!habitModal.habitId;

  // Sincroniza o estado local quando o modal abre
  useEffect(() => {
    if (habitModal.isOpen) {
      setName(habitModal.currentName);
      setColor(habitModal.currentColor);
    }
  }, [habitModal]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && habitModal.habitId) {
      updateHabit(habitModal.habitId, name.trim(), color);
    } else {
      addHabit({ id: Date.now().toString(), name: name.trim(), colorClass: color });
    }
    closeHabitModal();
  };

  return (
    <Modal isOpen={habitModal.isOpen} onClose={closeHabitModal} title={isEditing ? 'Editar Hábito' : 'Novo Hábito'}>
      <form onSubmit={handleSave} className="space-y-6">
        
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nome do Hábito</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Beber Água, Leitura..."
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-aura-primary outline-none transition-all text-zinc-900 dark:text-zinc-100"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Cor da Aura</label>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c 
                    ? `border-${c}-500 bg-${c}-500/20 scale-110 shadow-sm` 
                    : `border-transparent bg-${c}-500 hover:scale-105 opacity-50 hover:opacity-100`
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={closeHabitModal}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-bold bg-aura-primary text-white hover:bg-aura-secondary transition-colors"
          >
            {isEditing ? 'Salvar' : 'Criar Hábito'}
          </button>
        </div>
      </form>
    </Modal>
  );
};