# HSN Journey Traces · 旅行足迹

> 一个完全跑在 Cloudflare 免费档上的全栈旅行日记网站。Astro SSR + Hono API + D1 + R2，前台零 JavaScript，后台 React 单页应用。

---

## ✨ 功能特性

- 🏠 **首页**：旅行数据总览、最近旅程、可配置的行李清单
- 🗺️ **城市足迹**：可折叠的一级 / 二级卡片，含搜索、国内 / 国外筛选、时间线侧栏
- 🌍 **足迹地图**：Leaflet 世界地图，国内蓝色 / 国际红色标记，自动从坐标库渲染
- 💭 **心愿单**：未来想去的目的地清单
- 📝 **旅程详情**：行程表、费用明细、亮点、故事、封面照片
- 🛠️ **管理后台**（`/admin/*`）：登录后增删改查所有数据 + 上传照片到 R2
- 🔐 **单管理员登录**：JWT + HttpOnly Cookie + Web Crypto PBKDF2，无需注册流程
- 💸 **完全免费**：Cloudflare Workers + D1 + R2 免费档够用，不会产生账单

---

## 🧱 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Astro 5 + React 18（仅后台）+ Tailwind v4 + Leaflet |
| API | Hono + jose（JWT）+ Web Crypto API |
| 数据库 | Cloudflare D1（SQLite），JSON 列存嵌套对象 |
| 对象存储 | Cloudflare R2（照片，免出网费） |
| 运行时 | Cloudflare Workers（Astro adapter）|
| 部署 | wrangler CLI / GitHub Actions |

---

## 🚀 部署到自己的 Cloudflare 账户

### 0. 准备

- 一个 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)（免费）
- 已安装 Node 20+ 与 [pnpm](https://pnpm.io/installation)
- 本地登录 wrangler：`pnpm dlx wrangler login`

### 1. 克隆并安装依赖

```bash
git clone <你的 fork 地址>
cd hsn-journeys
pnpm install
```

### 2. 创建 D1 数据库和 R2 桶

```bash
# 创建 D1，记下输出的 database_id
pnpm dlx wrangler d1 create hsn-journeys-db

# 创建 R2 桶
pnpm dlx wrangler r2 bucket create hsn-journeys-photos
```

### 3. 配置 `wrangler.toml`

把上一步的 `database_id` 填进 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "hsn-journeys-db"
database_id = "你的-d1-database-id"   # ← 替换这里
```

（可选）也可以填上 `account_id`（运行 `wrangler whoami` 查看）。

### 4. 设置 JWT 密钥

```bash
# 生成 32 字节随机字符串
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# 设置为生产 secret
pnpm dlx wrangler secret put JWT_SECRET <<< "$JWT_SECRET"

# 本地开发用：写入 .dev.vars
cp .dev.vars.example .dev.vars
echo "JWT_SECRET=$JWT_SECRET" >> .dev.vars
```

### 5. 应用数据库迁移

```bash
# 远程应用 schema（创建 7 张表）
pnpm migrate:remote

# 生成示例 seed SQL（从 data/seed.example.json）
pnpm seed:gen

# 应用 seed 数据到远程
pnpm seed:remote
```

> 想用自己的数据：复制 `data/seed.example.json` → `data/seed.json`，编辑后重新跑 `pnpm seed:gen`。`data/seed.json` 默认不进版本控制。

### 6. 创建管理员账号

```bash
# 生成密码哈希 SQL，交互式输入用户名和密码
pnpm hash

# 把输出的 INSERT SQL 复制下来，写进文件：
echo "<粘贴 SQL>" > /tmp/admin.sql

# 应用到远程
pnpm dlx wrangler d1 execute hsn-journeys-db --remote --file=/tmp/admin.sql
```

也可以非交互式直接跑：

```bash
pnpm tsx scripts/hash-password.ts admin 你的密码
```

### 7. 部署

```bash
pnpm deploy
```

部署完成后访问 `https://hsn-journeys.<你的-subdomain>.workers.dev/`。

也可以在 `wrangler.toml` 里配置自定义域名：

```toml
[[routes]]
pattern = "journeys.yourdomain.com"
custom_domain = true
```

---

## 🛠️ 本地开发

```bash
# 1. 在本地 D1 应用 schema 与 seed
pnpm migrate:local
pnpm seed:gen
pnpm dlx wrangler d1 execute hsn-journeys-db --local --file=migrations/0002_seed.sql

# 2. 本地创建管理员（复用上面的 hash 流程，用 --local 应用）

# 3. 启动开发服务
pnpm dev   # http://localhost:4321
```

---

## 📁 项目结构

```
hsn-journeys/
├── src/
│   ├── pages/                # Astro 页面（前台 + admin shell + API forward）
│   │   ├── index.astro       # 首页
│   │   ├── cities.astro      # 城市足迹
│   │   ├── map.astro         # 地图
│   │   ├── wishlist.astro    # 心愿单
│   │   ├── detail/[id].astro # 旅程详情
│   │   ├── admin/            # 登录页 + 后台 SPA shell
│   │   ├── api/[...path].ts  # 把所有 /api/* 转发到 Hono
│   │   └── r2/[...key].ts    # R2 对象代理（公开读）
│   ├── server/               # Hono API
│   │   ├── app.ts            # Hono 实例
│   │   ├── auth.ts           # JWT 签发 / 密码哈希
│   │   ├── middleware.ts     # requireAdmin
│   │   ├── db.ts             # D1 查询封装 + 类型
│   │   └── routes/           # auth / journeys / sub-cards / wishlist / coords / packing / photos
│   ├── components/           # 前台 Astro 组件（Layout / Navbar）
│   ├── admin/                # 后台 React SPA（react-router）
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── routes/           # Dashboard / 各资源 CRUD
│   │   └── components/       # ItineraryEditor / PhotoUploader / Toast 等
│   ├── lib/                  # 共享工具（icons / format / locations / itinerary）
│   └── styles/global.css     # Tailwind v4 + design tokens
├── migrations/
│   ├── 0001_init.sql         # 表结构（提交到 git）
│   └── 0002_seed.sql         # 由 seed 脚本生成（已 .gitignore）
├── scripts/
│   ├── seed.ts               # 读 data/seed.json 生成 SQL
│   └── hash-password.ts      # PBKDF2 密码哈希
├── data/
│   ├── seed.example.json     # 示例数据（提交到 git）
│   └── seed.json             # 你自己的私有数据（已 .gitignore）
├── astro.config.mjs
├── wrangler.toml
├── package.json
└── tsconfig.json
```

---

## 🗃️ 数据模型

7 张 D1 表：

| 表 | 说明 |
|---|---|
| `users` | 管理员账号（密码 PBKDF2 哈希存储） |
| `journeys` | 旅程主表 |
| `sub_cards` | 子卡片（每段旅程至少一个，承载行程表） |
| `wishlist` | 心愿单 |
| `city_coords` | 城市坐标（地图标记用） |
| `packing_items` | 行李清单（首页可展示） |
| `site_settings` | 站点设置（KV，标题 / 副标题 / footer 等） |

嵌套字段（`cost` / `highlights` / `itinerary_table`）用 JSON 列存储，避免过度规范化。

### 多地点拆分约定（用于地图）

| 字段值含分隔符 | 拆分语义 | 示例 |
|---|---|---|
| `country` 含 `·` | 拆国家 | `日本·韩国` → 日本 / 韩国 |
| `province` 含 `&` | 拆省份 | `四川&重庆` → 四川 / 重庆 |
| `city` 含 `&` | 拆城市 | `成都&重庆` → 成都 / 重庆 |

---

## 🔌 API 端点

公开（无需登录）：

```
GET /api/health
GET /api/journeys             # 列表
GET /api/journeys/:id         # 详情（含 sub_cards）
GET /api/sub-cards?journeyId=N
GET /api/sub-cards/:id
GET /api/wishlist
GET /api/coords
GET /api/packing
GET /api/bootstrap            # 一次拿全所有展示数据
GET /api/auth/me              # 当前登录用户

GET /r2/{key}                 # R2 对象（长缓存）
```

需要管理员登录：

```
POST   /api/auth/login              { username, password }
POST   /api/auth/logout
POST   /api/auth/change-password    { oldPassword, newPassword }

POST   /api/journeys
PUT    /api/journeys/:id
DELETE /api/journeys/:id
POST   /api/journeys/:id/resync     # 从 sub_cards 聚合一级字段

POST   /api/sub-cards
PUT    /api/sub-cards/:id           # 可改 journeyId 实现转移
DELETE /api/sub-cards/:id

POST   /api/wishlist
PUT    /api/wishlist/:id
DELETE /api/wishlist/:id

PUT    /api/coords/:name
DELETE /api/coords/:name

POST   /api/packing
PUT    /api/packing/:id
DELETE /api/packing/:id

POST   /api/photos                  # multipart upload，返回 { key, url }
DELETE /api/photos/:key
```

---

## 📦 npm 脚本一览

| 脚本 | 说明 |
|---|---|
| `pnpm dev` | 启动 Astro 开发服务（默认 4321） |
| `pnpm build` | 生产构建（输出到 `dist/`，自动写 `.assetsignore`） |
| `pnpm deploy` | 构建并部署到 Cloudflare Workers |
| `pnpm seed:gen` | 从 `data/seed.json` 或 `data/seed.example.json` 生成 `migrations/0002_seed.sql` |
| `pnpm migrate:local` | 本地 D1 应用迁移 |
| `pnpm migrate:remote` | 远程 D1 应用迁移 |
| `pnpm seed:local` | 本地应用 seed |
| `pnpm seed:remote` | 远程应用 seed |
| `pnpm hash` | 生成管理员密码哈希 SQL |
| `pnpm typecheck` | Astro 类型检查 |

---

## 🔐 安全要点

- 管理员密码用 PBKDF2-SHA256（100k 迭代）+ 16 字节随机 salt
- 会话用 JWT（HS256）+ HttpOnly + Secure + SameSite=Lax Cookie，默认 7 天有效
- 所有写接口都过 `requireAdmin` 中间件
- Cloudflare Workers Static Assets 默认拦截跨站表单提交（CSRF 防护，无需自己实现）
- `JWT_SECRET` 用 `wrangler secret put` 存在 CF 服务端，不写代码、不写配置文件
- 默认仅暴露 `*.workers.dev` 域名，挂自定义域名时可叠加 Cloudflare WAF 规则

---

## 📜 License

MIT
