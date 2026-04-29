FROM node:20-alpine

# Prisma PostgreSQL 需要 openssl
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建时用 placeholder URL 生成 Prisma 客户端（不需要真实数据库连接）
# Prisma 6 支持 schema 中的 url = env("DATABASE_URL")
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

# 构建项目
RUN npm run build

EXPOSE $PORT

# 启动时先同步数据库 schema，再启动服务
CMD npx prisma db push --force-reset && npm start
