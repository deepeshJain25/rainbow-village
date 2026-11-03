import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// The Cloudflare adapter is added with the first API route.
export default defineConfig({
  integrations: [react()],
});
