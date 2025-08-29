import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // 在测试环境中启用全局 API
    globals: true,
    // 使用 jsdom 模拟 DOM 环境
    environment: 'jsdom',
    // 指定测试文件的匹配模式
    include: ['tests/**/*.test.{js,ts}'],
    // 指定在运行测试前需要执行的设置文件
    // 这个文件非常重要，用于 mock uni 的 API
    setupFiles: ['./tests/setup.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
