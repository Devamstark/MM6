import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Raise the warning limit slightly so we don't get noise
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                // Manual chunk splitting — keeps the initial bundle small
                manualChunks: {
                    // Core React runtime (tiny, cached forever after first visit)
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    // Animation library (large, only needed when animations play)
                    'vendor-motion': ['framer-motion'],
                    // Charting (only needed on admin dashboard)
                    'vendor-charts': ['recharts'],
                    // Radix UI primitives
                    'vendor-radix': ['@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
                    // Icons tree-shaken but still worth splitting
                    'vendor-icons': ['lucide-react'],
                },
            },
        },
    },
    // Pre-bundle dependencies for faster cold starts in dev
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'framer-motion',
            'lucide-react',
        ],
    },
})
