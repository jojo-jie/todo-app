# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在此代码仓库中工作提供指导。

## 项目概述

一个 React 19 待办事项应用，支持拖拽排序、主题切换（深色/浅色/跟随系统）和中英文国际化。数据通过客户端 SQLite WASM + OPFS 持久化存储。

## 命令

```bash
# 启动开发服务器
npm install
npm run dev                   # 前端 (端口 5173)

# 构建和检查
npm run build                 # TypeScript 检查 + Vite 构建
npm run lint                  # ESLint 检查
```

## 架构

### 状态管理 (Zustand)

中央仓库 [src/store/todoStore.ts](src/store/todoStore.ts) 管理：
- `todos`: 待办事项数组
- `filter`: 当前筛选条件 ('all' | 'active' | 'completed')
- `search`: 搜索关键词
- `darkMode`: 深色模式开关
- `language`: 当前语言 ('zh' | 'en')

### 数据流

1. **API 层**: [src/api/todoApi.ts](src/api/todoApi.ts) - 发送 Axios 请求到 localhost:3001
2. **Hooks**: [src/hooks/useTodos.ts](src/hooks/useTodos.ts) - 包装 API 调用，乐观更新
3. **组件**: 通过 `useTodoStore()` 订阅状态

### 数据持久化

- 使用 SQLite WASM，运行在 Web Worker 内，通过 OPFS（Origin Private File System）持久化到浏览器本地存储。
- 虚拟路径：`/todo-app/todos.sqlite3`（浏览器内部虚拟路径，用户不可见）
- 依赖：`@sqlite.org/sqlite-wasm`（当前锁定版本：`3.43.0-build1`）
- 需要 COOP/COEP 响应头（Vite 已配置在 `vite.config.ts`）

### 国际化

翻译函数 `t(key, lang)` 位于 [src/locales/index.ts](src/locales/index.ts)。包含以下键：title, subtitle, addTask, all, active, completed, toggleTheme, toggleLang, edit, delete, save, cancel, priority, footer。

### 拖拽排序

使用 [src/App.tsx](src/App.tsx) 中的 @dnd-kit，`SortableContext` 包裹 `TodoList`。重新排序立即更新本地状态，然后同步到 API。

### 关键类型

```typescript
// src/types/index.ts
interface Todo {
  id: string;
  content: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate: string | null;
  createdAt: string;
  order: number;
}
```

## 组件结构

- `Header` - 应用标题、主题/语言切换按钮
- `AddTodo` - 新任务输入表单
- `FilterBar` - 筛选标签页 (all/active/completed)
- `TodoList` - 可拖拽的待办事项列表
- `TodoItem` - 单个待办事项，支持编辑和删除
- `Footer` - 页脚文字
- `StatsCard` - 统计信息展示

## 样式

Tailwind CSS v4，使用 `dark:` 变体。主容器在浅色模式下使用 `bg-white`，组件需要添加 `dark:` 类以支持深色模式。

## 注意事项
每次回答都使用中文
