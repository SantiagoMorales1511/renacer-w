// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://renacer-ahora.com',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'viewport' },
  integrations: [
    react({ include: ['**/react-admin/**'] }),
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],
  image: { responsiveStyles: false },
  vite: {
    // Los paneles admin heredados leen VITE_* (p. ej. VITE_ADMIN_ACCESS_CODE).
    envPrefix: ['PUBLIC_', 'VITE_'],
  },
})
