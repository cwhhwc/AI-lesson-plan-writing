import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => { // 接收 mode 参数
  const isDevelopment = mode === 'development';

  const config = {
    plugins: [
      uni(),
    ],
    // 其他通用配置...
  };

  if (isDevelopment) {
    // 仅在开发环境下添加 server 配置
    config.server = {
      https: {
        key: require('fs').readFileSync('localhost-key.pem'),
        cert: require('fs').readFileSync('localhost.pem'),
      },
      proxy: {
        '/api': {
          target: process.env.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
        },
      },
    };
  }

  return config;
});