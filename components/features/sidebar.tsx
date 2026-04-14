'use client'
import React from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { 
  LayoutDashboard, 
  Plus, 
  Hash, 
  Settings, 
  Compass, 
  Trash2 
} from 'lucide-react';
import { toast } from 'sonner';

export function Sidebar() {
  const { 
    journeys, 
    activeJourneyId, 
    setActiveJourney, 
    openJourneyModal,
    deleteJourney 
  } = useAuraStore();

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Evita que clique na jornada ao tentar deletar
    if (confirm(`Tem certeza que deseja deletar a jornada "${name}"?`)) {
      await deleteJourney(id);
      toast.error(`Jornada "${name}" removida.`);
    }
  };

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex-col hidden md:flex bg-white dark:bg-zinc-950 h-screen sticky top-0">
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-aura-primary flex items-center justify-center text-white font-bold shadow-lg shadow-aura-primary/20">
            Q
          </div>
          <span className="font-bold text-xl tracking-tight">QAura</span>
        </div>

        {/* Principal */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-2">
            Principal
          </p>
          <button
            onClick={() => setActiveJourney('all')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeJourneyId === 'all'
                ? 'bg-aura-primary/10 text-aura-primary'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <LayoutDashboard size={18} />
            Visão Geral
          </button>
        </nav>

        {/* Jornadas */}
        <nav className="mt-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="flex items-center justify-between mb-4 ml-2">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Jornadas
            </p>
            <button 
              onClick={openJourneyModal}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md text-zinc-400 hover:text-aura-primary transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {journeys.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic ml-2">Nenhuma jornada criada.</p>
            ) : (
              journeys.map((journey) => (
                <button
                  key={journey.id}
                  onClick={() => setActiveJourney(journey.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium group transition-all ${
                    activeJourneyId === journey.id
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-aura-primary font-bold'
                      : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Hash 
                      size={16} 
                      className={activeJourneyId === journey.id ? 'text-aura-primary' : 'text-zinc-400'} 
                    />
                    <span className="truncate">{journey.name}</span>
                  </div>
                  
                  {/* Botão Deletar (Só aparece no hover) */}
                  <div 
                    onClick={(e) => handleDelete(e, journey.id, journey.name)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all ml-2"
                  >
                    <Trash2 size={14} />
                  </div>
                </button>
              ))
            )}
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Settings size={18} />
            Configurações
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <Compass size={18} />
            Explorar
          </button>
        </div>
      </div>
    </aside>
  );
}