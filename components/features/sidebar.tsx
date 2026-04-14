// components/features/Sidebar.tsx
'use client'
import { useAuraStore } from '@/store/useAuraStore';
import { LayoutGrid, Hash, Pencil, Trash2, X, Menu } from 'lucide-react';
import { useState } from 'react';

export const Sidebar = () => {
  const { journeys, activeJourneyId, setFilter, tasks, openJourneyModal, removeJourney } = useAuraStore();
  const [isOpen, setIsOpen] = useState(false);

  const Content = () => (
    <>
      <div className="space-y-2">
        <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-2 mb-4">Menu</h3>
        <button 
          onClick={() => { setFilter('all'); setIsOpen(false); }} 
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${ activeJourneyId === 'all' ? 'bg-aura-primary/10 text-aura-primary' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900' }`}
        >
          <LayoutGrid size={18} /> Todas as Quests
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-hidden flex flex-col mt-8">
        <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-2 mb-4">Suas Jornadas</h3>
        <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          {journeys.map((journey) => (
            <div key={journey.id} className="relative group">
              <button
                onClick={() => { setFilter(journey.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${ activeJourneyId === journey.id ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50' }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Hash size={16} style={{ color: journey.color }} className="flex-shrink-0" />
                  <span className="truncate">{journey.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 group-hover:hidden">
                    {tasks.filter(t => t.journeyId === journey.id && !t.completed).length}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <div onClick={(e) => { e.stopPropagation(); openJourneyModal(journey); }} className="p-1 rounded text-zinc-400 hover:text-aura-primary transition-colors"><Pencil size={14} /></div>
                    <div onClick={(e) => { e.stopPropagation(); removeJourney(journey.id); }} className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Botão flutuante para Mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-aura-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Desktop */}
      <aside className="w-64 hidden md:flex flex-col gap-8 p-6 border-r border-zinc-200 dark:border-zinc-800 h-screen sticky top-0 bg-white dark:bg-zinc-950">
        <Content />
      </aside>

      {/* Sidebar Mobile (Overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950 p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsOpen(false)} className="text-zinc-500"><X size={24}/></button>
            </div>
            <Content />
          </aside>
        </div>
      )}
    </>
  );
};