// components/features/JourneyModal.tsx
'use client'
import { useState, useEffect } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { Modal } from '@/components/features/ui/Modal';

const JOURNEY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F43F5E', '#06B6D4'];

export const JourneyModal = () => {
  const { journeyModal, closeJourneyModal, updateJourney } = useAuraStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (journeyModal.isOpen) {
      setName(journeyModal.currentName);
      setColor(journeyModal.currentColor);
    }
  }, [journeyModal]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && journeyModal.journeyId) {
      updateJourney(journeyModal.journeyId, name.trim(), color);
      closeJourneyModal();
    }
  };

  return (
    <Modal isOpen={journeyModal.isOpen} onClose={closeJourneyModal} title="Editar Jornada">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome da Jornada</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-aura-primary outline-none transition-all text-zinc-900 dark:text-zinc-100"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Cor da Etiqueta</label>
          <div className="flex gap-3 flex-wrap">
            {JOURNEY_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110 shadow-md ring-2 ring-zinc-400 dark:ring-zinc-600' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={closeJourneyModal} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2 bg-aura-primary hover:bg-aura-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-aura-primary/20 transition-all">
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
};