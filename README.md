# invoice_system_app

基于 Feature-Sliced Design (FSD) 架构的发票系统前端（React Web），配置参考 `order_customer_app`。

## 快速开始

```bash
cd invoice_system_app
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:5174`，API 代理到 `http://localhost:8084`（`invoice_system` 后端）。

## 构建

```bash
npm run build
```

构建产物在 `dist/` 目录，可复制到 `invoice_system/src/main/resources/static/` 与后端统一部署。

## 项目结构

```
src/
├── app/          # 应用层：路由、根组件
├── pages/        # 页面层
├── components/   # 功能组件层
├── entities/     # 实体数据层
└── shared/       # 共享层：API、常量、i18n、样式
```

## 环境变量

| 文件 | 说明 |
|------|------|
| `.env.development` | 开发环境，`VITE_API_BASE_URL=http://localhost:8084` |
| `.env.production` | 生产环境，按实际部署地址修改 |
