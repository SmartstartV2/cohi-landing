// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// For project Pages (username.github.io/cohi-landing/), keep base as '/cohi-landing'.
// For a user/org site (username.github.io), set base to '/'.
export default defineConfig({
  site: 'https://example.github.io',
  base: '/cohi-landing',
  vite: {
    plugins: [tailwindcss()],
  },
});
