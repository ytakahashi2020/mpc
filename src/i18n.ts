// 二言語（英語 / 日本語）の文言辞書と、簡易 i18n フック。
// merkle-tree デモと同様に、UI 全体を EN / JA で切り替える。

import { createContext, useContext } from 'react'

export type Lang = 'en' | 'ja'

// 各文言は { en, ja } のペア。{n} のようなプレースホルダは t() の引数で置換する。
type Entry = { en: string; ja: string }

export const dict = {
  // --- 共通 / ヘッダー ---
  appTitle: { en: 'Secure Multi-Party Computation', ja: 'マルチパーティ計算（MPC）' },
  appSubtitle: {
    en: 'Compute on data nobody is allowed to see — touch to understand.',
    ja: '誰も中身を見られないデータで計算する — 触って理解する。',
  },
  langName: { en: 'English', ja: '日本語' },

  // --- ナビ（セクション名） ---
  navIntro: { en: 'What is MPC?', ja: 'MPCとは？' },
  navShares: { en: 'Secret Sharing', ja: '秘密分散' },
  navAdd: { en: 'Additive MPC', ja: '加算的MPC' },
  navMask: { en: 'Random Masking', ja: '乱数マスキング' },
  navMillionaire: { en: "Millionaires' Problem", ja: '百万長者問題' },

  // --- イントロ ---
  introHeading: { en: 'Compute together, reveal nothing', ja: 'いっしょに計算、でも中身は秘密' },
  introBody: {
    en: 'Several people each hold a private number. They want to learn one result — a sum, an average, a comparison — without ever showing their own number to anyone. MPC makes this possible. Work through the four interactive sections below.',
    ja: '複数の人がそれぞれ秘密の数字を持っています。誰一人として自分の数字を他人に見せることなく、合計・平均・比較といった「1つの答え」だけを知りたい。MPCはそれを可能にします。下の4つの体験セクションを順に進めてみましょう。',
  },
  introCardSharesTitle: { en: 'Secret Sharing', ja: '秘密分散' },
  introCardSharesBody: {
    en: 'Split one secret into pieces that are useless alone.',
    ja: '1つの秘密を、単体では役に立たない欠片に分割する。',
  },
  introCardAddTitle: { en: 'Additive MPC', ja: '加算的MPC' },
  introCardAddBody: {
    en: 'Add up everyone’s pieces to get the total — and only the total.',
    ja: 'みんなの欠片を足し合わせ、合計「だけ」を得る。',
  },
  introCardMaskTitle: { en: 'Random Masking', ja: '乱数マスキング' },
  introCardMaskBody: {
    en: 'Hide each value under random noise that cancels out.',
    ja: '各値を、最後に打ち消し合う乱数で隠す。',
  },
  introCardMillionaireTitle: { en: "Millionaires' Problem", ja: '百万長者問題' },
  introCardMillionaireBody: {
    en: 'Decide who is richer without revealing either fortune.',
    ja: 'どちらの財産も明かさずに、お金持ちはどちらかを判定する。',
  },
  introStart: { en: 'Start →', ja: '始める →' },

  // --- 秘密分散セクション ---
  sharesHeading: { en: 'Secret Sharing', ja: '秘密分散' },
  sharesIntro: {
    en: 'A secret is split into N shares. Each holder sees only random-looking noise. Only by combining all the shares can the secret be rebuilt. Move the slider and watch the shares change — but their sum (mod field) always returns to the secret.',
    ja: '秘密を N 個のシェア（欠片）に分割します。各保管者にはランダムなノイズにしか見えません。すべてのシェアを合わせて初めて秘密が復元できます。スライダーを動かすとシェアが変わりますが、その合計（mod 演算）は常に元の秘密に戻ります。',
  },
  sharesSecretLabel: { en: 'Your secret number', ja: 'あなたの秘密の数字' },
  sharesPartiesLabel: { en: 'Number of parties', ja: 'パーティの数' },
  sharesReshuffle: { en: 'Re-randomize shares', ja: 'シェアを引き直す' },
  sharesPartyN: { en: 'Party {n}', ja: 'パーティ{n}' },
  sharesShareLabel: { en: 'share', ja: 'シェア' },
  sharesSumLabel: { en: 'Sum of all shares (mod {p})', ja: '全シェアの合計（mod {p}）' },
  sharesRecovered: { en: 'Recovered secret', ja: '復元された秘密' },
  sharesNote: {
    en: 'Tip: hide any one share and the secret is unrecoverable. Each share on its own reveals nothing.',
    ja: 'ヒント：どれか1つでもシェアを隠すと秘密は復元できません。シェア単体からは何も分かりません。',
  },

  // --- 加算的MPCセクション ---
  addHeading: { en: 'Additive MPC: a private sum', ja: '加算的MPC：秘密の合計' },
  addIntro: {
    en: 'Three friends want their total salary without telling each other their own. Each splits their salary into shares and sends one share to each friend. Everyone adds the shares they received, announces the local total, and the grand total appears — yet no individual salary is ever exposed.',
    ja: '3人の友人が、互いに自分の給料を明かさずに合計を知りたい。各自が給料をシェアに分け、1つずつ全員に配ります。各自は受け取ったシェアを足して「手元の合計」を発表すると、全体の合計が現れます。それでも個々の給料は決して露見しません。',
  },
  addInputLabel: { en: "Party {n}'s private value", ja: 'パーティ{n}の秘密の値' },
  addStep1: { en: '1. Each party splits its value into shares', ja: '1. 各パーティが値をシェアに分割' },
  addStep2: { en: '2. Shares are exchanged (column = receiver)', ja: '2. シェアを交換（列＝受け取る人）' },
  addStep3: { en: '3. Each party sums what it received', ja: '3. 各パーティが受け取った分を合計' },
  addStep4: { en: '4. Local sums are added → grand total', ja: '4. 手元の合計を足す → 全体の合計' },
  addReveal: { en: 'Run the protocol', ja: 'プロトコルを実行' },
  addGrandTotal: { en: 'Grand total (revealed)', ja: '全体の合計（公開）' },
  addCheck: { en: 'Plain sum for comparison', ja: '確認用の単純な合計' },
  addLocalSum: { en: 'Local sum', ja: '手元の合計' },
  addFrom: { en: 'from P{n}', ja: 'P{n}より' },

  // --- 乱数マスキングセクション ---
  maskHeading: { en: 'Random Masking', ja: '乱数マスキング' },
  maskIntro: {
    en: 'Another route to a private sum. Parties secretly agree on random masks that add up to zero. Each party publishes (value + mask). The masks cancel, so the published numbers add up to the true total — but each published number on its own is just noise.',
    ja: '秘密の合計へのもう1つの道。各パーティは合計するとゼロになる乱数マスクをこっそり共有します。各自は（値＋マスク）を公開します。マスクは打ち消し合うので、公開された数の合計は本当の合計になりますが、個々の公開値はただのノイズです。',
  },
  maskValueLabel: { en: "Party {n}'s value", ja: 'パーティ{n}の値' },
  maskMask: { en: 'secret mask', ja: '秘密のマスク' },
  maskPublished: { en: 'published (value + mask)', ja: '公開値（値＋マスク）' },
  maskMaskSum: { en: 'Sum of masks (always 0)', ja: 'マスクの合計（常に0）' },
  maskPublishedSum: { en: 'Sum of published values', ja: '公開値の合計' },
  maskTrueSum: { en: 'True sum', ja: '本当の合計' },
  maskReshuffle: { en: 'New random masks', ja: 'マスクを引き直す' },

  // --- 百万長者問題 ---
  mHeading: { en: "The Millionaires' Problem", ja: '百万長者問題' },
  mIntro: {
    en: 'Two millionaires want to know who is richer without revealing how much they have. Set each fortune below and run the protocol. The only thing revealed is the answer to “who is richer?” — never the amounts.',
    ja: '2人の百万長者が、自分の財産額を明かさずに「どちらがお金持ちか」だけを知りたい。下で各自の財産を設定し、プロトコルを実行してください。明かされるのは「どちらが上か」という答えだけで、金額そのものは決して出てきません。',
  },
  mAliceLabel: { en: "Alice's fortune", ja: 'アリスの財産' },
  mBobLabel: { en: "Bob's fortune", ja: 'ボブの財産' },
  mRun: { en: 'Find out who is richer', ja: 'どちらが上か判定' },
  mResultAlice: { en: 'Alice is richer (or equal).', ja: 'アリスの方が上（または同額）。' },
  mResultBob: { en: 'Bob is richer.', ja: 'ボブの方が上。' },
  mResultHidden: { en: 'Amounts stayed hidden the whole time.', ja: '金額は最後まで隠されたままでした。' },
  mGarbled: { en: 'What each party actually saw (garbled)', ja: '各パーティが実際に見たもの（ガーブル済み）' },

  // --- 詳細トグル ---
  showDetail: { en: 'Show the math', ja: '数式を見る' },
  hideDetail: { en: 'Hide the math', ja: '数式を隠す' },

  // --- フッター ---
  footerNote: {
    en: 'Educational demo. Real MPC uses larger fields, secure channels, and protections against malicious parties. All computation here runs locally in your browser.',
    ja: '教育目的のデモです。実運用のMPCはより大きな有限体、安全な通信路、不正なパーティへの対策を用います。本デモの計算はすべてブラウザ内（ローカル）で実行されます。',
  },
} satisfies Record<string, Entry>

export type Key = keyof typeof dict

// 文言取得。vars で {name} 形式のプレースホルダを置換する。
export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = dict[key][lang]
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

// コンポーネント側はこのフックで t() を得る。
export function useT() {
  const { lang, setLang } = useContext(LangContext)
  const t = (key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars)
  return { t, lang, setLang }
}
