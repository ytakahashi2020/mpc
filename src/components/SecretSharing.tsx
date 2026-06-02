import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { additiveShares, reconstruct, FIELD_P } from '../mpc'
import { makeRng } from '../mpc'
import { Chip, Detail, partyColor } from './shared'
import { SectionNav } from './SectionNav'

// 秘密分散セクション：1つの秘密を N シェアに分割し、合計で復元できることを体験する。
export default function SecretSharing() {
  const { t } = useT()
  const [secret, setSecret] = useState(42)
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

  const toggleHide = (i: number) =>
    setHidden((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <section id="shares">
      <span className="section-tag">01 · {t('navShares')}</span>
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
            max={200}
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
              <div className="small">
                {t('sharesRecovered')}: <strong style={{ color: 'var(--accent-2)' }}>{sum}</strong>
                {sum === secret ? '  ✓' : ''}
              </div>
            </>
          )}
        </div>

        <p className="note">{t('sharesNote')}</p>

        <Detail>
          <p>
            Shares <code>s₁ … sₙ</code> are chosen so that{' '}
            <code>(s₁ + s₂ + … + sₙ) mod {FIELD_P} = secret</code>.
          </p>
          <p>
            The first <code>n−1</code> shares are drawn uniformly at random from{' '}
            <code>Z_{FIELD_P}</code> (this demo uses your browser’s cryptographic RNG); the last one is{' '}
            <code>secret − (s₁ + … + sₙ₋₁) mod {FIELD_P}</code>. Any subset smaller than <code>n</code>{' '}
            is statistically independent of the secret — it reveals nothing.
          </p>
          <p>
            This is <strong>additive (n-of-n)</strong> sharing: you need <em>every</em> share. Threshold
            schemes like <strong>Shamir’s</strong> are more general — any <code>t</code> of <code>n</code>{' '}
            shares can reconstruct, so losing some is survivable.
          </p>
          <p style={{ fontFamily: 'var(--mono)', color: 'var(--accent-2)' }}>
            {shares.join(' + ')} ≡ {secret} (mod {FIELD_P})
          </p>
        </Detail>
      </div>
      <SectionNav id="shares" />
    </section>
  )
}
