# 2048 游戏 - 带排行榜

经典的 2048 游戏，集成了 Neon PostgreSQL 数据库的在线排行榜功能。

## 功能特性

- 经典 2048 游戏玩法
- 撤销功能（最多10步）
- 本地最高分记录
- **在线排行榜（前10名）**
- 响应式设计，支持移动端
- 流畅的动画效果

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

`.env` 文件已经配置好了 Neon 数据库连接。

### 3. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 4. 打开游戏

在浏览器中访问 `http://localhost:3000`

## 游戏说明

- 使用 **方向键** 或 **WASD** 键移动方块
- 在移动端可以使用 **滑动手势**
- 按 **Ctrl+Z** 或点击 **撤销** 按钮撤销上一步
- 游戏结束后可以提交分数到排行榜

## 文件结构

```
2048/
├── index.html    # 主HTML文件
├── style.css     # 样式和动画
├── script.js     # 游戏逻辑
├── server.js     # Express后端服务器
├── .env          # 环境变量配置
└── README.md     # 说明文档
```

## API 接口

### 获取排行榜
```
GET /api/leaderboard
```

### 提交分数
```
POST /api/score
Content-Type: application/json

{
  "playerName": "玩家名称",
  "score": 分数
}
```

## 技术栈

- 前端：原生 JavaScript + CSS3
- 后端：Node.js + Express
- 数据库：Neon PostgreSQL
- 部署：可部署到任何支持 Node.js 的平台

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- CSS Animations
- Touch events (for mobile)

## Customization

### Colors
Modify tile colors in `style.css` by editing the `.tile-*` classes.

### Grid Size
Change `this.gridSize = 4` in `script.js` (Game2048 constructor) to create larger/smaller grids.

### Winning Number
The game can continue past 2048 - just change the tile classes in `script.js` to support higher numbers.

## Credits

Inspired by the original 2048 game by Gabriele Cirulli and the implementation at [simonaking.com/2048](https://simonaking.com/2048/).