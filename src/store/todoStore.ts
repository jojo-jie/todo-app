import { create } from 'zustand';
import type { Todo, FilterType } from '../types';

export type Language = 'zh' | 'en';

interface TodoStore {
  todos: Todo[];
  filter: FilterType;
  search: string;
  darkMode: boolean;
  language: Language;
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearch: (search: string) => void;
  toggleDarkMode: () => void;
  reorderTodos: (todos: Todo[]) => void;
  setLanguage: (lang: Language) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  filter: 'all',
  search: '',
  darkMode: false,
  language: 'zh',
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  updateTodo: (updatedTodo) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)),
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  reorderTodos: (todos) => set({ todos }),
  setLanguage: (language) => set({ language }),
}));
