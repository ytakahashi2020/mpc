import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 配信用の base パス。
// リポジトリ名が `mpc` の場合 https://<user>.github.io/mpc/ に対応する。
export default defineConfig({
  plugins: [react()],
  base: '/mpc/',
})
