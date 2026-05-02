# 115ss 前端

`115ss` 的轻量前端项目，基于 `React + TypeScript + Vite` 构建。

这个前端主要用于日常配置，不承担资源库管理和 TG 抓取管理功能。

## 功能说明

当前前端保留以下页面：

- `TG 设置`
- `115 设置`
- `个人设置`

其中：

- `TG 设置`：配置 TG Bot Token、管理员用户 ID、Bot 代理，以及测试 TG 连接
- `115 设置`：配置站点名称、115 Cookie、转存目录、本地 API 地址
- `个人设置`：修改前端入口自己的账号密码

说明：

- 资源库管理、TG 会话、扫描、定时任务等后台能力已经拆到独立后台管理台中，不在这个仓库里维护
- 前端支持在 `115 设置` 页面中修改 API 地址，适合和后端分开部署在不同机器或不同 NAS 上

## 技术栈

- React 19
- TypeScript
- Vite
- Vitest
- ESLint

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认开发地址：

`http://localhost:5173`

开发模式下，Vite 会把 `/api` 代理到：

`http://localhost:3001`

## 构建命令

```bash
npm run build
```

构建产物输出目录：

`dist/`

本地预览：

```bash
npm run preview
```

## 部署教程

这个前端适合部署为静态站点。

### Docker Compose 模版

仓库里已提供一个最简静态部署模版：

`docker-compose.example.yml`

使用方式：

1. 先构建前端：

```bash
npm install
npm run build
```

2. 复制模版：

```bash
cp docker-compose.example.yml docker-compose.yml
```

3. 启动：

```bash
docker compose up -d
```

默认会把前端站点暴露到：

`http://localhost:8080`

说明：

- 这个模版只负责托管静态前端页面
- 后端 API 需要单独部署在另一台 NAS 或其它服务器上
- 启动后请进入 `115 设置` 页面，填写真实后端 API 地址

### 部署前准备

你需要先准备好后端 API 地址，例如：

- `http://你的后端NAS:3001/api`
- 或 `https://your-domain/api`

### 方案一：部署到 NAS 静态站点目录

1. 本地构建：

```bash
npm install
npm run build
```

2. 把 `dist/` 目录中的所有文件上传到 NAS 的静态站点目录

3. 用浏览器打开前端页面

4. 登录后进入：

`115 设置 -> 前端 API 地址`

5. 填写你的后端 API 地址，例如：

```text
http://你的后端NAS:3001/api
```

6. 点击 `保存 API 地址`

保存后，这个地址会写入当前浏览器本地存储，后续请求都会发到这个后端地址。

### 方案二：反向代理部署

如果你有 Nginx、Caddy 或 NAS 自带反向代理，也可以把前端挂在一个域名下。

例如：

- 前端：`https://frontend.example.com`
- 后端：`https://backend.example.com/api`

部署流程仍然一样：

1. 构建前端
2. 上传 `dist/`
3. 打开前端站点
4. 在 `115 设置` 中填写后端 API 地址

## API 地址设置说明

前端不会把 API 地址写入后端数据库，而是：

- 只保存在当前浏览器
- 只影响当前这台设备当前这个浏览器

规则如下：

- 留空：使用当前站点的 `/api`
- 填写 `http://host:3001`：系统会自动补成 `http://host:3001/api`
- 填写 `http://host:3001/api`：系统直接使用该地址

## 推荐部署结构

如果你是双 NAS 部署，推荐这样分：

- 前端 NAS：部署本仓库构建后的 `dist/`
- 后端 NAS：部署后端服务

然后在前端页面的 `115 设置` 里把 API 地址指向后端 NAS。

## 常用命令

```bash
npm run dev
npm run build
npm run test
npm run lint
```

## 注意事项

- 不要把 `.env`、密钥、Cookie、后端私有配置提交到公开仓库
- `dist/` 和 `node_modules/` 不建议提交
- 如果前后端是跨域部署，请确认后端已正确配置 CORS 和登录 Cookie 策略

## 仓库定位

这个仓库是公开前端仓库。

后端服务、后台管理台、TG 会话抓取、资源库管理等私有能力应放在独立私有仓库中维护。
