import { defineConfig } from "vitest/config";
import { TEST_ENV } from "./tests/testEnv.js";

export default defineConfig({
  test: {
    env: TEST_ENV,
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/generated/**", "src/server.js"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
          globalSetup: ["tests/integration/globalSetup.js"],
          // Các file test dùng chung một DB nên phải chạy lần lượt, nếu không sẽ giẫm chân nhau.
          fileParallelism: false,
          // Lần đầu argon2 + kết nối DB có thể chậm hơn unit test.
          testTimeout: 15_000,
        },
      },
    ],
  },
});
