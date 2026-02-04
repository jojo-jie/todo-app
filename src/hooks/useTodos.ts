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

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const createTodo = async (input: CreateTodoInput) => {
    const newTodo: Todo = {
      id: uuidv4(),
      content: input.content,
      completed: false,
      priority: input.priority,
      tags: input.tags,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    };
    const created = await todoApi.create(newTodo);
    addTodo(created);
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const updated = { ...todo, completed: !todo.completed };
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
