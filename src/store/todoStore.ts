import { create } from 'zustand';
import type { Todo, FilterType } from '../types';

export type Language = 'zh' | 'en';
export type ThemeMode = 'light' | 'dark';

interface TodoStore {
  todos: Todo[];
  filter: FilterType;
  search: string;
  language: Language;
  theme: ThemeMode;
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearch: (search: string) => void;
  setTheme: (theme: ThemeMode) => void;
  reorderTodos: (todos: Todo[]) => void;
  setLanguage: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh';
  const stored = window.localStorage.getItem('todo_language');
  return stored === 'en' || stored === 'zh' ? stored : 'zh';
};

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  filter: 'all',
  search: '',
  language: getInitialLanguage(),
  theme: 'light',
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
  setTheme: (theme) => set({ theme }),
  reorderTodos: (todos) => set({ todos }),
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('todo_language', language);
    }
    set({ language });
  },
}));
