# MPC — Interactive Demo / マルチパーティ計算 体験デモ

Touch-to-understand interactive demo of **Secure Multi-Party Computation (MPC)**. Bilingual EN / 日本語.

誰も中身を見られないデータで計算する — 触って理解する、二言語（英語 / 日本語）対応のインタラクティブデモ。

## What you can explore / 体験できること

1. **Secret Sharing / 秘密分散** — Split a secret into shares that are useless alone; only all of them together rebuild it. スライダーで秘密を分割し、合計でだけ復元できることを体験。
2. **Additive MPC / 加算的MPC** — Three parties compute their total by exchanging shares, revealing only the sum. シェアを交換して合計だけを求めるプロトコルを段階表示。
3. **Random Masking / 乱数マスキング** — Zero-sum random masks hide each value yet cancel in the total. 合計0のマスクで各値を隠し、合計だけを取り出す。
4. **Millionaires' Problem / 百万長者問題** — Decide who is richer without revealing either fortune (Yao / garbled circuits intro). 金額を明かさずに大小だけを判定する古典問題。

## Tech stack

- React 18 + Vite + TypeScript
- All field arithmetic (`Z_p`) runs locally in the browser — no backend, no network.
- Deployed to GitHub Pages via GitHub Actions.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the build
```

## Deploy (GitHub Pages)

1. Push to the `main` branch — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.
2. In the repo settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
3. The site serves under `https://<user>.github.io/mpc/`. If your repo name differs, update `base` in `vite.config.ts`.

## Note

Educational demo. Real MPC uses larger fields, secure channels, and protections against malicious parties. Here, simplifications are made for clarity — see "Show the math" in each section.

教育目的のデモです。実運用のMPCはより大きな有限体・安全な通信路・不正パーティ対策を用います。各セクションの「数式を見る」で詳細を確認できます。
