import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { additiveShares, reconstruct, FIELD_P } from '../mpc'
import { makeRng } from '../mpc'
import { Chip, Detail, partyColor } from './shared'

// 秘密分散セクション：1つの秘密を N シェアに分割し、合計で復元できることを体験する。
export default function SecretSharing() {
  const { t } = useT()
  const [secret, setSecret] = useState(42)
  const [parties, setParties] = useState(3)
  const [seed, setSeed] = useState(7)

  // seed / secret / parties が変わるたびにシェアを決定的に再計算する。
  const shares = useMemo(() => {
    const rng = makeRng(seed * 100003 + secret * 31 + parties)
    return additiveShares(secret, parties, rng)
  }, [secret, parties, seed])

  const sum = reconstruct(shares)

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

        <div className="party-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
          {shares.map((sh, i) => (
            <div className="party" key={i}>
              <div className="party-head">
                <span className="party-dot" style={{ background: partyColor(i) }} />
                <span className="party-name">{t('sharesPartyN', { n: i + 1 })}</span>
              </div>
              <div className="chip-row">
                <span className="chip-label">{t('sharesShareLabel')}</span>
                <Chip>{sh}</Chip>
              </div>
            </div>
          ))}
        </div>

        <div className="result">
          <div className="small">{t('sharesSumLabel', { p: FIELD_P })}</div>
          <div className="big">{sum}</div>
          <div className="small">
            {t('sharesRecovered')}: <strong style={{ color: 'var(--accent-2)' }}>{sum}</strong>
            {sum === secret ? '  ✓' : ''}
          </div>
        </div>

        <p className="note">{t('sharesNote')}</p>

        <Detail>
          <p>
            Shares <code>s₁ … sₙ</code> are chosen so that{' '}
            <code>(s₁ + s₂ + … + sₙ) mod {FIELD_P} = secret</code>.
          </p>
          <p>
            The first <code>n−1</code> shares are uniform random in <code>Z_{FIELD_P}</code>; the last
            one is <code>secret − (s₁ + … + sₙ₋₁) mod {FIELD_P}</code>. Any subset smaller than{' '}
            <code>n</code> is statistically independent of the secret — it reveals nothing.
          </p>
          <p style={{ fontFamily: 'var(--mono)', color: 'var(--accent-2)' }}>
            {shares.join(' + ')} ≡ {secret} (mod {FIELD_P})
          </p>
        </Detail>
      </div>
    </section>
  )
}
