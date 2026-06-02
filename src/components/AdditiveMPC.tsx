import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { shareMatrix, localSums, reconstruct, makeRng, mod, FIELD_P } from '../mpc'
import { Badge, Chip, Detail, partyColor } from './shared'
import { SectionNav } from './SectionNav'

// 加算的MPCセクション：3者がシェアを交換して合計だけを得るプロトコルを段階的に見せる。
export default function AdditiveMPC() {
  const { t } = useT()
  const [values, setValues] = useState([8, 5, 12])
  const [seed, setSeed] = useState(3)
  // step: 0 = 未実行, 1..4 = 各ステップまで表示。段階送りで理解負荷を下げる。
  const [step, setStep] = useState(0)

  const n = values.length

  // giver→receiver のシェア行列。実行のたびに暗号学的乱数で引き直す（値には依存しない）。
  const matrix = useMemo(() => {
    const rng = makeRng()
    return shareMatrix(values, rng)
  }, [values, seed])

  const sums = useMemo(() => localSums(matrix), [matrix])
  const grand = reconstruct(sums)
  const plain = mod(values.reduce((a, b) => a + b, 0))

  // 入力の合計（mod する前の素朴な値）。最初の状態でゴールとして示す。
  const inputRaw = values.reduce((a, b) => a + b, 0)
  // 各 giver の行（分割したシェア）の素朴な合計。mod すると元の値に戻る。
  const rowRaw = matrix.map((row) => row.reduce((a, b) => a + b, 0))
  // 各 receiver が受け取ったシェアの素朴な合計（列ごとの和、mod 前）。
  const colRaw = matrix[0]
    ? matrix[0].map((_, j) => matrix.reduce((acc, row) => acc + row[j], 0))
    : []
  // 手元の合計（mod 後）の素朴な総和。
  const grandRaw = sums.reduce((a, b) => a + b, 0)

  const setVal = (i: number, v: number) => {
    setValues((arr) => arr.map((x, j) => (j === i ? v : x)))
    setStep(0) // 入力を変えたらやり直し
  }

  return (
    <section id="add">
      <span className="section-tag">02 · {t('navAdd')}</span>
      <Badge kind="mpc" />
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
                max={20}
                onChange={(e) => setVal(i, mod(Number(e.target.value)))}
              />
            </div>
          ))}
        </div>

        {/* 最初の状態でも「求めたい合計」を提示しておく（ゴールの明示） */}
        <div className="total-line">
          {t('addInputTotal')}: <strong>{values.join(' + ')} = {inputRaw}</strong>
        </div>

        <div className="btn-row">
          {step === 0 ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSeed((s) => s + 1)
                setStep(1)
              }}
            >
              ▶ {t('addReveal')}
            </button>
          ) : (
            <>
              {step < 4 && (
                <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                  {t('addNext')}
                </button>
              )}
              <button className="btn" onClick={() => setStep(0)}>
                ↺ {t('addReset')}
              </button>
              <span className="step-counter">{t('addStepCounter', { c: step })}</span>
            </>
          )}
        </div>

        {step >= 1 && (
          <div className="steps pop">
            {/* Step 1: 各パーティが値をシェアに分割（秘密分散セクションの再掲＝つながり） */}
            <div>
              <div className="step-label">{t('addStep1')}</div>
              <p className="hint-line">{t('addStep1Body')}</p>
              <div className="party-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
                {matrix.map((row, giver) => (
                  <div className="party" key={giver}>
                    <div className="party-head">
                      <span className="party-dot" style={{ background: partyColor(giver) }} />
                      <span className="party-name">{t('addRowSplits', { n: giver + 1, v: values[giver] })}</span>
                    </div>
                    <div className="chip-row">
                      {row.map((cell, j) => (
                        <Chip key={j}>{cell}</Chip>
                      ))}
                    </div>
                    <div className="sub-line">
                      {t('addSplitCheck', {
                        raw: rowRaw[giver],
                        p: FIELD_P,
                        m: mod(rowRaw[giver]),
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: 交換行列 */}
            {step >= 2 && (
            <div className="pop">
              <div className="step-label">{t('addStep2')}</div>
              <p className="hint-line">{t('addRowGiver')} · {t('addColReceiver')}</p>
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
            )}

            {/* Step 3: 各自のローカル和 */}
            {step >= 3 && (
            <div className="pop">
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
                    <div className="sub-line">{t('addLocalRaw', { raw: colRaw[i] })}</div>
                    <div style={{ marginTop: 8 }}>
                      <Chip flash>{t('addLocalMod', { raw: colRaw[i], p: FIELD_P, m: s })}</Chip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Step 4: 全体合計 */}
            {step >= 4 && (
            <div className="result pop">
              <div className="small">{t('addStep4')}</div>
              <div className="big">
                {sums.join(' + ')} = {grandRaw}
              </div>
              <div className="small">
                {t('addGrandRaw')}: <strong>{grandRaw}</strong>
                {' → '}
                {t('addModSum', { p: FIELD_P })} ={' '}
                <strong style={{ color: 'var(--accent-2)' }}>{grand}</strong>
              </div>
              <div className="small">
                {t('addGrandTotal')}: <strong style={{ color: 'var(--accent-2)' }}>{grand}</strong>
                {' · '}
                {t('addCheck')}: {plain} {grand === plain ? '✓' : ''}
              </div>
            </div>
            )}
          </div>
        )}

        <Detail>
          <p>{t('addMath1')}</p>
          <p>{t('addMath2', { p: FIELD_P })}</p>
          <p>{t('addMath3')}</p>
        </Detail>
      </div>
      <SectionNav id="add" />
    </section>
  )
}
