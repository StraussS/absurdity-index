# Deployment Guide

## Recommended stack

当前推荐部署方式：

- Node.js 20+
- npm
- PM2
- Nginx

## 1. Install dependencies

```bash
cd web
npm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

至少检查以下变量：

```bash
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
ABSURDITY_SOURCE_CONFIG_URL=
ABSURDITY_ENABLED_SOURCES=
ABSURDITY_DISABLED_SOURCES=
ABSURDITY_SOURCE_LIMITS=
```

如果不配置 `OPENAI_API_KEY`，项目应仍可使用规则层运行，只是解释层和评分增强会弱一些。

## 3. Build

```bash
npm run build
```

## 4. Start with PM2

推荐使用下面的启动方式：

```bash
pm2 start npm --name absurdity-index -- start
```

如果需要先进入 `web/` 目录，可写成：

```bash
cd /path/to/absurdity-index/web
pm2 start npm --name absurdity-index -- start
```

常用命令：

```bash
pm2 ls
pm2 logs absurdity-index
pm2 restart absurdity-index
pm2 stop absurdity-index
pm2 delete absurdity-index
pm2 save
```

## 5. Nginx reverse proxy

示例：

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

如果已经启用 HTTPS，请把对应 `server_name`、证书路径和 443 配置补齐。

## 6. Verify

部署后建议依次检查：

- 首页是否正常打开
- `/status` 是否可访问
- `/api/today` 是否返回 JSON
- `/api/status` 是否返回 JSON
- PM2 是否显示 `online`
- Nginx 反代是否指向正确端口

## Notes

### 关于缓存目录

下面这些目录通常不建议提交到 Git：

- `web/data/ai-cache/`
- `web/data/translation-cache/`
- `web/.next/`
- `web/node_modules/`

### 关于历史数据

`web/data/history/*.json` 是否提交，取决于你想把仓库当作：

1. 纯代码仓库
2. 代码 + 示例数据仓库
3. 代码 + 真实历史归档仓库

目前更推荐至少保留少量示例 history，方便别人理解这个项目产出的数据结构。
