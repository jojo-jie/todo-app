import axios from 'axios';
import type { Todo } from '../types';

const API_URL = 'http://localhost:3001/api/todos';

export const todoApi = {
  getAll: async () => {
    const res = await axios.get(API_URL);
    return res.data.todos as Todo[];
  },
  create: async (todo: Omit<Todo, 'id'>) => {
    const res = await axios.post(API_URL, todo);
    return res.data as Todo;
  },
  update: async (todo: Todo) => {
    const res = await axios.put(API_URL, todo);
    return res.data as Todo;
  },
  delete: async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
  },
  reorder: async (todos: Todo[]) => {
    await axios.put(`${API_URL}/bulk`, { todos });
  },
};
