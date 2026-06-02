import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { additiveShares, reconstruct, FIELD_P } from '../mpc'
import { makeRng } from '../mpc'
import { Badge, Chip, Detail, partyColor } from './shared'
import { SectionNav } from './SectionNav'

// 秘密分散セクション：1つの秘密を N シェアに分割し、合計で復元できることを体験する。
export default function SecretSharing() {
  const { t } = useT()
  const [secret, setSecret] = useState(13)
  const [parties, setParties] = useState(3)
  const [seed, setSeed] = useState(7)
  // 各シェアを「隠す」状態。タイルをタップして単体では何も分からないことを体験させる。
  const [hidden, setHidden] = useState<Set<number>>(new Set())

  // secret / parties / seed が変わるたびにシェアを引き直す。
  // 乱数は暗号学的乱数を使い、秘密には依存しない（seed は再計算トリガのみ）。
  const shares = useMemo(() => {
    const rng = makeRng()
    return additiveShares(secret, parties, rng)
  }, [secret, parties, seed])

  const anyHidden = [...hidden].some((i) => i < parties)
  // 全シェアが見えているときだけ復元できる（加算的 n-of-n の本質）。
  const sum = reconstruct(shares)
  // mod する前の素朴な合計。mod 後（= 秘密）と並べて見せる。
  const rawSum = shares.reduce((a, b) => a + b, 0)

  // 比較用：「素朴な分け方」= ほぼ均等に3分割（各欠片が秘密の大きさを漏らす）。
  const naiveShares = useMemo(() => {
    const base = Math.floor(secret / 3)
    return [base, base, secret - 2 * base]
  }, [secret])

  const toggleHide = (i: number) =>
    setHidden((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <section id="shares">
      <span className="section-tag">01 · {t('navShares')}</span>
      <Badge kind="block" />
      <h2>{t('sharesHeading')}</h2>
      <p className="lead">{t('sharesIntro')}</p>

      <div className="card">
        <div className="control">
          <label>
            {t('sharesSecretLabel')}: <span className="val">{secret}</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={secret}
            onChange={(e) => setSecret(Number(e.target.value))}
          />
        </div>

        <div className="control">
          <label>
            {t('sharesPartiesLabel')}: <span className="val">{parties}</span>
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={parties}
            onChange={(e) => setParties(Number(e.target.value))}
          />
        </div>

        <div className="btn-row">
          <button className="btn" onClick={() => setSeed((s) => s + 1)}>
            🎲 {t('sharesReshuffle')}
          </button>
        </div>

        <p className="hint-line">👆 {t('sharesHideHint')}</p>
        <div className="party-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
          {shares.map((sh, i) => {
            const isHidden = hidden.has(i)
            return (
              <button
                type="button"
                className={`party party-toggle${isHidden ? ' is-hidden' : ''}`}
                key={i}
                onClick={() => toggleHide(i)}
                aria-pressed={isHidden}
              >
                <div className="party-head">
                  <span className="party-dot" style={{ background: partyColor(i) }} />
                  <span className="party-name">{t('sharesPartyN', { n: i + 1 })}</span>
                  <span className="party-eye">{isHidden ? '🙈' : '👁'}</span>
                </div>
                <div className="chip-row">
                  <span className="chip-label">{t('sharesShareLabel')}</span>
                  <Chip>{isHidden ? '•••' : sh}</Chip>
                </div>
              </button>
            )
          })}
        </div>

        <div className={`result${anyHidden ? ' result-locked' : ''}`}>
          {anyHidden ? (
            <>
              <div className="small">{t('sharesSumLabel', { p: FIELD_P })}</div>
              <div className="big">🔒 ?</div>
              <div className="small">{t('sharesCannotRecover')}</div>
            </>
          ) : (
            <>
              <div className="small">{t('sharesSumLabel', { p: FIELD_P })}</div>
              <div className="big">{sum}</div>
              <div className="sub-line">
                {t('sharesPlainSum', { raw: rawSum, p: FIELD_P, m: sum })}
              </div>
              <div className="small">
                {t('sharesRecovered')}: <strong style={{ color: 'var(--accent-2)' }}>{sum}</strong>
                {sum === secret ? '  ✓' : ''}
              </div>
            </>
          )}
        </div>

        <p className="note">{t('sharesNote')}</p>
      </div>

      {/* なぜ「当たり前」ではないのか：素朴な分け方との比較 */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 6px' }}>{t('sharesWhyHeading')}</h3>
        <p className="lead" style={{ marginBottom: 16 }}>{t('sharesWhyIntro')}</p>

        {/* 素朴な分け方 */}
        <div className="compare-row compare-bad">
          <div className="compare-label">❌ {t('sharesNaiveLabel')}</div>
          <div className="chip-row">
            {naiveShares.map((s, i) => (
              <Chip key={i}>{s}</Chip>
            ))}
          </div>
          <div className="sub-line">
            {t('sharesGuessNaive')} <strong>{Math.floor(secret / 3) * 3}〜{secret}</strong>
          </div>
          <div className="compare-verdict bad">{t('sharesNaiveLeak')}</div>
        </div>

        {/* 秘密分散 */}
        <div className="compare-row compare-good">
          <div className="compare-label">⭕ {t('sharesRealLabel', { p: FIELD_P })}</div>
          <div className="chip-row">
            {shares.map((s, i) => (
              <Chip key={i}>{s}</Chip>
            ))}
          </div>
          <div className="sub-line">
            {t('sharesGuessReal')} <strong>{t('sharesGuessRealAns', { max: FIELD_P - 1 })}</strong>
          </div>
          <div className="compare-verdict good">{t('sharesRealSafe', { p: FIELD_P, max: FIELD_P - 1 })}</div>
        </div>
      </div>

      {/* 分けた人（ディーラー）は知っている、という注記 */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 6px' }}>{t('sharesDealerHeading')}</h3>
        <p className="lead" style={{ margin: 0 }}>{t('sharesDealer')}</p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <Detail>
          <p>{t('sharesMath1', { p: FIELD_P })}</p>
          <p>{t('sharesMath2', { p: FIELD_P })}</p>
          <p>{t('sharesMath3')}</p>
          <p style={{ fontFamily: 'var(--mono)', color: 'var(--accent-2)' }}>
            {shares.join(' + ')} ≡ {secret} (mod {FIELD_P})
          </p>
        </Detail>
      </div>
      <SectionNav id="shares" />
    </section>
  )
}
