import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Todo } from '../types';
import { useTodoStore } from '../store/todoStore';
import { todoApi } from '../api/todoApi';

interface CreateTodoInput {
  content: string;
  priority: Todo['priority'];
  tags: string[];
  dueDate: string | null;
}

export function useTodos() {
  const {
    todos,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    filter,
    search,
  } = useTodoStore();
  const manualOrderKey = 'todo_manual_order';
  const priorityRank: Record<Todo['priority'], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await todoApi.getAll();
      const hasManual =
        typeof window !== 'undefined' &&
        window.localStorage.getItem(manualOrderKey) === '1';

      if (!hasManual) {
        const sorted = [...data].sort((a, b) => {
          const rankDiff = priorityRank[a.priority] - priorityRank[b.priority];
          if (rankDiff !== 0) return rankDiff;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        const normalized = sorted.map((todo, index) => ({
          ...todo,
          order: index,
        }));
        setTodos(normalized);
        await todoApi.reorder(normalized);
        return;
      }

      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const createTodo = async (input: CreateTodoInput) => {
    const hasManual =
      typeof window !== 'undefined' &&
      window.localStorage.getItem(manualOrderKey) === '1';
    const newTodo: Todo = {
      id: uuidv4(),
      content: input.content,
      completed: false,
      priority: input.priority,
      tags: input.tags,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: Date.now(),
    };
    const created = await todoApi.create(newTodo);

    if (!hasManual) {
      const sorted = [...todos, created].sort((a, b) => {
        const rankDiff = priorityRank[a.priority] - priorityRank[b.priority];
        if (rankDiff !== 0) return rankDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      const normalized = sorted.map((todo, index) => ({
        ...todo,
        order: index,
      }));
      setTodos(normalized);
      await todoApi.reorder(normalized);
      return;
    }

    addTodo(created);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const willComplete = !todo.completed;
      const updated = {
        ...todo,
        completed: willComplete,
        completedAt: willComplete ? new Date().toISOString() : null,
      };
      await todoApi.update(updated);
      updateTodo(updated);
    }
  };

  const removeTodo = async (id: string) => {
    await todoApi.delete(id);
    deleteTodo(id);
  };

  const editTodo = async (todo: typeof todos[0]) => {
    await todoApi.update(todo);
    updateTodo(todo);
  };

  const reorder = async (newTodos: typeof todos) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(manualOrderKey, '1');
    }
    reorderTodos(newTodos);
    await todoApi.reorder(newTodos);
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter((todo) =>
      todo.content.toLowerCase().includes(search.toLowerCase()) ||
      todo.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => a.order - b.order);

  return {
    todos: filteredTodos,
    allTodos: todos,
    createTodo,
    toggleTodo,
    removeTodo,
    editTodo,
    reorder,
    loadTodos,
  };
}
