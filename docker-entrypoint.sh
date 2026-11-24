#!/bin/sh
set -e

# Chạy migration trước khi start server (giống Build command trên Render).
# Đặt RUN_MIGRATIONS=false nếu migration được chạy ở bước khác
# (ví dụ k8s Job/initContainer, để nhiều replica không migrate cùng lúc).
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  npm run db:migrate
fi

# Seed tài khoản mẫu. Mặc định TẮT: image này cũng dùng cho production, không được tự tạo
# tài khoản có mật khẩu công khai. docker-compose.yml (chỉ dùng local) bật RUN_SEED=true.
# Seed idempotent (upsert theo email) nên chạy lại mỗi lần start không tạo trùng.
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

# exec: node THAY THẾ shell (giữ nguyên PID). Không có exec thì shell đứng giữa
# và không chuyển SIGTERM cho node -> docker stop / k8s phải chờ rồi giết cứng (SIGKILL).
#
# Lưu ý: exec là điều kiện CẦN, chưa ĐỦ. Nếu node là PID 1, kernel bỏ qua hành vi
# mặc định của SIGTERM, node chỉ tắt khi code có process.on("SIGTERM", ...) (ticket #63).
# Trong lúc chưa có handler: compose dùng `init: true` (tini làm PID 1, chuyển tín hiệu cho node).
exec "$@"
