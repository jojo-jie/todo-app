import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Header } from './components/Header';
import { AddTodo } from './components/AddTodo';
import { TodoList } from './components/TodoList';
import { FilterBar } from './components/FilterBar';
import { Footer } from './components/Footer';
import { useTodoStore } from './store/todoStore';
import { useTodos } from './hooks/useTodos';

function App() {
  const { darkMode, todos, setTodos } = useTodoStore();
  const { reorder, loadTodos } = useTodos();
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setMounted(true);
    loadTodos();
  }, []);

  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex).map((t, i) => ({
        ...t,
        order: i,
      }));

      setTodos(newTodos);
      reorder(newTodos);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Header />
          <AddTodo />
          <FilterBar />
          <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <TodoList />
          </SortableContext>
          <Footer />
        </div>
      </div>
    </DndContext>
  );
}

export default App;
