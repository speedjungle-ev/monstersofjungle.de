import {defineConfig} from 'vite';

export default defineConfig({
    base: import.meta.env.VITE_BASE_URL
})