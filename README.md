# HSN Journey Traces · 旅行足迹

> 用脚步丈量世界，记录旅途中的风景、故事与感动。

一个轻量、纯粹的静态旅行记录网站，无需后端与数据库，数据本地存储，随时随地回顾你的旅程。

---

## 功能特性

- **首页总览** — 统计足迹城市数、旅行记录数与精彩瞬间，展示最近旅程
- **城市足迹** — 可折叠的层级卡片，一览所有旅行记录，支持展开查看子行程
- **足迹地图** — 基于 Leaflet 的交互式地图，标记国内外旅行地点
- **旅行详情** — 单页展示行程故事、景点、费用明细、行程安排与照片
- **心愿单** — 记录未来想去的旅行目的地与计划
- **行李清单** — 内置详细的出行物品备忘表
- **数据管理** — 支持新增、编辑、删除旅程，所有数据持久化到本地存储

---

## 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 | 语义化页面结构 |
| CSS3 | 响应式布局，Flexbox / Grid |
| JavaScript (ES6+) | 原生 JS，无框架依赖 |
| [Leaflet](https://leafletjs.com/) | 开源交互地图库 |
| [OpenStreetMap](https://www.openstreetmap.org/) | 地图底图数据源 |
| LocalStorage | 本地数据持久化 |

---

## 项目结构

```
.
├── index.html          # 首页（统计 + 最近旅程 + 行李清单）
├── cities.html         # 城市足迹列表
├── map.html            # 足迹地图
├── wishlist.html       # 心愿单
├── detail.html         # 旅行详情页
├── add.html            # 添加新旅程
├── styles.css          # 全局样式
├── data.js             # 数据层：旅程与心愿单数据模型、CRUD 操作
├── script.js           # 首页逻辑
├── cities.js           # 城市足迹页：卡片渲染与编辑
├── map.js              # 地图页：坐标数据与地图初始化
├── detail.js           # 详情页：渲染与表单编辑
├── wishlist.js         # 心愿单渲染
└── design-system/      # 设计规范文档
    └── hsn-journey-traces/
        └── MASTER.md
```

---

## 快速开始

### 本地运行

本项目为纯静态站点，任意 HTTP 服务器均可运行：

```bash
# 方式一：Python 内置服务器
python3 -m http.server 8080

# 方式二：Node.js 的 serve
npx serve .

# 方式三：VS Code Live Server 插件
```

然后浏览器访问 `http://localhost:8080` 即可。

### 直接打开

由于使用 `localStorage` 存储数据，建议通过本地服务器访问；如直接打开 `index.html`，部分浏览器可能限制本地存储功能。

---

## 页面说明

| 页面 | 路径 | 功能描述 |
|------|------|----------|
| 首页 | `/index.html` | 查看统计数据、最近旅程与行李清单 |
| 城市足迹 | `/cities.html` | 浏览全部旅程，一键展开/折叠，支持编辑 |
| 足迹地图 | `/map.html` | 在地图上查看所有旅行地点标记（蓝色=国内，红色=国际）|
| 心愿单 | `/wishlist.html` | 查看未来计划前往的目的地 |
| 添加旅程 | `/add.html` | 填写表单新增一次旅行记录 |
| 旅行详情 | `/detail.html?id=1` | 查看单次旅行的完整信息与故事 |

---

## 旅程数据模型

每条旅程记录包含以下信息：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Number | 唯一标识 |
| `province` | String | 省份/大区，如 "福建"、"欧洲" |
| `city` | String | 城市，如 "厦门"、"法瑞意" |
| `country` | String | 国家，如 "中国"、"法国·瑞士·意大利" |
| `date` / `endDate` | String | 起止日期（YYYY-MM-DD）|
| `title` | String | 旅程标题 |
| `emoji` | String | 代表图标 |
| `description` | String | 简介 |
| `highlights` | Array | 景点列表 |
| `story` | String | 详细游记故事 |
| `cost` | Object | 费用明细：报团、交通、住宿、餐饮 |
| `itinerary` | Array | 每日行程安排 |
| `photo` | String | 照片（Base64 数据URL）|
| `subCards` | Array | 子行程卡片（可选）|

> **多地点拆分规则**：`city` / `province` 中使用 `&` 连接表示国内多城市；`country` 中使用 `·` 连接表示国际多国家。系统会自动拆分生成地图标记与次级卡片。

---

## 设计规范

- **主色调**：`#18181B`（深色）+ `#2563EB`（蓝色强调）
- **背景色**：`#FAFAFA`
- **标题字体**：Caveat（手写风格）
- **正文字体**：Quicksand
- **设计风格**：简洁、轻量、响应式，支持移动端适配

详细规范见 [`design-system/hsn-journey-traces/MASTER.md`](./design-system/hsn-journey-traces/MASTER.md)。

---

## 注意事项

1. **数据存储**：所有数据保存在浏览器 `localStorage` 中，清除浏览器数据会导致记录丢失。如需备份，可导出 `localStorage` 中 `hsn-journeys` 键的值。
2. **地图坐标**：新增地点如需在地图正确显示，需在 `map.js` 的 `cityCoordinates` 数组中补充经纬度。
3. **照片存储**：上传的照片以 Base64 形式存储于本地，大图片可能占用较多存储空间。

---

## License

本项目为个人开源项目，仅供学习与交流使用。
