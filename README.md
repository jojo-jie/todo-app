# Todo App · React + TypeScript + Vite

这是一个 React 19 待办事项应用。数据默认保存在客户端浏览器（SQLite WASM + OPFS），不经过服务器；在不支持 COOP/COEP 的托管（如 GitHub Pages）下，回退为 IndexedDB 快照持久化。

## 亮点

- 任务拖拽排序、优先级排序、完成状态筛选
- 快速模糊搜索（与筛选联动）
- 列表滚动分页（自动加载 + “加载更多”）
- 深浅色主题、中文/英文切换
- 隐私优先：数据仅保存在本地（OPFS 或 IndexedDB）

## 存储与隐私

- 存储方案：
  - 优先：SQLite WASM + OPFS（Origin Private File System）
  - 无 COOP/COEP 时：Worker 使用内存数据库，主线程以 IndexedDB 快照持久化（支持版本化与压缩）
- 运行位置：Web Worker 中执行数据库读写
- 虚拟路径：`/todo-app/todos.sqlite3`（浏览器内部虚拟路径，用户不可见）
- 不依赖服务端，数据不会上传

## 依赖与运行

```bash
npm install
npm run dev
```

## 运行要求

- 需要 COOP/COEP 响应头以启用 OPFS/WASM 能力
- 开发环境已在 `vite.config.ts` 中配置

## 部署（GitHub Pages + GitHub Actions）

- 已提供工作流：`.github/workflows/deploy.yml`，在 `main` 分支 push 时自动构建并部署
- Pages 启用方式：仓库 Settings → Pages → Build and deployment → Source 选择 “GitHub Actions”
- 访问地址：`https://<用户名>.github.io/<仓库名>/`
- Vite base：自动从 `GITHUB_REPOSITORY` 推断为 `/<仓库名>/`
- CI 构建命令：`npm run build:pages`（避免 TS 报错阻塞部署）
- 验证步骤：
  - 推送后查看 Actions 中 “Deploy to GitHub Pages” 的 build/deploy 两个 Job
  - 成功后在 deploy Job 的 `page_url` 访问站点

## 快照版本与压缩

- v1：`json` 直存 todos 数组
- v2：`gzip-json`，使用 CompressionStream 压缩后存储为 ArrayBuffer，容量占用更低
- 读取时自动识别并迁移旧结构（数组或 v1）到最新格式

## Pages 环境提示

- GitHub Pages 不支持自定义响应头，通常无法启用跨源隔离（COOP/COEP），OPFS 不可用
- 应用将自动回退为内存数据库 + IndexedDB 快照，刷新仍可恢复数据
- 如需 OPFS 持久化与更优性能，建议迁移到支持响应头的平台（Cloudflare Pages/Netlify/Vercel）

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
