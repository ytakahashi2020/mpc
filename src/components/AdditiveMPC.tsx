import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { shareMatrix, localSums, reconstruct, makeRng, mod, FIELD_P } from '../mpc'
import { Chip, Detail, partyColor } from './shared'

// 加算的MPCセクション：3者がシェアを交換して合計だけを得るプロトコルを段階的に見せる。
export default function AdditiveMPC() {
  const { t } = useT()
  const [values, setValues] = useState([50, 30, 70])
  const [seed, setSeed] = useState(3)
  const [ran, setRan] = useState(false)

  const n = values.length

  // giver→receiver のシェア行列。実行のたびに暗号学的乱数で引き直す（値には依存しない）。
  const matrix = useMemo(() => {
    const rng = makeRng()
    return shareMatrix(values, rng)
  }, [values, seed])

  const sums = useMemo(() => localSums(matrix), [matrix])
  const grand = reconstruct(sums)
  const plain = mod(values.reduce((a, b) => a + b, 0))

  const setVal = (i: number, v: number) => {
    setValues((arr) => arr.map((x, j) => (j === i ? v : x)))
  }

  return (
    <section id="add">
      <span className="section-tag">02 · {t('navAdd')}</span>
      <h2>{t('addHeading')}</h2>
      <p className="lead">{t('addIntro')}</p>

      <div className="card">
        <div className="party-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
          {values.map((v, i) => (
            <div className="control" key={i}>
              <label style={{ color: partyColor(i) }}>{t('addInputLabel', { n: i + 1 })}</label>
              <input
                type="number"
                value={v}
                min={0}
                max={500}
                onChange={(e) => setVal(i, mod(Number(e.target.value)))}
              />
            </div>
          ))}
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={() => {
              setSeed((s) => s + 1)
              setRan(true)
            }}
          >
            ▶ {t('addReveal')}
          </button>
        </div>

        {ran && (
          <div className="steps pop">
            {/* Step 2: 交換行列 */}
            <div>
              <div className="step-label">{t('addStep2')}</div>
              <table className="matrix">
                <thead>
                  <tr>
                    <th></th>
                    {values.map((_, r) => (
                      <th key={r} style={{ color: partyColor(r) }}>
                        → P{r + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, giver) => (
                    <tr key={giver}>
                      <th style={{ color: partyColor(giver) }}>P{giver + 1}</th>
                      {row.map((cell, receiver) => (
                        <td key={receiver} className={giver === receiver ? 'diag' : ''}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th>{t('addLocalSum')}</th>
                    {sums.map((s, i) => (
                      <td key={i} className="rowsum">
                        {s}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Step 3: 各自のローカル和 */}
            <div>
              <div className="step-label">{t('addStep3')}</div>
              <div className="party-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
                {sums.map((s, i) => (
                  <div className="party" key={i}>
                    <div className="party-head">
                      <span className="party-dot" style={{ background: partyColor(i) }} />
                      <span className="party-name">P{i + 1}</span>
                    </div>
                    <div className="chip-row">
                      {matrix.map((row, giver) => (
                        <Chip key={giver}>
                          <span className="chip-label">{t('addFrom', { n: giver + 1 })}</span>
                          {row[i]}
                        </Chip>
                      ))}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Chip flash>= {s}</Chip>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: 全体合計 */}
            <div className="result">
              <div className="small">{t('addStep4')}</div>
              <div className="big">
                {sums.join(' + ')} = {grand}
              </div>
              <div className="small">
                {t('addGrandTotal')}: <strong style={{ color: 'var(--accent-2)' }}>{grand}</strong>
                {' · '}
                {t('addCheck')}: {plain} {grand === plain ? '✓' : ''}
              </div>
            </div>
          </div>
        )}

        <Detail>
          <p>
            Each party <code>i</code> splits its value <code>vᵢ</code> into <code>n</code> shares whose
            sum is <code>vᵢ</code>, and sends share <code>j</code> to party <code>j</code>.
          </p>
          <p>
            Party <code>j</code> adds all shares it received: <code>tⱼ = Σᵢ matrix[i][j]</code>. Then{' '}
            <code>Σⱼ tⱼ = Σᵢ Σⱼ matrix[i][j] = Σᵢ vᵢ</code> — the true total, all in{' '}
            <code>Z_{FIELD_P}</code>.
          </p>
          <p>
            No party ever sees more than one random-looking share of anyone else’s value, so no
            individual <code>vᵢ</code> leaks.
          </p>
        </Detail>
      </div>
    </section>
  )
}
