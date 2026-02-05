# AGENTS.md

本文件用于指导在本仓库中运行的智能体如何协作与执行任务。

## 语言

- 所有说明与回复使用中文。

## 工作方式

- 优先阅读仓库内已有文档（如 `README.md`、`CLAUDE.md`）以理解项目背景。
- 修改代码前先定位相关文件与上下文，避免盲改。
- 变更保持最小化、可追踪；不做无关重构。
- 涉及运行命令或写文件时，说明目的并确保可复现。
 - UI 需保证响应式，适配手机/平板/PC。

## 项目概览

- React 19 待办事项应用，前端使用 Vite，数据默认存储在客户端（SQLite WASM + OPFS）；Pages 环境下回退为 IndexedDB 快照。
- 状态管理使用 Zustand，详情见 `src/store/todoStore.ts`。
 - 主题切换为单按钮（浅色/深色），首次进入根据系统深浅色初始化。
 - 语言切换为单按钮，默认中文，需持久化到本地存储（刷新保持）。
 - 已完成任务允许删除，但不可编辑。
 - 任务支持优先级（低/中/高），默认按优先级排序，高到低；一旦拖拽排序则尊重用户自定义顺序。
 - 任务内容超长：列表中两行省略，点击可弹窗查看全文；弹窗内容可滚动且高度受限。
 - 添加任务输入框为可自动增高的 textarea（最多 3 行），超长出现美化滚动条。
 - 任务行右下角显示时间信息：未完成显示创建时间；完成后显示创建/完成时间与用时；用时单位根据时长自动切换（小时/分钟/秒，中文/英文自适应）。
 - 编辑任务通过弹窗完成，弹窗内保持原格式文本并提供保存按钮。
- 拖拽排序通过任务行上的拖拽手柄触发。

## 存储与隐私（补充摘要）

- 已移除后端与 `data/`，仅保留前端应用。
- 采用 SQLite WASM + OPFS，运行在 Web Worker 中；无 COOP/COEP 时回退为内存数据库 + IndexedDB 快照，数据不上传服务器。
- OPFS 文件为虚拟路径：`/todo-app/todos.sqlite3`（浏览器内部存储，用户无可见本地路径）。
- 依赖：`@sqlite.org/sqlite-wasm`（当前锁定版本：`3.43.0-build1`）。
- Vite 已配置 COOP/COEP 头以支持 OPFS/WASM，并排除 `@sqlite.org/sqlite-wasm` 的预构建。

### 快照版本与压缩
- v1：json 直存
- v2：gzip-json（CompressionStream），降低 IndexedDB 占用
- 读取时自动识别并迁移旧结构（数组或 v1）

## 常用命令

```bash
# 启动开发服务器
npm install
npm run dev                   # 前端 (端口 5173)

# 构建和检查
npm run build                 # TypeScript 检查 + Vite 构建
npm run lint                  # ESLint 检查
```

## 部署与验证（GitHub Pages）

- 工作流：`.github/workflows/deploy.yml`，推送到 `main` 自动构建与部署
- Pages 启用：Settings → Pages → Source 选择 “GitHub Actions”
- 资源路径：`vite.config.ts` 根据 `GITHUB_REPOSITORY` 自动设置 `base` 为 `/<仓库名>/`
- CI 构建：使用 `npm run build:pages`，避免 TS 报错阻塞部署
- 验证：
  - 查看 Actions 的 build/deploy Job，通过后访问 deploy Job 的 `page_url`
  - 若出现 404，确认已启用 Pages 且组织未禁止
