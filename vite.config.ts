import solid from 'solid-start/vite'
// @ts-ignore
import vercel from 'solid-start-vercel'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solid({ adapter: vercel({ edge: false, prerender: true }) })],
})
