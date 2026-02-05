import type { Todo } from '../types';
import { compressText, decompressToText } from './compress';

const DB_NAME = 'todo-app';
const STORE = 'kv';

const open = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const idbGet = async <T>(key: string): Promise<T | null> => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error);
  });
};

const idbSet = async (key: string, value: unknown): Promise<void> => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

type SnapshotV1 = {
  version: 1;
  encoding: 'json';
  data: Todo[];
  createdAt: string;
};

type SnapshotV2 = {
  version: 2;
  encoding: 'gzip-json';
  data: ArrayBuffer;
  createdAt: string;
};

const normalizeTodo = (raw: any): Todo => {
  const tags = Array.isArray(raw?.tags) ? raw.tags : [];
  return {
    id: String(raw?.id ?? ''),
    content: String(raw?.content ?? ''),
    completed: raw?.completed === true || Number(raw?.completed ?? 0) === 1,
    priority: (raw?.priority as Todo['priority']) ?? 'low',
    tags,
    dueDate: raw?.dueDate ?? null,
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    completedAt: raw?.completedAt ?? null,
    order: Number.isFinite(raw?.order) ? Number(raw.order) : 0,
  };
};

const migrateTodos = (arr: any[]): Todo[] => arr.map(normalizeTodo);

export const loadSnapshot = async (): Promise<Todo[]> => {
  const raw = await idbGet<any>('todos');
  if (!raw) return [];
  if (Array.isArray(raw)) {
    const migrated = migrateTodos(raw);
    await saveSnapshot(migrated);
    return migrated;
  }
  if (raw.version === 1) {
    const migrated = migrateTodos((raw as SnapshotV1).data ?? []);
    return migrated;
  }
  if (raw.version === 2) {
    const text = await decompressToText((raw as SnapshotV2).data);
    const parsed = JSON.parse(text) as Todo[];
    const migrated = migrateTodos(parsed);
    return migrated;
  }
  return [];
};

export const saveSnapshot = async (todos: Todo[]): Promise<void> => {
  const canGzip = typeof (globalThis as any).CompressionStream !== 'undefined';
  if (canGzip) {
    const ab = await compressText(JSON.stringify(todos));
    const v2: SnapshotV2 = {
      version: 2,
      encoding: 'gzip-json',
      data: ab,
      createdAt: new Date().toISOString(),
    };
    await idbSet('todos', v2);
    return;
  }
  const v1: SnapshotV1 = {
    version: 1,
    encoding: 'json',
    data: todos,
    createdAt: new Date().toISOString(),
  };
  await idbSet('todos', v1);
};
