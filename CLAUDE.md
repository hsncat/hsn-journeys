# CLAUDE.md

这份文件是给 Claude Code 看的项目约定。本项目是公开仓库（MIT 开源），所有提交都会被公开。

---

## 🔒 隐私与安全（最重要）

本仓库已于 779a10e 这次 commit 起完成开源化清理。**之后的所有改动必须维持开源项目的形态。**

历史 commit（c77e546 之前）含有作者的个人旅行数据，但用户已确认不擦除历史。**新的修改不能再次引入任何个人或敏感数据。**

### ❌ 永远不要写进 git 的内容

- **个人旅行数据**：真实的 journey / sub_card / wishlist / 行程 / 故事 / 坐标 / 行李条目
- **Cloudflare 账户信息**：`account_id`、D1 `database_id`、R2 bucket 私有信息
- **任何密钥**：Cloudflare API Token、`JWT_SECRET`、管理员密码（明文或哈希）、Cookie 值
- **本地配置**：`.dev.vars`（已 `.gitignore`）、`data/seed.json`（已 `.gitignore`）、`migrations/0002_seed.sql`（已 `.gitignore`，由 seed 脚本本地生成）
- **截图 / 临时调试文件**：`.screenshots/`、`/tmp/*` 中拷贝出来的内容

### ✅ 正确做法

- 演示数据放 `data/seed.example.json`（虚构、通用）
- 配置项在 `wrangler.toml` 用 `YOUR_*` 占位符 + 在 README 写清楚怎么填
- 密钥用 `wrangler secret put` 存到 Cloudflare 服务端，本地用 `.dev.vars`（不进 git）
- 提交前必须 grep 一遍敏感字符串：CF token (`cfat_`)、`account_id`、密码、个人地名

### 💾 真实数据的维护方式

作者的真实旅程数据存在 Cloudflare D1 生产数据库里。**不通过修改 git 文件来改数据**，全部走 `/admin` 后台编辑：

```
登录 /admin → 改 journey / sub_card / wishlist → API 直接写 D1
```

如果作者本地想用真实数据开发，复制 `data/seed.example.json` 为 `data/seed.json`（已 .gitignore）后编辑。

---

## ⚠️ 破坏性操作清单

下面这些命令会清空数据库 / 覆盖远程，**执行前必须先与用户确认**：

- `pnpm seed:remote` —— 会先 `DELETE FROM` 所有业务表再插入示例数据，等于清空 D1
- `pnpm dlx wrangler d1 execute hsn-journeys-db --remote --file=...` 跑含 `DELETE` / `DROP` 的 SQL
- `pnpm dlx wrangler d1 delete hsn-journeys-db` 删库
- `pnpm dlx wrangler r2 bucket delete hsn-journeys-photos` 删桶
- `git push -f` 强制推送（会重写远程历史）
- `git rebase` / `git reset --hard` 跨已推送 commit

只读操作（`d1 execute --command "SELECT ..."`、`r2 object get`、`wrangler tail` 等）不在此列。

---

## 🧱 项目架构速览

```
前台（公开访问）              后台 /admin/*（需登录）           API /api/*
─────────────────             ─────────────────────────         ─────────────
Astro SSR（零 JS）             React SPA + react-router          Hono + middleware
src/pages/*.astro             src/admin/App.tsx                  src/server/app.ts
                                                                  ↓
                                                          D1 (SQLite) · R2 · JWT cookie
```

| 目录 | 用途 |
|---|---|
| `src/pages/` | Astro 页面（前台、admin shell、`/api/[...path].ts` 转发到 Hono、`/r2/[...key].ts` R2 代理） |
| `src/server/` | Hono API：app/auth/db/middleware + 7 个路由（auth/journeys/sub-cards/wishlist/coords/packing/photos） |
| `src/admin/` | 后台 React SPA：routes / components / api.ts |
| `src/components/` | 前台 Astro 组件（Layout / Navbar） |
| `src/lib/` | 共享工具：icons / format / locations（多地点拆分） / itinerary（父子聚合） |
| `migrations/` | D1 schema 演进。`0001_init.sql` 跟版本控制；`0002_seed.sql` 不进 git，由 seed 脚本生成 |
| `scripts/` | seed.ts（生成 SQL）/ hash-password.ts（PBKDF2） |

---

## 🛠️ 常用命令

```bash
pnpm dev                 # 本地开发（http://localhost:4321）
pnpm build               # 构建（会自动写 .assetsignore）
pnpm deploy              # 部署到 CF Workers
pnpm typecheck           # Astro 类型检查
pnpm seed:gen            # 从 data/seed.json 或 .example.json 生成 SQL
pnpm hash <用户名> <密码>  # 生成管理员密码 SQL
```

数据库迁移：

```bash
pnpm migrate:local       # wrangler d1 migrations apply --local
pnpm migrate:remote      # wrangler d1 migrations apply --remote
```

---

## 🎨 设计与代码风格

- **设计令牌**：源自 Tailwind v4 `@theme` 在 `src/styles/global.css`，颜色 / 字体 / 间距统一从那里走
- **字体**：标题 Caveat（手写体）、正文 Quicksand，金额加 `font-variant-numeric: tabular-nums`
- **国内 / 国际配色**：国内 `#2563EB`（蓝）、国际 `#DC2626`（红），地图标记同此约定
- **多地点拆分约定**（地图 / 卡片展示用）：
  - `country` 含 `·` 拆国家（例：`日本·韩国`）
  - `province` 含 `&` 拆省份（例：`四川&重庆`）
  - `city` 含 `&` 拆城市（例：`成都&重庆`）
  - 在 `src/lib/locations.ts` 实现，前后台共用
- **emoji**：用户内容里的 emoji 保留；UI 装饰用 `src/lib/icons.ts` 的 SVG（Lucide 风格）

---

## 🧪 验证习惯

改完代码后至少做这些：

1. `pnpm build` 通过
2. `pnpm dev` 起服务，相关页面 200
3. 改了 API 的话用 curl 测一遍 happy path + 401 unauthorized
4. 改了 schema 的话同步改 `migrations/000X_*.sql`，跑 `pnpm migrate:local` 看本地能应用
5. 部署前检查 `wrangler.toml` 占位符是否还原 / `account_id` / `database_id` 是否回到 `YOUR_*`

---

## 📌 项目背景（一句话）

原本是 GitHub Pages 上的纯静态旅行日记（localStorage 持久化），2026 年 5 月重构为 Cloudflare 全栈：Astro SSR + Hono API + D1 + R2，前台零 JS，后台 React。完整重构方案见 commit `c77e546`，开源化清理见 `779a10e`。
