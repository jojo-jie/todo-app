import type { Todo } from '../types';

type WorkerRequest =
  | { id: number; type: 'init' }
  | { id: number; type: 'getAll' }
  | { id: number; type: 'create'; payload: Todo }
  | { id: number; type: 'update'; payload: Todo }
  | { id: number; type: 'delete'; payload: { id: string } }
  | { id: number; type: 'reorder'; payload: { todos: Todo[] } };

type WorkerResponse = {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
};

let worker: Worker | null = null;
let requestId = 0;
let initPromise: Promise<void> | null = null;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (err: Error) => void }>();

const ensureWorker = async () => {
  if (!worker) {
    worker = new Worker(new URL('../workers/sqliteWorker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, ok, result, error } = event.data;
      const handler = pending.get(id);
      if (!handler) return;
      pending.delete(id);
      if (ok) handler.resolve(result);
      else handler.reject(new Error(error || 'SQLite Worker Error'));
    };
  }

  if (!initPromise) {
    initPromise = callWorker({ type: 'init' });
  }

  await initPromise;
};

const callWorker = <T>(message: Omit<WorkerRequest, 'id'>): Promise<T> => {
  if (!worker) {
    return Promise.reject(new Error('SQLite worker not initialized'));
  }
  return new Promise<T>((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    worker?.postMessage({ id, ...message });
  });
};

export const todoApi = {
  getAll: async () => {
    await ensureWorker();
    return callWorker<Todo[]>({ type: 'getAll' });
  },
  create: async (todo: Omit<Todo, 'id'>) => {
    await ensureWorker();
    return callWorker<Todo>({ type: 'create', payload: todo as Todo });
  },
  update: async (todo: Todo) => {
    await ensureWorker();
    return callWorker<Todo>({ type: 'update', payload: todo });
  },
  delete: async (id: string) => {
    await ensureWorker();
    await callWorker<void>({ type: 'delete', payload: { id } });
  },
  reorder: async (todos: Todo[]) => {
    await ensureWorker();
    await callWorker<void>({ type: 'reorder', payload: { todos } });
  },
};
