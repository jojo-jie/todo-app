# AGENTS.md

本文件用于指导在本仓库中运行的智能体如何协作与执行任务。

## 语言

- 所有说明与回复使用中文。

## 工作方式

- 优先阅读仓库内已有文档（如 `README.md`、`CLAUDE.md`）以理解项目背景。
- 修改代码前先定位相关文件与上下文，避免盲改。
- 变更保持最小化、可追踪；不做无关重构。
- 涉及运行命令或写文件时，说明目的并确保可复现。

## 项目概览

- React 19 待办事项应用，前端使用 Vite，后端为 Node.js HTTP 服务器。
- 数据存储在 `data/todos.json`，API 由 `server/index.js` 提供。
- 状态管理使用 Zustand，详情见 `src/store/todoStore.ts`。

## 常用命令

```bash
# 启动开发服务器（需要同时运行）
node server/index.js          # 后端 (端口 3001)
npm run dev                   # 前端 (端口 5173)

# 构建和检查
npm run build                 # TypeScript 检查 + Vite 构建
npm run lint                  # ESLint 检查
```
