// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Project Pages URL: https://smartstartv2.github.io/cohi-landing/
export default defineConfig({
  site: 'https://smartstartv2.github.io',
  base: '/cohi-landing',
  vite: {
    plugins: [tailwindcss()],
  },
});
