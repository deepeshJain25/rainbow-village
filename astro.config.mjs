import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// The Cloudflare adapter is added with the first API route.
export default defineConfig({
  integrations: [react()],
  // The weekly menu page became Meals and Nutrition.
  redirects: {
    '/weekly-menu': '/meals',
  },
});
