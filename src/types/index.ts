export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  dueDate: string | null;
  createdAt: string;
  completedAt?: string | null;
  order: number;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  search: string;
}

export type FilterType = 'all' | 'active' | 'completed';
