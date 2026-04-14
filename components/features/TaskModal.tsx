'use client'
import { useState, useEffect } from 'react';
import { useAuraStore } from '@/store/useAuraStore';
import { Modal } from '@/components/features/ui/Modal';
import { Calendar, Hash } from 'lucide-react';

export const TaskModal = () => {
  const { taskModal, tasks, journeys, closeTaskModal, updateTask } = useAuraStore();
  
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [journeyId, setJourneyId] = useState('');

  const currentTask = tasks.find(t => t.id === taskModal.taskId);

  useEffect(() => {
    if (taskModal.isOpen && currentTask) {
      setText(currentTask.text);
      setJourneyId(currentTask.journeyId || '');
      // Formata a data para o input type="datetime-local" (YYYY-MM-DDTHH:mm)
      if (currentTask.dueDate) {
        setDate(new Date(currentTask.dueDate).toISOString().slice(0, 16));
      } else {
        setDate('');
      }
    }
  }, [taskModal.isOpen, currentTask]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && taskModal.taskId) {
      updateTask(taskModal.taskId, {
        text: text.trim(),
        dueDate: date ? new Date(date).toISOString() : null,
        journeyId: journeyId || null
      });
      closeTaskModal();
    }
  };

  return (
    <Modal isOpen={taskModal.isOpen} onClose={closeTaskModal} title="Editar Quest">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Texto da Tarefa */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Objetivo</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-aura-primary outline-none text-zinc-900 dark:text-zinc-100"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Seletor de Jornada (Tag) */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Jornada</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <select 
                value={journeyId}
                onChange={(e) => setJourneyId(e.target.value)}
                className="w-full p-3 pl-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none appearance-none text-sm text-zinc-700 dark:text-zinc-300"
              >
                <option value="">Sem Jornada</option>
                {journeys.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seletor de Data */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Data e Hora</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 pl-9 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-sm text-zinc-700 dark:text-zinc-300"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={closeTaskModal} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2 bg-aura-primary hover:bg-aura-secondary text-white rounded-xl text-sm font-bold shadow-lg shadow-aura-primary/20 transition-all">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};