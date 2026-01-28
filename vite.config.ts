
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode`. The third param '' allows loading non-VITE variables too.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      // We expose both to be safe, but VITE_API_KEY is preferred by the build tool
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || '')
    },
    server: {
      host: true, 
      port: 5173,
      strictPort: true
    }
  };
});
