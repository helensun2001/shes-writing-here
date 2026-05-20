# Atlas of Women Writers · 女性作家世界图谱

一个浅色、百科全书风格的 3D 地球网页，按写作地点标注 109 部女性作家作品。

## 文件清单

```
atlas/
├── index.html         主页面
├── app.js             three.js 渲染 + 交互
├── color-service.js   年份→颜色映射服务 (独立模块,可单独编辑)
├── women_writers.csv  数据文件 (109 条记录)
└── run.sh             本地启动脚本
```

## 启动方式

因为 `app.js` 用 `fetch` 加载 CSV，浏览器要求 http 协议（不能直接双击 `index.html`）。需要起一个本地 server。

### 最简单的方式（macOS / Linux / WSL）

在 `atlas/` 目录下执行：

```bash
cd atlas
python3 -m http.server 8000
```

然后浏览器打开 <http://localhost:8000>

### 或者运行附带的脚本

```bash
./run.sh
```

### Windows

```bash
cd atlas
python -m http.server 8000
```

## 交互说明

- **拖动**：旋转地球
- **滚轮**：缩放
- **悬停数据点**：显示书名、作者、年代、地点
- **点击数据点**：右侧滑出详情卡片（含作者照片、简介、剧情、详情、标签）
- **搜索框**：模糊匹配任意字段（书名/作者/简介/地点/国籍/年份/领域/剧情/标签）
- **大洲按钮**：按地理区域筛选
- **底部时间轴**：拖动可在公元前 700 到当今之间穿梭,数据点会按写作年份依次亮起或熄灭,跨越年份时附带墨迹晕染动效
- **数据点呼吸**：每个点都是一团缓缓跳动的火光,颜色由年份决定——古老作品偏冷(深靛/苔绿),当代作品偏暖(赭石/朱砂)
- **添加足迹**：点击搜索区下方的「添加足迹」按钮可手动添加新的书本条目
  - 支持填写所有数据字段
  - 支持上传作者照片或封面（自动压缩到 ~80 KB）
  - 可以通过「在地球上选点」按钮直接在球面点击拾取坐标
  - 数据保存在浏览器本地存储（`localStorage`），刷新后仍存在
  - 用户添加的数据点带有苔绿色基调,与时间色温混合
  - 在「your footprints」列表中可以查看/删除已添加条目
- **空闲 6 秒后**：地球自动缓慢旋转
- **Esc**：关闭卡片 / 退出选点模式

## 色彩服务 (color-service.js)

`color-service.js` 是一个独立的模块,负责年份到颜色的映射。
设计逻辑:每个作品都是一团燃烧的火,**越古老的火越冷**(深靛蓝 → 苔绿),
**越当代的火越暖**(赭石 → 朱砂)。

修改调色板或映射逻辑无须改动 `app.js`,直接编辑 `color-service.js` 中的:
- `PALETTE`:6 个控制点的 RGB 值
- `PIVOT_YEAR`:冷暖色相分界年份(默认 1500)
- `yearToT(year)`:核心映射函数

服务在全局暴露为 `window.AtlasColorService`,API:

```js
AtlasColorService.colorForYear(1925)  // => { hex, css, t }
AtlasColorService.setRange(-700, 2026)
AtlasColorService.getRange()           // => { min, max }
AtlasColorService.palette              // 只读
```

## 本地存储说明

用户手动添加的足迹保存在浏览器的 `localStorage` 中，key 是 `atlas:user-books-v1`。
此数据**仅保存在当前浏览器的当前域名下**，清除浏览器数据会将其一并清除。
图片以 base64 JPEG (压缩到 400px) 形式存储；浏览器 localStorage 通常上限 5-10MB，足够保存数十条带图条目。

## 网络依赖

页面会从公开源加载：

- Google Fonts (字体)
- unpkg.com (three.js, papaparse)
- GitHub raw / Natural Earth (海岸线 GeoJSON)
- Wikipedia REST API (作者照片)

如果在受限网络下使用，海岸线和作者图片可能加载失败，但核心地球与数据点不受影响。

## 自定义

- 修改 `women_writers.csv` 即可增删条目
- 字段顺序：`title, author, author_bio, writing_location, nationality, active_city, lat, lon, year, field, summary, tags`
- `tags` 字段用 `;` 分隔多个标签