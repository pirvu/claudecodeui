import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const host = env.HOST || '0.0.0.0'
  // When binding to all interfaces (0.0.0.0), proxy should connect to localhost
  // Otherwise, proxy to the specific host the backend is bound to
  const proxyHost = host === '0.0.0.0' ? 'localhost' : host
  const port = env.PORT || 3001
  const httpsEnabled = env.HTTPS === 'true'

  const plugins = [react()]
  if (httpsEnabled) {
    plugins.push(basicSsl())
  }

  return {
    plugins,
    server: {
      host,
      port: parseInt(env.VITE_PORT) || 5173,
      https: httpsEnabled ? true : undefined,
      proxy: {
        '/api': `http://${proxyHost}:${port}`,
        '/ws': {
          target: `ws://${proxyHost}:${port}`,
          ws: true
        },
        '/shell': {
          target: `ws://${proxyHost}:${port}`,
          ws: true
        }
      }
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-codemirror': [
              '@uiw/react-codemirror',
              '@codemirror/lang-css',
              '@codemirror/lang-html',
              '@codemirror/lang-javascript',
              '@codemirror/lang-json',
              '@codemirror/lang-markdown',
              '@codemirror/lang-python',
              '@codemirror/theme-one-dark'
            ],
            'vendor-xterm': ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-clipboard', '@xterm/addon-webgl']
          }
        }
      }
    }
  }
})
