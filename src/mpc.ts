// MPC の中核ロジック。すべて有限体 Z_p 上の実際の演算として実装する。
// 教育用に小さめの素数を使い、シェアや合計が画面に収まるようにしている。

// 体の位数。入門者が見やすいよう小さめの素数 101 を採用する。
// 各セクションの入力は 0〜20 に制限してあり、最大合計（4パーティ × 20 = 80）が
// 101 未満になるので、「本当の合計 / 単純な合計」が mod により化けることはない。
export const FIELD_P = 101

// 乱数源。デモの「シェアは真に一様・秘密と独立」という主張を本当に成り立たせるため、
// ブラウザの暗号学的乱数(crypto.getRandomValues)を使う。無い環境では Math.random に退避。
// 戻り値は [0,1) の関数で、呼び出し側のインターフェースは従来どおり。
export function makeRng(_seed?: number) {
  void _seed // seed は「引き直し」をトリガするためだけに使い、乱数自体には混ぜない（秘密非依存）
  const cryptoObj = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined
  return () => {
    if (cryptoObj && cryptoObj.getRandomValues) {
      const buf = new Uint32Array(1)
      cryptoObj.getRandomValues(buf)
      return buf[0] / 0x100000000
    }
    return Math.random()
  }
}

// 0 以上 maxExclusive 未満の一様乱数整数。剰余バイアスを避けるため棄却サンプリングする。
export function randInt(rng: () => number, maxExclusive: number): number {
  // [0, 2^32) を maxExclusive で割り切れる範囲に丸め、はみ出した値は捨てる。
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
  let x: number
  do {
    x = Math.floor(rng() * 0x100000000)
  } while (x >= limit)
  return x % maxExclusive
}

// 正の剰余（負数にも対応）。
export function mod(n: number, p = FIELD_P): number {
  return ((n % p) + p) % p
}

// 「負の数も許す」整数シェアに分割する（百万長者問題で差の符号を素直に読むため）。
// mod を使わないので、シェアどうしを普通に足し引きでき、合計＝secret がそのまま成り立つ。
// 先頭 n-1 個は [-spread, spread] のランダム整数、最後の1個で辻褄を合わせる。
export function signedShares(secret: number, n: number, rng: () => number, spread = 12): number[] {
  const shares: number[] = []
  let acc = 0
  for (let i = 0; i < n - 1; i++) {
    const r = randInt(rng, 2 * spread + 1) - spread // [-spread, +spread]
    shares.push(r)
    acc += r
  }
  shares.push(secret - acc) // 残りで合計を secret に合わせる
  return shares
}

// secret を n 個の加算的シェアに分割する。
// 先頭 n-1 個はランダム、最後の1個で辻褄を合わせる。合計（mod p）が secret に一致する。
export function additiveShares(secret: number, n: number, rng: () => number): number[] {
  const shares: number[] = []
  let acc = 0
  for (let i = 0; i < n - 1; i++) {
    const r = randInt(rng, FIELD_P)
    shares.push(r)
    acc = mod(acc + r)
  }
  shares.push(mod(secret - acc))
  return shares
}

// シェアの合計（mod p）。復元はこれだけで済む（加算的秘密分散の場合）。
export function reconstruct(shares: number[]): number {
  return shares.reduce((s, x) => mod(s + x), 0)
}

// 合計するとちょうど 0 (mod p) になる n 個のマスクを作る。
export function zeroSumMasks(n: number, rng: () => number): number[] {
  const masks: number[] = []
  let acc = 0
  for (let i = 0; i < n - 1; i++) {
    const r = randInt(rng, FIELD_P)
    masks.push(r)
    acc = mod(acc + r)
  }
  masks.push(mod(-acc))
  return masks
}

// 加算的MPC のシェア交換行列を作る。
// matrix[giver][receiver] = giver が receiver に渡すシェア。
// 各 giver の行の合計（mod p）は giver の秘密値に等しい。
export function shareMatrix(values: number[], rng: () => number): number[][] {
  return values.map((v) => additiveShares(v, values.length, rng))
}

// 各 receiver が受け取ったシェアの合計（列ごとの和）。
export function localSums(matrix: number[][]): number[] {
  const n = matrix.length
  const sums = new Array(n).fill(0)
  for (let giver = 0; giver < n; giver++) {
    for (let receiver = 0; receiver < n; receiver++) {
      sums[receiver] = mod(sums[receiver] + matrix[giver][receiver])
    }
  }
  return sums
}
