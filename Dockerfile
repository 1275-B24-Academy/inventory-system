# syntax=docker/dockerfile:1

# Một image duy nhất: Express vừa chạy API vừa serve bản build của client
# (giống production trên Render, xem server/src/app.js).
#
# Build:  docker build -t inventory .
# Chạy:   xem docker-compose.yml (cần Postgres + biến môi trường)

# ARG: biến CHỈ có lúc build, đổi được bằng `docker build --build-arg NODE_VERSION=24 .`
# Khai báo trước FROM đầu tiên thì mọi dòng FROM đều dùng được.
# Giữ khớp với "engines" trong server/package.json.
# Không truyền secret qua ARG: giá trị nằm lại trong history của image.
ARG NODE_VERSION=22

# ---------- Stage 1: build client (Vite) ----------
FROM node:${NODE_VERSION}-slim AS client-build
WORKDIR /app/client

# Copy package*.json trước để Docker cache layer `npm ci`
# (chỉ cài lại khi dependency đổi, không cài lại mỗi lần sửa code).
COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
# Không đặt VITE_API_URL -> client gọi /api cùng domain.
RUN npm run build

# ---------- Stage 2: cài dependency production của server ----------
FROM node:${NODE_VERSION}-slim AS server-deps
WORKDIR /app/server

COPY server/package.json server/package-lock.json ./
# `postinstall` chạy `prisma generate` nên phải có schema + prisma.config.js trước khi npm ci.
COPY server/prisma ./prisma
COPY server/prisma.config.js ./
RUN npm ci --omit=dev

# ---------- Stage 3: image chạy thật ----------
FROM node:${NODE_VERSION}-slim AS runtime

# LABEL: metadata gắn vào image (xem bằng `docker inspect`), không ảnh hưởng lúc chạy.
# Key "org.opencontainers.image.*" là chuẩn OCI. GHCR đọc "source" để tự liên kết image với repo.
LABEL org.opencontainers.image.title="inventory-system" \
      org.opencontainers.image.description="Inventory app: Express API + React client" \
      org.opencontainers.image.source="https://github.com/1275-B24-Academy/inventory-system"

ENV NODE_ENV=production
WORKDIR /app

# Giữ đúng cấu trúc thư mục repo: app.js tìm client ở ../../client/dist.
# --chown ngay lúc COPY (thay vì chown -R sau) để không nhân đôi dung lượng layer.
COPY --chown=node:node --from=server-deps /app/server/node_modules ./server/node_modules
COPY --chown=node:node --from=server-deps /app/server/src/generated ./server/src/generated
COPY --chown=node:node server/package.json ./server/
COPY --chown=node:node server/prisma ./server/prisma
COPY --chown=node:node server/prisma.config.js ./server/
COPY --chown=node:node server/src ./server/src
COPY --chown=node:node --from=client-build /app/client/dist ./client/dist
COPY --chown=node:node docker-entrypoint.sh ./

# Không chạy bằng root: nếu app bị khai thác, kẻ tấn công không có quyền root trong container.
USER node
WORKDIR /app/server

EXPOSE 3000

# Dùng /health (không query DB) giống liveness probe của k8s.
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
