# 城市漫游计划 CITYWALK

“用脚步重新认识一座城”的静态 Web 课程设计。网站覆盖南京、北京、成都、大理四座城市，每座城市包含 3 条 Citywalk 路线，共 12 条路线、58 个真实地标站点。

项目使用原生 HTML、CSS 和 JavaScript 完成，不依赖框架、npm、构建工具或后端服务。

## 页面结构

- `index.html`：首页。城市氛围展示、城市入口、精选路线和快速搜索。
- `explore.html`：探索页。关键词搜索、城市/主题/时长/预算筛选、排序、收藏和路线详情。
- `city.html`：城市页。通过 `?id=nanjing`、`?id=beijing`、`?id=chengdu`、`?id=dali` 切换城市，展示介绍、路线和地图。
- `planner.html`：行程页。选择日期与天数、加入路线、拖拽排序、自动排程、预算统计和 TXT 导出。

## 主要功能

- 四城 12 条路线，支持按城市、主题、时长和预算组合筛选。
- 路线收藏与当前行程保存在浏览器 localStorage 中，刷新后仍可保留。
- 单城市 1～3 天行程；每天从 09:00 开始，站点间预留 20 分钟交通时间。
- 同一天内拖拽排序，也可使用上下移动按钮；支持将站点移动到其他日期。
- 自动计算每日开始时间、行程总时长、总预算和预算分类占比。
- 每次只能加入一次同一条路线；跨城市加入时会提示清空并切换当前行程。
- 支持清空行程和导出带 UTF-8 BOM 的 TXT 文件。
- 高德地图可用时显示站点标记、信息窗和虚线连线；未配置 Key 或加载失败时自动显示本地示意地图。
- 响应式布局，支持桌面、平板和手机宽度。

## 运行方式

项目需要通过本地 HTTP 服务器打开，请不要直接双击 HTML 文件使用 `file://` 访问。

在 PowerShell 中执行：

```powershell
cd D:\VScode\web_projects\citywalk
python -m http.server 8000
```

然后打开：

```text
http://127.0.0.1:8000/
```

结束服务器时，在运行服务器的终端按 `Ctrl+C`。

## 高德地图配置（可选）

未配置地图 Key 时，网站会显示本地绘制的示意地图，搜索、筛选、收藏、行程规划和导出等功能仍可正常使用。

如需真实地图：

1. 登录[高德开放平台](https://lbs.amap.com/)，创建应用并添加“Web 端（JS API）”Key。
2. 在 Key 的安全设置中配置域名白名单：
   - `localhost`
   - `127.0.0.1`
3. 如果平台提供安全密钥，请同时复制。
4. 打开 `js/config.js`，填写 Key 与安全密钥：

```js
window.APP_CONFIG = {
  amapKey: "你的高德 Key",
  securityCode: "你的安全密钥"
};
```

5. 重新启动本地服务器并刷新页面。

地图仅用于展示路线站点与连接关系，不提供真实步行导航。

## 目录说明

```text
citywalk/
├── index.html
├── explore.html
├── city.html
├── planner.html
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── pages.css
├── js/
│   ├── config.js
│   ├── data.js
│   ├── storage.js
│   ├── map.js
│   ├── ui.js
│   ├── home.js
│   ├── explore.js
│   ├── city.js
│   └── planner.js
├── assets/images/
│   ├── cities/
│   └── routes/
├── scripts/
│   └── make_assets.py
└── README.md
```

- 页面脚本使用 `defer` 按依赖顺序加载，公共逻辑位于 `ui.js`、`storage.js` 和 `map.js`。
- 所有图片均为本地 SVG 编辑式插画，不依赖远程图片。
- localStorage 使用 `citywalk.favorites.v1` 与 `citywalk.plan.v1` 两个键。
- 本地数据损坏或格式异常时会自动恢复默认状态，并显示提示。

## 数据说明

路线使用真实地标，但站点坐标、停留时间、费用和路线时长均为课程演示用近似数据，不构成实际出行建议。路线预算与站点费用之和保持一致。

## 浏览器支持

建议使用最新版 Chrome 或 Microsoft Edge。项目不兼容 Internet Explorer，第一版只提供浅色主题。