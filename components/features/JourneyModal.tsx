'use client'
import { useState } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { Modal } from '@/components/features/ui/Modal';
import { List, Columns, X } from 'lucide-react';

export const JourneyModal = () => {
  const { journeyModal, closeJourneyModal, addJourney } = useAuraStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'common' | 'steps'>('common');
  const [color, setColor] = useState('#8B5CF6');

  if (!journeyModal.isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await addJourney(name.trim(), color, type);
      setName('');
      closeJourneyModal();
    }
  };

  return (
    <Modal isOpen={journeyModal.isOpen} onClose={closeJourneyModal} title="Iniciar Nova Saga">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Identificação da Saga</label>
          <input 
            autoFocus
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl outline-none text-sm border border-transparent focus:border-aura-primary transition-all text-zinc-900 dark:text-zinc-100" 
            placeholder="Ex: Maestria em Backend" 
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Estilo da Jornada</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => setType('common')}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${type === 'common' ? 'border-aura-primary bg-aura-primary/5 text-aura-primary' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
            >
              <List size={24} />
              <div>
                <p className="text-xs font-bold">Lista Comum</p>
                <p className="text-[9px] opacity-60 mt-1">Simples check/uncheck</p>
              </div>
            </button>

            <button 
              type="button" 
              onClick={() => setType('steps')}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${type === 'steps' ? 'border-aura-primary bg-aura-primary/5 text-aura-primary' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
            >
              <Columns size={24} />
              <div>
                <p className="text-xs font-bold">Fluxo de Etapas</p>
                <p className="text-[9px] opacity-60 mt-1">Gestão estilo Kanban</p>
              </div>
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!name.trim()}
          className="w-full py-4 bg-aura-primary text-white font-bold rounded-2xl shadow-lg shadow-aura-primary/25 hover:opacity-90 transition-all disabled:opacity-50"
        >
          Confirmar Jornada
        </button>
      </form>
    </Modal>
  );
};