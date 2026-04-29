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

# 构建时需要 DATABASE_URL 才能生成 Prisma 客户端（不需要真实连接）
# 用 shell 判断：如果 DATABASE_URL 为空则用 placeholder
RUN DATABASE_URL="${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder}" \
    npx prisma generate

# 构建项目
RUN npm run build

EXPOSE $PORT

# 启动时先同步数据库 schema，再启动服务
CMD npx prisma db push --force-reset && npm start
