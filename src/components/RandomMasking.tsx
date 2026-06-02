import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { zeroSumMasks, mod, makeRng, FIELD_P } from '../mpc'
import { Chip, Detail, partyColor } from './shared'
import { SectionNav } from './SectionNav'

// 乱数マスキングセクション：合計0のマスクを各値に足して公開し、合計だけ復元する。
export default function RandomMasking() {
  const { t } = useT()
  const [values, setValues] = useState([9, 4, 15, 7])
  const [seed, setSeed] = useState(11)

  const n = values.length

  const masks = useMemo(() => {
    const rng = makeRng()
    return zeroSumMasks(n, rng)
  }, [values, seed, n])

  const published = values.map((v, i) => mod(v + masks[i]))
  const maskSum = mod(masks.reduce((a, b) => a + b, 0))
  const publishedSum = mod(published.reduce((a, b) => a + b, 0))
  const trueSum = mod(values.reduce((a, b) => a + b, 0))

  const setVal = (i: number, v: number) => setValues((arr) => arr.map((x, j) => (j === i ? v : x)))

  return (
    <section id="mask">
      <span className="section-tag">03 · {t('navMask')}</span>
      <h2>{t('maskHeading')}</h2>
      <p className="lead">{t('maskIntro')}</p>

      <div className="card">
        <div className="btn-row">
          <button className="btn" onClick={() => setSeed((s) => s + 1)}>
            🎲 {t('maskReshuffle')}
          </button>
        </div>

        <div className="party-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
          {values.map((v, i) => (
            <div className="party" key={i}>
              <div className="party-head">
                <span className="party-dot" style={{ background: partyColor(i) }} />
                <span className="party-name">P{i + 1}</span>
              </div>
              <div className="control" style={{ margin: '6px 0' }}>
                <label>{t('maskValueLabel', { n: i + 1 })}</label>
                <input
                  type="number"
                  value={v}
                  min={0}
                  max={20}
                  onChange={(e) => setVal(i, mod(Number(e.target.value)))}
                />
              </div>
              <div className="chip-row" style={{ marginTop: 6 }}>
                <Chip>
                  <span className="chip-label">{t('maskMask')}</span>
                  {masks[i]}
                </Chip>
              </div>
              <div className="chip-row" style={{ marginTop: 6 }}>
                <Chip flash>
                  <span className="chip-label">{t('maskPublished')}</span>
                  {published[i]}
                </Chip>
              </div>
            </div>
          ))}
        </div>

        <div className="result">
          <div className="small">
            {t('maskMaskSum')}: <strong>{maskSum}</strong>
          </div>
          <div className="big">{published.join(' + ')} = {publishedSum}</div>
          <div className="small">
            {t('maskPublishedSum')}: <strong style={{ color: 'var(--accent-2)' }}>{publishedSum}</strong>
            {' · '}
            {t('maskTrueSum')}: {trueSum} {publishedSum === trueSum ? '✓' : ''}
          </div>
        </div>

        <Detail>
          <p>{t('maskMath1', { p: FIELD_P })}</p>
          <p>{t('maskMath2')}</p>
          <p>{t('maskMath3')}</p>
        </Detail>
      </div>
      <SectionNav id="mask" />
    </section>
  )
}
