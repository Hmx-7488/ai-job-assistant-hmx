FROM node:20-alpine

# Prisma PostgreSQL 需要 openssl
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（包含 prisma 用于 migrate）
RUN npm ci

# 复制源代码
COPY . .

# 构建时移走 prisma.config.ts（避免 TS 模块加载失败），用 placeholder URL 生成客户端
# 运行时 Railway 会注入真实 DATABASE_URL，prisma.config.ts 恢复后生效
RUN mv prisma.config.ts prisma.config.ts.bak \
    && DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
       npx prisma generate \
    && mv prisma.config.ts.bak prisma.config.ts

# 构建项目
RUN npm run build

EXPOSE $PORT

# 启动时先同步数据库 schema，再启动服务
CMD npx prisma db push --force-reset && npm start
