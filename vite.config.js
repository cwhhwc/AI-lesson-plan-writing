import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

console.log('Loading vite.config.js configuration...');
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    console.log('qweVite server started'),
    uni(),
  ],
  
  server: {
    https: {
      key: require('fs').readFileSync('localhost-key.pem'),
      cert: require('fs').readFileSync('localhost.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://rgcwdfzvbeib.sealosbja.site',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
                configure: (proxy, options) => {
          console.log('Proxy configured with options:', options);
          console.log('--- Vite Proxy Configuration for /api ---');
          console.log('Target:', options.target);
          console.log('Change Origin:', options.changeOrigin);
          console.log('Secure:', options.secure);
          console.log('Cookie Domain Rewrite:', options.cookieDomainRewrite);
          console.log('-----------------------------------------');
        },
      },
    },
  },
})