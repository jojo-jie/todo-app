import type { Todo } from '../types';
import { loadSnapshot, saveSnapshot } from '../utils/idb';

type WorkerResponse = {
  id: number;
  ok: boolean;
  result?: unknown;
  error?: string;
};

let worker: Worker | null = null;
let requestId = 0;
let initPromise: Promise<void> | null = null;
const pending = new Map<number, { resolve: (value: any) => void; reject: (err: Error) => void }>();

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
  const snapshot = await loadSnapshot();
  if (snapshot.length) await callWorker<void>({ type: 'restore', payload: { todos: snapshot } });
};

const callWorker = <T>(message: any): Promise<T> => {
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
    const created = await callWorker<Todo>({ type: 'create', payload: todo as Todo });
    const all = await callWorker<Todo[]>({ type: 'getAll' });
    await saveSnapshot(all);
    return created;
  },
  update: async (todo: Todo) => {
    await ensureWorker();
    const updated = await callWorker<Todo>({ type: 'update', payload: todo });
    const all = await callWorker<Todo[]>({ type: 'getAll' });
    await saveSnapshot(all);
    return updated;
  },
  delete: async (id: string) => {
    await ensureWorker();
    await callWorker<void>({ type: 'delete', payload: { id } });
    const all = await callWorker<Todo[]>({ type: 'getAll' });
    await saveSnapshot(all);
  },
  reorder: async (todos: Todo[]) => {
    await ensureWorker();
    await callWorker<void>({ type: 'reorder', payload: { todos } });
    const all = await callWorker<Todo[]>({ type: 'getAll' });
    await saveSnapshot(all);
  },
};
