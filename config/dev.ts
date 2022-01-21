import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// @ts-ignore
const path = require('path');
// @ts-ignore
const resolve = (s:String) => path.resolve(__dirname, '../', s);

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: 'examples/main.ts'
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                charset: false,
                additionalData: `@import "@/style/global";`
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve('src'),
            '@component': resolve('src/component'),
            '@utils': resolve('src/utils')
        }
    },
    plugins: [
        vue(),
        vueJsx()
    ]
})
