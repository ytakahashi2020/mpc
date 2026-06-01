// MPC の中核ロジック。すべて有限体 Z_p 上の実際の演算として実装する。
// 教育用に小さめの素数を使い、シェアや合計が画面に収まるようにしている。

// 体の位数。デモ用に十分大きく、かつ表示しやすい素数を選ぶ。
export const FIELD_P = 2741

// 0 以上 max 未満の擬似乱数整数。シード可能にして「引き直し」を再現可能にする。
// （Math.random は使わず、線形合同法で seed から決定的に生成する）
export function makeRng(seed: number) {
  let state = (seed >>> 0) || 1
  return () => {
    // 32bit LCG (Numerical Recipes 係数)
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function randInt(rng: () => number, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive)
}

// 正の剰余（負数にも対応）。
export function mod(n: number, p = FIELD_P): number {
  return ((n % p) + p) % p
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

// 値を16進の「ガーブルされた」見た目に変換する（百万長者問題の演出用）。
// 実際の Garbled Circuit ではなく、入力が秘匿される雰囲気を伝えるための簡易表現。
export function garble(value: number, salt: number): string {
  // 値とソルトを混ぜて決定的な擬似ハッシュ文字列にする。
  let h = (value ^ salt) >>> 0
  h = (h * 2654435761) >>> 0
  return h.toString(16).padStart(8, '0').slice(0, 8)
}

// 16進ハッシュ風文字列を seed から生成（マスクなどの「見た目」用）。
export function hexNoise(seed: number, len = 6): string {
  let h = (seed * 2246822519) >>> 0
  h = (h ^ (h >>> 13)) >>> 0
  return h.toString(16).padStart(8, '0').slice(0, len)
}
