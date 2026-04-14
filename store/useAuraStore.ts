import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Task {
  id: string;
  text: string;
  description?: string | null;
  completed: boolean;
  dueDate?: string | null;
  journeyId?: string | null;
  status: 'todo' | 'doing' | 'done' | 'problem' | 'none';
}

export interface Journey {
  id: string;
  name: string;
  color: string;
  type: 'common' | 'steps';
}

export interface Habit {
  id: string;
  name: string;
  colorClass: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goal_count: number;
  completed_count: number;
}

interface AuraState {
  statusId: string | null;
  auraPoints: number;
  tasks: Task[];
  habits: Habit[];
  journeys: Journey[];
  activeJourneyId: string;
  
  taskModal: { isOpen: boolean; taskId: string | null; currentText: string };
  habitModal: { isOpen: boolean; habitId: string | null; currentName: string; currentColor: string; currentFrequency: 'daily' | 'weekly' | 'monthly'; currentGoal: number; };
  journeyModal: { isOpen: boolean };

  fetchInitialData: () => Promise<void>;
  setActiveJourney: (id: string) => void;
  addAura: (points: number) => Promise<void>;
  
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addJourney: (name: string, color: string, type: 'common' | 'steps') => Promise<void>;
  deleteJourney: (id: string) => Promise<void>;

  toggleHabit: (id: string) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'completed_count'>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;

  openTaskModal: (id?: string | null, text?: string) => void;
  closeTaskModal: () => void;
  openHabitModal: (habit?: Habit) => void;
  closeHabitModal: () => void;
  openJourneyModal: () => void;
  closeJourneyModal: () => void;
}

export const useAuraStore = create<AuraState>()((set, get) => ({
  statusId: null,
  auraPoints: 0,
  tasks: [],
  habits: [],
  journeys: [],
  activeJourneyId: 'all',
  
  taskModal: { isOpen: false, taskId: null, currentText: '' },
  habitModal: { isOpen: false, habitId: null, currentName: '', currentColor: 'blue', currentFrequency: 'daily', currentGoal: 1 },
  journeyModal: { isOpen: false },

  fetchInitialData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [tasksRes, habitsRes, statusRes, journeysRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('habits').select('*'),
      supabase.from('user_status').select('*').single(),
      supabase.from('journeys').select('*')
    ]);

    set({
      tasks: (tasksRes.data || []).map(t => ({ id: t.id, text: t.text, description: t.description, completed: t.completed, dueDate: t.due_date, journeyId: t.journey_id, status: t.status || 'none' })),
      habits: (habitsRes.data || []).map(h => ({ id: h.id, name: h.name, colorClass: h.color_class, frequency: h.frequency, goal_count: h.goal_count, completed_count: h.completed_count || 0 })),
      journeys: (journeysRes.data || []).map(j => ({ id: j.id, name: j.name, color: j.color, type: j.type || 'common' })),
      auraPoints: statusRes.data?.aura_points || 0,
      statusId: statusRes.data?.id || null
    });
  },

  setActiveJourney: (id) => set({ activeJourneyId: id }),

  addAura: async (points) => {
    const { statusId, auraPoints } = get();
    const newPoints = auraPoints + points;
    set({ auraPoints: newPoints });
    if (statusId) await supabase.from('user_status').update({ aura_points: newPoints }).eq('id', statusId);
  },

  addTask: async (taskData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { journeys, auraPoints } = get();
    const currentLevel = Math.floor(auraPoints / 500) + 1;
    const journeyLimit = currentLevel + 2;

    let finalJourneyId = taskData.journeyId;
    let defaultStatus: Task['status'] = 'none';

    if (finalJourneyId && finalJourneyId !== 'all') {
      const target = journeys.find(j => j.id === finalJourneyId || j.name.toLowerCase() === finalJourneyId.toLowerCase());
      
      if (target) {
        finalJourneyId = target.id;
        defaultStatus = target.type === 'steps' ? 'todo' : 'none';
      } else {
        // NLP Tag: Tenta criar jornada nova
        if (journeys.length >= journeyLimit) {
          toast.error("Capacidade de Sagas esgotada!", { description: `Suba para o nível ${currentLevel + 1} para liberar mais slots.` });
          finalJourneyId = null; // Ignora a tag e cria a task sem jornada
        } else {
          const { data: nj } = await supabase.from('journeys').insert([{ name: finalJourneyId, color: '#8B5CF6', type: 'common', user_id: user.id }]).select().single();
          if (nj) {
            set(s => ({ journeys: [...s.journeys, { ...nj, type: 'common' }] }));
            finalJourneyId = nj.id;
          }
        }
      }
    }

    const { data } = await supabase.from('tasks').insert([{
      user_id: user.id,
      text: taskData.text,
      description: taskData.description || null,
      due_date: taskData.dueDate,
      journey_id: finalJourneyId === 'all' ? null : finalJourneyId,
      status: defaultStatus,
      completed: false
    }]).select().single();

    if (data) set(state => ({ tasks: [{ ...data, journeyId: data.journey_id, status: data.status, description: data.description }, ...state.tasks] }));
  },

  addJourney: async (name, color, type) => {
    const { journeys, auraPoints } = get();
    const currentLevel = Math.floor(auraPoints / 500) + 1;
    const limit = currentLevel + 2;

    if (journeys.length >= limit) {
      return toast.error("Limite de Sagas alcançado!", { description: `Evolua para o nível ${currentLevel + 1} ou adquira slots na loja.` });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('journeys').insert([{ name, color, type, user_id: user?.id }]).select().single();
    if (data) set(state => ({ journeys: [...state.journeys, { ...data, type: data.type }] }));
  },

  addHabit: async (h) => {
    const { habits, auraPoints } = get();
    const currentLevel = Math.floor(auraPoints / 500) + 1;
    const limit = currentLevel + 2;

    if (habits.length >= limit) {
      return toast.error("Limite de Hábitos alcançado!", { description: `Alcance o nível ${currentLevel + 1} para expandir sua mente.` });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('habits').insert([{ name: h.name, color_class: h.colorClass, frequency: h.frequency, goal_count: h.goal_count, user_id: user?.id }]).select().single();
    if (data) set(s => ({ habits: [...s.habits, { id: data.id, name: data.name, colorClass: data.color_class, frequency: data.frequency, goal_count: data.goal_count, completed_count: 0 }] }));
  },

  // ... (Restante das funções update/toggle/delete permanecem iguais à versão anterior)
  updateTask: async (taskId, updates) => { /* ... */ },
  updateTaskStatus: async (taskId, newStatus) => { /* ... */ },
  toggleTask: async (id) => { /* ... */ },
  deleteTask: async (id) => { /* ... */ },
  deleteJourney: async (id) => { /* ... */ },
  toggleHabit: async (id) => { /* ... */ },
  removeHabit: async (id) => { /* ... */ },
  openTaskModal: (id, text) => set({ taskModal: { isOpen: true, taskId: id || null, currentText: text || '' } }),
  closeTaskModal: () => set({ taskModal: { ...get().taskModal, isOpen: false } }),
  openHabitModal: (h) => set({ habitModal: { isOpen: true, habitId: h?.id || null, currentName: h?.name || '', currentColor: h?.colorClass || 'blue', currentFrequency: h?.frequency || 'daily', currentGoal: h?.goal_count || 1 } }),
  closeHabitModal: () => set({ habitModal: { ...get().habitModal, isOpen: false } }),
  openJourneyModal: () => set({ journeyModal: { isOpen: true } }),
  closeJourneyModal: () => set({ journeyModal: { isOpen: false } }),
}));