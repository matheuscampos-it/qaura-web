// store/useAuraStore.ts
import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export interface Journey { id: string; name: string; color: string; }
export interface Habit { id: string; name: string; colorClass: string; }
export interface Task { 
  id: string; 
  text: string; 
  completed: boolean; 
  dueDate?: string | null; 
  journeyId?: string | null;
  priority?: string; 
  tags?: string[];
}

interface AuraState {
  statusId: string | null;
  auraPoints: number; tasks: Task[]; habits: Habit[]; journeys: Journey[]; completedHabits: string[];
  activeJourneyId: string | 'all';
  taskModal: { isOpen: boolean; taskId: string | null; currentText: string };
  habitModal: { isOpen: boolean; habitId: string | null; currentName: string; currentColor: string };
  journeyModal: { isOpen: boolean; journeyId: string | null; currentName: string; currentColor: string };

  fetchInitialData: () => Promise<void>;
  addAura: (points: number) => Promise<void>;
  
  addTask: (task: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;

  addHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, name: string, colorClass: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  
  addJourney: (journey: Partial<Journey>) => Promise<void>;
  updateJourney: (id: string, name: string, color: string) => Promise<void>;
  removeJourney: (id: string) => Promise<void>;

  setFilter: (id: string) => void;
  openTaskModal: (task: Task) => void; closeTaskModal: () => void;
  openHabitModal: (id?: string, name?: string, colorClass?: string) => void; closeHabitModal: () => void;
  openJourneyModal: (journey: Journey) => void; closeJourneyModal: () => void;
}

export const useAuraStore = create<AuraState>((set, get) => ({
  statusId: null, auraPoints: 0, tasks: [], habits: [], journeys: [], completedHabits: [], activeJourneyId: 'all',
  taskModal: { isOpen: false, taskId: null, currentText: '' },
  habitModal: { isOpen: false, habitId: null, currentName: '', currentColor: 'blue' },
  journeyModal: { isOpen: false, journeyId: null, currentName: '', currentColor: '' },

  fetchInitialData: async () => {
    const { data: j } = await supabase.from('journeys').select('*');
    const { data: t } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    const { data: h } = await supabase.from('habits').select('*');
    const { data: s } = await supabase.from('user_status').select('*').limit(1).single();

    // Traduções JS <-> Banco de Dados
    const formattedTasks = (t || []).map(task => ({
      ...task,
      dueDate: task.due_date,
      journeyId: task.journey_id
    }));

    const formattedHabits = (h || []).map(habit => ({
      ...habit,
      colorClass: habit.color_class
    }));

    set({ 
      journeys: j || [], 
      tasks: formattedTasks, 
      habits: formattedHabits, 
      auraPoints: s?.aura_points || 1250,
      statusId: s?.id || null 
    });
  },

  addAura: async (points) => {
    const { statusId, auraPoints } = get();
    const newPoints = auraPoints + points;
    set({ auraPoints: newPoints });
    
    if (statusId) {
      await supabase.from('user_status').update({ aura_points: newPoints }).eq('id', statusId);
    }
  },

  // --- TASKS ---
  addTask: async (task) => {
    const { id, dueDate, journeyId, ...rest } = task as any; 
    
    const dbTask = {
      ...rest,
      due_date: dueDate || null,
      journey_id: journeyId || null
    };

    const { data, error } = await supabase.from('tasks').insert([dbTask]).select().single();
    
    if (error) {
      console.error("ERRO DO SUPABASE:", error);
      toast.error(`Erro ao salvar quest: ${error.message}`);
      return;
    }
    
    if (data) {
      const frontendTask = { ...data, dueDate: data.due_date, journeyId: data.journey_id };
      set({ tasks: [frontendTask, ...get().tasks] });
      toast.success('Quest adicionada!');
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    const willComplete = !task.completed;
    
    set({ tasks: get().tasks.map(t => t.id === id ? { ...t, completed: willComplete } : t) });
    get().addAura(willComplete ? 10 : -10);
    if (willComplete) toast.success('✨ Quest concluída! +10 Aura');

    await supabase.from('tasks').update({ completed: willComplete }).eq('id', id);
  },

  removeTask: async (id) => {
    set({ tasks: get().tasks.filter(t => t.id !== id) });
    await supabase.from('tasks').delete().eq('id', id);
  },

  updateTask: async (id, updates) => {
    set({ tasks: get().tasks.map(t => t.id === id ? { ...t, ...updates } : t) });
    
    const dbUpdates: any = { ...updates };
    if ('dueDate' in updates) { dbUpdates.due_date = updates.dueDate; delete dbUpdates.dueDate; }
    if ('journeyId' in updates) { dbUpdates.journey_id = updates.journeyId; delete dbUpdates.journeyId; }

    await supabase.from('tasks').update(dbUpdates).eq('id', id);
  },

  // --- HABITS ---
  addHabit: async (habit) => {
    const { id, colorClass, ...rest } = habit as any;
    const dbHabit = { ...rest, color_class: colorClass };

    const { data, error } = await supabase.from('habits').insert([dbHabit]).select().single();
    if (!error && data) {
      const frontendHabit = { ...data, colorClass: data.color_class };
      set({ habits: [...get().habits, frontendHabit] });
    }
  },

  updateHabit: async (id, name, colorClass) => {
    set({ habits: get().habits.map(h => h.id === id ? { ...h, name, colorClass } : h) });
    await supabase.from('habits').update({ name, color_class: colorClass }).eq('id', id);
  },

  removeHabit: async (id) => {
    set({ 
      habits: get().habits.filter(h => h.id !== id), 
      completedHabits: get().completedHabits.filter(hId => hId !== id) 
    });
    await supabase.from('habits').delete().eq('id', id);
  },

  toggleHabit: async (id) => {
    const isCompleted = get().completedHabits.includes(id);
    set({
      completedHabits: isCompleted ? get().completedHabits.filter(hId => hId !== id) : [...get().completedHabits, id]
    });
    get().addAura(isCompleted ? -15 : 15);
    if (!isCompleted) toast.success('🔥 Hábito mantido! +15 Aura');
  },

  // --- JOURNEYS ---
  addJourney: async (journey) => {
    const { id, ...cleanJourney } = journey as any;
    const { data, error } = await supabase.from('journeys').insert([cleanJourney]).select().single();
    if (!error && data) set({ journeys: [...get().journeys, data] });
  },

  updateJourney: async (id, name, color) => {
    set({ journeys: get().journeys.map(j => j.id === id ? { ...j, name, color } : j) });
    await supabase.from('journeys').update({ name, color }).eq('id', id);
  },

  removeJourney: async (id) => {
    const nextFilter = get().activeJourneyId === id ? 'all' : get().activeJourneyId;
    set({ journeys: get().journeys.filter(j => j.id !== id), activeJourneyId: nextFilter });
    await supabase.from('journeys').delete().eq('id', id);
  },

  // --- UTILIDADES ---
  setFilter: (id) => set({ activeJourneyId: id }),
  openTaskModal: (task) => set({ taskModal: { isOpen: true, taskId: task.id, currentText: task.text } }),
  closeTaskModal: () => set({ taskModal: { isOpen: false, taskId: null, currentText: '' } }),
  openHabitModal: (id, name, colorClass) => set({ habitModal: { isOpen: true, habitId: id || null, currentName: name || '', currentColor: colorClass || 'blue' } }),
  closeHabitModal: () => set({ habitModal: { isOpen: false, habitId: null, currentName: '', currentColor: 'blue' } }),
  openJourneyModal: (j) => set({ journeyModal: { isOpen: true, journeyId: j.id, currentName: j.name, currentColor: j.color } }),
  closeJourneyModal: () => set({ journeyModal: { isOpen: false, journeyId: null, currentName: '', currentColor: '' } }),
}));