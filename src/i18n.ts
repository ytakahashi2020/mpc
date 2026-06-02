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
  navMod: { en: 'Clock math', ja: '時計の足し算' },
  navShares: { en: 'Secret Sharing', ja: '秘密分散' },
  navShamir: { en: 'Threshold (t-of-n)', ja: 'しきい値 (t-of-n)' },
  navAdd: { en: 'Additive MPC', ja: '加算的MPC' },
  navMask: { en: 'Random Masking', ja: '乱数マスキング' },
  navMillionaire: { en: "Millionaires' Problem", ja: '百万長者問題' },

  // --- 位置づけバッジ（部品 / MPC本体） ---
  badgeBuildingBlock: { en: '🧩 Building block — splitting, not computing yet', ja: '🧩 部品 — まだ「分ける」だけ（計算はしない）' },
  badgeMpc: { en: '⚙️ MPC itself — computing on data kept hidden', ja: '⚙️ MPC本体 — 隠したまま計算する' },
  badgeFoundation: { en: '🗺️ Foundation — the idea everything builds on', ja: '🗺️ 土台 — すべての出発点になる考え方' },

  // --- イントロ ---
  introHeading: { en: 'Compute together, reveal nothing', ja: 'いっしょに計算、でも中身は秘密' },
  introBody: {
    en: 'Several people each hold a private number. They want to learn one result — a sum, an average, a comparison — without ever showing their own number to anyone. MPC makes this possible. Work through the four interactive sections below.',
    ja: '複数の人がそれぞれ秘密の数字を持っています。誰一人として自分の数字を他人に見せることなく、合計・平均・比較といった「1つの答え」だけを知りたい。MPCはそれを可能にします。下の4つの体験セクションを順に進めてみましょう。',
  },
  introMap: {
    en: 'How to read this: the first sections are 🧩 building blocks (ways to split a secret) and 🗺️ foundations. The real MPC — ⚙️ computing on hidden data — starts at “Additive MPC”. Watch the badge under each heading.',
    ja: 'この順番の読み方：前半は🧩 部品（秘密を分ける方法）と🗺️ 土台です。本当のMPC＝⚙️ 隠したまま計算する話は「加算的MPC」から始まります。各見出しの下のバッジに注目してください。',
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
  sharesPlainSum: {
    en: 'Plain sum: {raw} → {raw} mod {p} = {m}',
    ja: '単純な合計：{raw} → {raw} mod {p} = {m}',
  },
  sharesRecovered: { en: 'Recovered secret', ja: '復元された秘密' },
  sharesNote: {
    en: 'Tip: hide any one share (👁 → 🙈) and the secret can no longer be rebuilt. This is additive sharing, where all n shares are required. Want “any 3 of 5”? That is the next section.',
    ja: 'ヒント：どれか1つでもシェアを隠す（👁 → 🙈）と、もう秘密は組み立て直せません。これは「n個全部が必要」な加算的秘密分散です。「5個のうち任意の3個」で復元したい場合は、次のセクションへ。',
  },
  sharesHideHint: { en: 'Tap a tile to hide / show its share', ja: 'タイルをタップしてシェアを隠す／表示' },
  sharesHidden: { en: 'hidden', ja: '非表示' },
  sharesCannotRecover: {
    en: 'Cannot recover — a share is hidden',
    ja: '復元できません — シェアが隠れています',
  },

  // --- 「素朴な分け方 vs 秘密分散」の比較 ---
  sharesWhyHeading: { en: 'Wait — isn’t splitting obvious?', ja: 'え、分けるだけって当たり前では？' },
  sharesWhyIntro: {
    en: 'Good instinct — but it depends how you split. Compare the same secret split two ways. Look at a single share in each row and ask: does it leak anything about the secret?',
    ja: 'いい勘です — でも「どう分けるか」で全然違います。同じ秘密を2通りに分けて並べてみましょう。各行の「1つのシェア」を見て、秘密のヒントが漏れているか考えてみてください。',
  },
  sharesNaiveLabel: { en: 'Naive split (digits / chunks)', ja: '素朴な分け方（桁・分割）' },
  sharesNaiveLeak: {
    en: 'Each piece narrows down the secret — you already know roughly how big it is. Not secure.',
    ja: '各欠片が秘密を絞り込んでしまう — もうだいたいの大きさが分かる。安全ではない。',
  },
  sharesRealLabel: { en: 'Secret sharing (mod {p})', ja: '秘密分散（mod {p}）' },
  sharesRealSafe: {
    en: 'Each share is a uniform random number in 0…{max}. Alone it is consistent with EVERY possible secret — it leaks nothing. This is what mod buys you.',
    ja: '各シェアは 0…{max} の一様な乱数。単体ではどの秘密とも矛盾せず、何も漏れない。これが mod の効果です。',
  },
  sharesGuessNaive: { en: 'From this one piece, the secret is around…', ja: 'この欠片だけから、秘密はだいたい…' },
  sharesGuessReal: { en: 'From this one share, the secret could be…', ja: 'このシェアだけから、秘密は…' },
  sharesGuessRealAns: { en: 'anything from 0 to {max} 🤷', ja: '0〜{max} の何でもあり得る 🤷' },

  // --- ディーラー（分けた人）に関する注記 ---
  sharesDealerHeading: { en: 'But doesn’t the person who splits it know?', ja: 'でも、分けた人は分かっちゃうのでは？' },
  sharesDealer: {
    en: 'Exactly right. The dealer who creates the shares does know the secret — secret sharing only protects it from the holders afterwards. If nobody is allowed to know the original, you avoid a dealer entirely: each party shares only its OWN value and they compute together. That is exactly what the next section, Additive MPC, does.',
    ja: 'まさにその通り。シェアを作る「ディーラー（配る人）」は秘密を知っています。秘密分散が守るのは「配られた後の各保管者から」だけです。もし元の秘密を誰にも知られたくないなら、ディーラーを使わず、各自が「自分の値だけ」を分けて配り、みんなで計算します。それがまさに次の「加算的MPC」の章です。',
  },

  // --- mod の導入（時計のたとえ） ---
  modHeading: { en: 'First, a quick idea: clock arithmetic', ja: 'はじめに：時計の足し算' },
  modIntro: {
    en: 'MPC adds numbers on a clock that wraps around at {p}. Go past {p} and you loop back to 0 — just like 13:00 on a 12-hour clock is 1:00. This “wrap-around” (called mod {p}) is what lets each share look like pure random noise. Drag below to feel it.',
    ja: 'MPCの足し算は、{p}でひとまわりする時計の上で行います。{p}を超えると0に戻ります — 12時間時計で13時が1時になるのと同じです。この「ひとまわり」（mod {p} と呼びます）のおかげで、各シェアはただの乱数のように見えます。下を動かして体感してみましょう。',
  },
  modValue: { en: 'Value', ja: '値' },
  modResult: { en: '{a} mod {p} =', ja: '{a} mod {p} =' },
  modWrapNote: {
    en: '{a} wraps around {w} time(s) past {p}, landing on {r}.',
    ja: '{a} は {p} を {w} 周して、{r} に着きます。',
  },
  modNoWrap: { en: '{a} is below {p}, so it stays {a}.', ja: '{a} は {p} 未満なので、そのまま {a} です。' },

  // --- Shamir しきい値秘密分散セクション ---
  shamirHeading: { en: 'Shamir Secret Sharing (SSS): any t of n', ja: 'Shamir秘密分散（SSS）：n個のうち任意のt個' },
  shamirIntro: {
    en: 'The previous section needed every share. But often you want “any 3 of 5 can recover” — survive lost shares, yet stay safe if a few leak. Shamir’s scheme does this with a curve: hide the secret as the height of a polynomial at x = 0, and hand each party one point on the curve. Any t points pin down a degree-(t−1) curve exactly, so they recover the secret. With fewer than t points, infinitely many curves fit — the secret stays hidden.',
    ja: '前のセクションは全シェアが必要でした。でも実際には「5個のうち任意の3個で復元」したいことが多い — シェアを失っても耐え、少し漏れても安全、というように。Shamir の方式はこれを「曲線」で実現します。秘密を多項式の x=0 での高さに隠し、各パーティに曲線上の点を1つ渡します。t 個の点があれば (t−1) 次の曲線がぴったり1本に決まり、秘密が復元できます。t 個未満だと無数の曲線が当てはまり、秘密は隠れたままです。',
  },
  shamirSecretLabel: { en: 'Secret (height at x = 0)', ja: '秘密（x=0 での高さ）' },
  shamirThresholdLabel: { en: 'Threshold t (points needed)', ja: 'しきい値 t（必要な点の数）' },
  shamirPartiesLabel: { en: 'Parties n (points handed out)', ja: 'パーティ数 n（配る点の数）' },
  shamirReshuffle: { en: 'New random curve', ja: '曲線を引き直す' },
  shamirHint: { en: 'Tap points to use 🟢 or ignore ⚪ them in the recovery', ja: '点をタップして、復元に使う🟢／使わない⚪ を切り替え' },
  shamirAxisX: { en: 'party #', ja: 'パーティ番号' },
  shamirAxisY: { en: 'share value', ja: 'シェアの値' },
  shamirHere: { en: 'secret = {s}', ja: '秘密 = {s}' },
  shamirGraphCaption: {
    en: 'Each colored dot is one party’s share — a point on a hidden curve. The curve’s height at the far left (party 0, the dashed line) is the secret. Select enough points and the curve is pinned down, so its left edge reveals the secret.',
    ja: '色のついた点は各パーティのシェア＝隠れた曲線の上の1点です。その曲線の「いちばん左（パーティ0、点線の位置）での高さ」が秘密です。点を十分に選ぶと曲線が1本に確定し、左端の高さ＝秘密が現れます。',
  },
  shamirSelected: { en: '{k} of {t} points selected', ja: '{t} 個中 {k} 個を選択中' },
  shamirRecovered: { en: 'Recovered secret', ja: '復元された秘密' },
  shamirEnough: {
    en: 'Enough points (≥ t): the curve is pinned down, secret = {s}.',
    ja: '点が十分（t 個以上）：曲線が1本に確定し、秘密 = {s}。',
  },
  shamirNotEnough: {
    en: 'Too few points (< t): many curves fit, so the secret cannot be found.',
    ja: '点が足りません（t 個未満）：当てはまる曲線が無数にあり、秘密は求まりません。',
  },
  shamirTooMany: {
    en: 'Tip: t must not exceed n. Lower t or raise n.',
    ja: 'ヒント：t は n 以下にしてください。t を下げるか n を上げて。',
  },
  shamirPartyPoint: { en: 'P{n}: ({x}, {y})', ja: 'P{n}：({x}, {y})' },
  shamirVsAdditive: {
    en: 'Additive sharing (the previous section) is the special case t = n — you need everyone. Shamir generalizes it: pick any t ≤ n. That is why real systems quote things like “3-of-5”.',
    ja: '前のセクションの加算的秘密分散は、実は t = n の特別な場合（全員必要）です。Shamir はそれを一般化し、t ≤ n を自由に選べます。実システムで「3-of-5」などと言うのはこのためです。',
  },
  shamirMath1: {
    en: 'Make a polynomial f(x) = s + a₁x + … + a_{d}x^{d} of degree d = t−1, with the secret s as the constant term. Party i gets the point (i, f(i)).',
    ja: '次数 d = t−1 の多項式 f(x) = s + a₁x + … + a_d x^d を作り、定数項に秘密 s を置きます。パーティ i には点 (i, f(i)) を渡します。',
  },
  shamirMath2: {
    en: 'A degree-d curve is fixed by exactly d+1 = t points (two points fix a line, three fix a parabola, …). Given t points, Lagrange interpolation rebuilds f and reads off the secret f(0) = s.',
    ja: '次数 d の曲線は、ちょうど d+1 = t 個の点で決まります（2点で直線、3点で放物線…）。t 個の点があれば、ラグランジュ補間で f を組み立て直し、秘密 f(0) = s を読み取れます。',
  },
  shamirMath3: {
    en: 'With fewer than t points, every secret value is equally consistent with some valid curve — so the scheme leaks nothing. Real Shamir does all this over a finite field; here we use real numbers so the curve is easy to see.',
    ja: 't 個未満の点では、どんな秘密の値も「ある正しい曲線」と矛盾しません。だから何も漏れません。本物の Shamir はこれを有限体の上で行います。本デモは曲線が見やすいよう実数で扱っています。',
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
  addNext: { en: 'Next step →', ja: '次のステップ →' },
  addReset: { en: 'Start over', ja: '最初から' },
  addStep1Body: {
    en: 'Just like section 1 — but now every party does it at once. Each party’s row splits its value into shares that sum back to that value.',
    ja: 'セクション1と同じことを、今度は全員が同時に行います。各パーティの行は、自分の値を「足すと元に戻るシェア」へ分割したものです。',
  },
  addRowSplits: { en: 'P{n} splits {v} →', ja: 'P{n} は {v} を分割 →' },
  addStepCounter: { en: 'Step {c} of 4', ja: 'ステップ {c} / 4' },
  addColReceiver: { en: 'column = who receives the share', ja: '列＝そのシェアを受け取る人' },
  addRowGiver: { en: 'row = who sends the share', ja: '行＝そのシェアを渡す人' },
  addInputTotal: { en: 'Total to compute', ja: '求めたい合計' },
  addRawSum: { en: 'plain sum', ja: '単純な合計' },
  addModSum: { en: 'mod {p}', ja: 'mod {p}' },
  addSplitCheck: {
    en: 'shares add to {raw}, and {raw} mod {p} = {m} (back to the value)',
    ja: 'シェアの合計は {raw}、{raw} mod {p} = {m}（元の値に戻る）',
  },
  addLocalRaw: { en: 'received add to {raw}', ja: '受け取り分の単純な合計 {raw}' },
  addLocalMod: { en: '{raw} mod {p} = {m}', ja: '{raw} mod {p} = {m}' },
  addGrandRaw: { en: 'Plain sum of local sums', ja: '手元の合計の単純な総和' },

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
  maskTrueSum: { en: 'True sum (for comparison)', ja: '本当の合計（確認用）' },
  maskReshuffle: { en: 'New random masks', ja: 'マスクを引き直す' },
  maskVsAdditive: {
    en: 'Why this matters: additive MPC (section 2) needed every pair of parties to exchange shares — n×n messages. Masking is lighter: each party publishes just one number, so it scales far better when many parties only need a sum (e.g. private voting, telemetry, or federated learning). The catch is the masks: parties must agree beforehand on noise that cancels to zero.',
    ja: 'これにどんな意味があるか：加算的MPC（セクション2）は全パーティどうしがシェアを交換する必要があり、通信は n×n 回でした。マスキングはもっと軽く、各自は1つの数を公開するだけ。多人数で「合計だけ」が欲しい場面（秘密投票、端末からの統計収集、連合学習など）でずっとよくスケールします。代わりの手間は「合計が0になるマスクを事前に取り決める」こと。',
  },

  // --- 百万長者問題 ---
  mHeading: { en: "The Millionaires' Problem", ja: '百万長者問題' },
  mIntro: {
    en: 'Two millionaires want to know who is richer — without telling each other how much they have. The trick: instead of comparing the amounts, they jointly compute the difference d = Alice − Bob using the shares you just learned, and reveal only its sign. A positive sign means Alice is richer; the actual numbers never appear.',
    ja: '2人の百万長者が、互いに金額を教えずに「どちらがお金持ちか」だけを知りたい。コツは、金額を比べる代わりに、さっき学んだシェアの仕組みで「差 d ＝ アリス − ボブ」をいっしょに計算し、その符号（プラスかマイナスか）だけを公開すること。プラスならアリスが上。実際の金額は一度も現れません。',
  },
  mAliceLabel: { en: "Alice's fortune", ja: 'アリスの財産' },
  mBobLabel: { en: "Bob's fortune", ja: 'ボブの財産' },
  mGuessPrompt: {
    en: 'Before running: who do you think is richer?',
    ja: '実行する前に予想：どちらが上だと思う？',
  },
  mGuessAlice: { en: 'Alice', ja: 'アリス' },
  mGuessBob: { en: 'Bob', ja: 'ボブ' },
  mGuessEqual: { en: 'Tie', ja: '同じ' },
  mGuessRight: { en: '✓ Your guess was right!', ja: '✓ 予想は当たり！' },
  mGuessWrong: { en: 'Your guess was different — see why below.', ja: '予想とは違いました。理由を下で確認。' },
  mRun: { en: 'Run the protocol', ja: 'プロトコルを実行' },
  mNext: { en: 'Next step →', ja: '次のステップ →' },
  mReset: { en: 'Start over', ja: '最初から' },
  mStepCounter: { en: 'Step {c} of 3', ja: 'ステップ {c} / 3' },

  // Step 1: それぞれが自分の値をシェアに分割
  mStep1: { en: '1. Each splits their fortune into two shares', ja: '1. 各自が財産を2つのシェアに分割' },
  mStep1Body: {
    en: 'Just like before. Alice keeps one share and gives one to Bob; Bob does the same. Neither share alone tells you anything.',
    ja: '前と同じです。アリスはシェアを1つ自分で持ち、1つをボブに渡します。ボブも同様。どちらのシェア単体からも何も分かりません。',
  },
  mShareKeeps: { en: 'P{n} keeps', ja: 'P{n}が保持' },
  mShareGives: { en: 'gives away', ja: '相手に渡す' },

  // Step 2: 差 d = Alice − Bob のシェアを各自が手元で作る
  mStep2: { en: '2. Each computes a share of the difference d = Alice − Bob', ja: '2. 各自が差 d = アリス − ボブ のシェアを手元で計算' },
  mStep2Body: {
    en: 'Each party subtracts locally on the shares it holds. Because subtraction works share-by-share, the two results are shares of d — the difference — even though nobody knows d yet.',
    ja: '各自が手元のシェアどうしで引き算します。引き算はシェアごとに成り立つので、2つの結果は「差 d のシェア」になります。まだ誰も d の値は知りません。',
  },
  mDiffShare: { en: "share of d held by P{n}", ja: 'P{n}が持つ d のシェア' },

  // Step 3: 差のシェアを合わせ、符号だけ公開
  mStep3: { en: '3. Combine the shares → reveal only the sign of d', ja: '3. シェアを合わせる → d の符号だけ公開' },
  mStep3Body: {
    en: 'The two shares are combined to recover d. But d on its own does not reveal either fortune — only whether it is positive, negative, or zero. That single bit answers “who is richer?”',
    ja: '2つのシェアを合わせて d を復元します。でも d だけでは、どちらの財産も分かりません。分かるのは「プラス・マイナス・ゼロ」だけ。この1ビットが「どちらが上か」の答えです。',
  },
  mSignLabel: { en: 'Sign of d (the only thing revealed)', ja: 'd の符号（公開されるのはこれだけ）' },
  mSignPos: { en: 'd > 0', ja: 'd > 0' },
  mSignNeg: { en: 'd < 0', ja: 'd < 0' },
  mSignZero: { en: 'd = 0', ja: 'd = 0' },

  mResultAlice: { en: 'Alice is richer.', ja: 'アリスの方が上。' },
  mResultBob: { en: 'Bob is richer.', ja: 'ボブの方が上。' },
  mResultEqual: { en: 'They are equally rich.', ja: '2人は同額でした。' },
  mResultHidden: {
    en: 'The amounts were never combined or shown — only the sign of their difference.',
    ja: '金額は合算も表示もされませんでした。出たのは差の符号だけです。',
  },

  // --- 詳細トグル ---
  showDetail: { en: 'Show the math', ja: '数式を見る' },
  hideDetail: { en: 'Hide the math', ja: '数式を隠す' },

  // --- 数式パネル（秘密分散） ---
  sharesMath1: {
    en: 'Shares s₁ … sₙ are chosen so that (s₁ + s₂ + … + sₙ) mod {p} = secret.',
    ja: 'シェア s₁ … sₙ は、(s₁ + s₂ + … + sₙ) mod {p} = 秘密 となるように選びます。',
  },
  sharesMath2: {
    en: 'The first n−1 shares are drawn uniformly at random from Z_{p} (this demo uses your browser’s cryptographic RNG); the last one is secret − (s₁ + … + sₙ₋₁) mod {p}. Any subset smaller than n is statistically independent of the secret — it reveals nothing.',
    ja: '最初の n−1 個のシェアは Z_{p} から一様ランダムに選びます（本デモはブラウザの暗号学的乱数を使用）。最後の1個は 秘密 − (s₁ + … + sₙ₋₁) mod {p} です。n 個に満たないどの部分集合も秘密と統計的に独立で、何も明かしません。',
  },
  sharesMath3: {
    en: 'This is additive (n-of-n) sharing: you need every share. Threshold schemes like Shamir Secret Sharing (SSS) are more general — any t of n shares can reconstruct, so losing some is survivable.',
    ja: 'これは加算的（n-of-n）秘密分散で、すべてのシェアが必要です。Shamir秘密分散（SSS）のような閾値方式はより一般的で、n 個のうち任意の t 個で復元できるため、いくつか失っても耐えられます。',
  },

  // --- 数式パネル（加算的MPC） ---
  addMath1: {
    en: 'Each party i splits its value vᵢ into n shares whose sum is vᵢ, and sends share j to party j.',
    ja: '各パーティ i は自分の値 vᵢ を、合計が vᵢ になる n 個のシェアに分割し、シェア j をパーティ j に送ります。',
  },
  addMath2: {
    en: 'Party j adds all shares it received: tⱼ = Σᵢ matrix[i][j]. Then Σⱼ tⱼ = Σᵢ Σⱼ matrix[i][j] = Σᵢ vᵢ — the true total, all in Z_{p}.',
    ja: 'パーティ j は受け取った全シェアを足します： tⱼ = Σᵢ matrix[i][j]。すると Σⱼ tⱼ = Σᵢ Σⱼ matrix[i][j] = Σᵢ vᵢ となり、これが本当の合計です（すべて Z_{p} 上）。',
  },
  addMath3: {
    en: 'No party ever sees more than one random-looking share of anyone else’s value, so no individual vᵢ leaks.',
    ja: '各パーティは、他人の値については乱数に見えるシェアを1つしか見ないため、個々の vᵢ は漏れません。',
  },

  // --- 数式パネル（乱数マスキング） ---
  maskMath1: {
    en: 'Parties agree on masks m₁ … mₙ with Σ mᵢ ≡ 0 (mod {p}). Each publishes pᵢ = (vᵢ + mᵢ) mod {p}.',
    ja: '各パーティは Σ mᵢ ≡ 0 (mod {p}) となるマスク m₁ … mₙ を取り決めます。各自は pᵢ = (vᵢ + mᵢ) mod {p} を公開します。',
  },
  maskMath2: {
    en: 'Then Σ pᵢ = Σ vᵢ + Σ mᵢ = Σ vᵢ. Each pᵢ alone is uniformly random (because mᵢ is), so it hides vᵢ perfectly.',
    ja: 'すると Σ pᵢ = Σ vᵢ + Σ mᵢ = Σ vᵢ。各 pᵢ 単体は（mᵢ がランダムなので）一様ランダムになり、vᵢ を完全に隠します。',
  },
  maskMath3: {
    en: 'In practice the zero-sum masks come from pairwise shared randomness: mᵢ = Σⱼ (rᵢⱼ − rⱼᵢ), which sums to zero by construction.',
    ja: '実際には、合計0のマスクはペアで共有した乱数から作ります： mᵢ = Σⱼ (rᵢⱼ − rⱼᵢ)。構成上、合計は必ず0になります。',
  },

  // --- 数式パネル（百万長者問題） ---
  mMath1: {
    en: 'This demo reuses additive sharing, but with plain integers (shares may be negative) instead of mod-p, so the sign reads off directly. Subtraction is linear, so a share of d = a − b is just (share of a) − (share of b), computed locally. Adding the two shares gives d; its sign answers a ≥ b without exposing a or b.',
    ja: 'このデモは加算的秘密分散を再利用しますが、mod ではなく「負も許す普通の整数」でシェアを作るので、符号がそのまま読めます。引き算は線形なので、差 d = a − b のシェアは「a のシェア − b のシェア」を手元で計算するだけ。2つのシェアを足すと d が出て、その符号が a ≥ b の答えになります。a や b は出てきません。',
  },
  mMath2: {
    en: 'Yao’s original 1982 formulation uses a garbled circuit instead: one party encrypts a comparison circuit so each wire carries a random-looking label, and the other evaluates it via oblivious transfer, learning only the output bit. Same goal, different machinery.',
    ja: 'Yao の 1982 年の元の定式化では、代わりにガーブル回路を使います。一方が比較回路を暗号化して各ワイヤを乱数に見えるラベルにし、もう一方が紛失通信（OT）で評価して出力ビットだけを知ります。目的は同じで、仕組みが違います。',
  },
  mMath3: {
    en: 'Honesty note: revealing the exact value of d leaks a little more than the bare “who is richer” bit (e.g. the gap size). Production protocols compare without revealing d itself, and over a finite field comparison is genuinely tricky (a wrapped value like p−1 means −1). We use plain signed integers here so the sign is obvious.',
    ja: '正直な注記：d の正確な値を見せると、「どちらが上か」の1ビットより少しだけ多く（差の大きさなど）漏れます。実運用では d 自体を見せずに比較します。また有限体の上では比較は本当に厄介で（一周した値 p−1 は −1 を意味する）、本デモはそこを避けて符号が一目で分かる普通の整数を使っています。',
  },

  // --- 実世界での使い分け（ブロックチェーン鍵） ---
  navReal: { en: 'In the real world', ja: '実世界では' },
  realHeading: { en: 'Where is this actually used? Blockchain keys', ja: '実際どこで使われる？ ブロックチェーンの鍵' },
  realIntro: {
    en: 'A common question: for a blockchain private key, is it Shamir secret sharing or additive MPC? Both — but for different jobs.',
    ja: 'よくある疑問：ブロックチェーンの秘密鍵には、Shamir秘密分散が使われるの？ それとも加算的MPC？ 答えは「両方。ただし目的が違う」です。',
  },
  realCard1Title: { en: '🗄️ Storing / recovering a key', ja: '🗄️ 鍵の保管・復旧' },
  realCard1Body: {
    en: 'Shamir Secret Sharing (SSS) — e.g. SLIP-0039 “Shamir Backup” in hardware wallets. Split a key into shares (say 2-of-3); the key is reconstructed when you need to use it. Simple and robust, but at signing time the full key briefly exists in one place.',
    ja: 'Shamir秘密分散（SSS）— 例：ハードウェアウォレットの SLIP-0039「Shamir Backup」。鍵を複数シェアに分割し（例 2-of-3）、使うときに鍵を再構成します。単純で頑丈ですが、署名の瞬間は完全な鍵が一瞬1か所に揃います。',
  },
  realCard2Title: { en: '🔏 Signing without rebuilding the key', ja: '🔏 鍵を組み立てずに署名' },
  realCard2Body: {
    en: 'Threshold signatures (TSS), built on MPC — the additive-sharing and masking ideas from this demo. Parties jointly produce one signature while the full key never exists anywhere. Used by custody/wallet platforms (Fireblocks, Coinbase, ZenGo, …).',
    ja: 'しきい値署名（TSS）— このデモの加算的シェアやマスキングの考え方を土台にしたMPC。完全な鍵をどこにも作らないまま、複数当事者で1つの署名を生成します。カストディ／ウォレット基盤（Fireblocks、Coinbase、ZenGo など）で利用。',
  },
  realVerdict: {
    en: 'So: project by project — yes. But the 2020s trend in institutional custody and modern wallets leans toward MPC signatures (TSS), while Shamir (SSS) stays popular for personal backup. (On-chain multisig like Gnosis Safe is a third, separate approach: enforced by the contract, not by cryptographically splitting one key.)',
    ja: 'つまり「プロジェクトによってそれぞれ」は YES。ただし2020年代の機関カストディや最新ウォレットは MPC署名（TSS）へ寄る流れで、Shamir（SSS）は「個人のバックアップ」用途で根強く残っています。（Gnosis Safe のようなオンチェーンのマルチシグは第3の別物で、1つの鍵を暗号的に分割するのではなく、コントラクト側で「n人中m人の署名が必要」を強制します。）',
  },

  // --- セクション間ナビ ---
  nextSection: { en: 'Next: {name} →', ja: '次へ：{name} →' },

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
