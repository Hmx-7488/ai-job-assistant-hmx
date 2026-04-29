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

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建项目
RUN npm run build

EXPOSE $PORT

# 启动时先运行数据库迁移，再启动服务
CMD npx prisma migrate deploy && npm start
