import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
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

let db: ReturnType<typeof openDatabase> | null = null;

const DB_PATH = '/todo-app/todos.sqlite3';

const openDatabase = (sqlite: Awaited<ReturnType<typeof sqlite3InitModule>>) => {
  if (!sqlite.oo1?.OpfsDb) {
    throw new Error('OPFS not available. Ensure COOP/COEP headers are enabled.');
  }
  return new sqlite.oo1.OpfsDb(DB_PATH, 'c');
};

const initDb = async () => {
  if (db) return;
  const sqlite3 = await sqlite3InitModule({
    print: () => undefined,
    printErr: () => undefined,
  });
  db = openDatabase(sqlite3);
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      completed INTEGER NOT NULL,
      priority TEXT NOT NULL,
      tags TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      order_index INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(order_index);
  `);
};

const rowToTodo = (row: Record<string, unknown>): Todo => {
  let tags: string[] = [];
  try {
    tags = JSON.parse(String(row.tags ?? '[]'));
    if (!Array.isArray(tags)) tags = [];
  } catch (error) {
    tags = [];
  }
  return {
    id: String(row.id),
    content: String(row.content ?? ''),
    completed: Number(row.completed ?? 0) === 1,
    priority: (row.priority as Todo['priority']) ?? 'low',
    tags,
    dueDate: row.due_date ? String(row.due_date) : null,
    createdAt: String(row.created_at),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    order: Number(row.order_index ?? 0),
  };
};

const toRowValues = (todo: Todo) => [
  todo.id,
  todo.content,
  todo.completed ? 1 : 0,
  todo.priority,
  JSON.stringify(todo.tags ?? []),
  todo.dueDate ?? null,
  todo.createdAt,
  todo.completedAt ?? null,
  Number.isFinite(todo.order) ? todo.order : 0,
];

const getAll = () => {
  if (!db) throw new Error('Database not initialized');
  const rows = db.exec({
    sql: `SELECT id, content, completed, priority, tags, due_date, created_at, completed_at, order_index
          FROM todos
          ORDER BY order_index ASC, created_at ASC`,
    rowMode: 'object',
    returnValue: 'resultRows',
  }) as Record<string, unknown>[];
  return rows.map(rowToTodo);
};

const createTodo = (todo: Todo) => {
  if (!db) throw new Error('Database not initialized');
  db.exec({
    sql: `INSERT INTO todos
          (id, content, completed, priority, tags, due_date, created_at, completed_at, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    bind: toRowValues(todo),
  });
  return todo;
};

const updateTodo = (todo: Todo) => {
  if (!db) throw new Error('Database not initialized');
  db.exec({
    sql: `UPDATE todos SET
            content = ?,
            completed = ?,
            priority = ?,
            tags = ?,
            due_date = ?,
            created_at = ?,
            completed_at = ?,
            order_index = ?
          WHERE id = ?`,
    bind: [
      todo.content,
      todo.completed ? 1 : 0,
      todo.priority,
      JSON.stringify(todo.tags ?? []),
      todo.dueDate ?? null,
      todo.createdAt,
      todo.completedAt ?? null,
      Number.isFinite(todo.order) ? todo.order : 0,
      todo.id,
    ],
  });
  return todo;
};

const deleteTodo = (id: string) => {
  if (!db) throw new Error('Database not initialized');
  db.exec({ sql: 'DELETE FROM todos WHERE id = ?', bind: [id] });
};

const reorderTodos = (todos: Todo[]) => {
  if (!db) throw new Error('Database not initialized');
  db.exec('BEGIN');
  try {
    todos.forEach((todo) => {
      db?.exec({
        sql: 'UPDATE todos SET order_index = ? WHERE id = ?',
        bind: [Number.isFinite(todo.order) ? todo.order : 0, todo.id],
      });
    });
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

const handleRequest = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data;
  const respond = (response: WorkerResponse) => {
    (self as DedicatedWorkerGlobalScope).postMessage(response);
  };

  try {
    switch (type) {
      case 'init':
        await initDb();
        respond({ id, ok: true });
        return;
      case 'getAll':
        await initDb();
        respond({ id, ok: true, result: getAll() });
        return;
      case 'create':
        await initDb();
        respond({ id, ok: true, result: createTodo(payload) });
        return;
      case 'update':
        await initDb();
        respond({ id, ok: true, result: updateTodo(payload) });
        return;
      case 'delete':
        await initDb();
        deleteTodo(payload.id);
        respond({ id, ok: true });
        return;
      case 'reorder':
        await initDb();
        reorderTodos(payload.todos);
        respond({ id, ok: true });
        return;
      default:
        respond({ id, ok: false, error: 'Unknown message type' });
        return;
    }
  } catch (error) {
    respond({
      id,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

(self as DedicatedWorkerGlobalScope).onmessage = handleRequest;
