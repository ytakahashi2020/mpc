import { useMemo, useState } from 'react'
import { useT } from '../i18n'
import { makePolynomial, evalPoly, lagrangeAtZero, makeRng } from '../mpc'
import { Badge, Detail, partyColor } from './shared'
import { SectionNav } from './SectionNav'

// Shamir のしきい値秘密分散（t-of-n）。多項式と点をグラフで可視化し、
// 「t 個の点があれば曲線が一意に決まり秘密が復元できる」ことを触って理解する。
export default function Shamir() {
  const { t } = useT()
  const [secret, setSecret] = useState(8)
  const [threshold, setThreshold] = useState(3) // t
  const [parties, setParties] = useState(5) // n
  const [seed, setSeed] = useState(1)
  // どの点(パーティ)を復元に使うか。
  const [selected, setSelected] = useState<Set<number>>(new Set([1, 2, 3]))

  const valid = threshold <= parties

  // 次数 t-1 の多項式（係数）。秘密が切片。
  const coeffs = useMemo(() => {
    const rng = makeRng()
    return makePolynomial(secret, threshold, rng)
  }, [secret, threshold, seed])

  // 各パーティ i (1..n) のシェア = 点 (i, f(i))。
  const points = useMemo(
    () => Array.from({ length: parties }, (_, k) => ({ x: k + 1, y: evalPoly(coeffs, k + 1) })),
    [coeffs, parties],
  )

  const sel = [...selected].filter((i) => i >= 1 && i <= parties)
  const enough = sel.length >= threshold
  // 選んだ点だけで補間して x=0 の値（=秘密）を推定。
  const recovered = useMemo(() => {
    if (!enough) return null
    const xs = sel.map((i) => points[i - 1].x)
    const ys = sel.map((i) => points[i - 1].y)
    return Math.round(lagrangeAtZero(xs, ys))
  }, [sel, enough, points])

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  // --- グラフの座標変換 ---
  // x=0（秘密の位置）を必ず内側に見せるため、x の範囲を [-0.6, n+0.4] にする。
  const W = 340
  const H = 230
  const padL = 40
  const padB = 28
  const padT = 14
  const xMin = -0.6
  const xMax = parties + 0.4
  const ys = points.map((p) => p.y).concat([secret, 0])
  const yMin = Math.min(...ys) - 2
  const yMax = Math.max(...ys) + 2
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - 10)
  const sy = (y: number) => H - padB - ((y - yMin) / (yMax - yMin)) * (H - padB - padT)

  // 選んだ点だけを通る補間曲線（点が十分なら真の曲線に一致、足りなければ歪む）。
  const curvePath = useMemo(() => {
    if (sel.length < 2) return ''
    const xs = sel.map((i) => points[i - 1].x)
    const yy = sel.map((i) => points[i - 1].y)
    // ラグランジュ補間で連続的に評価。
    const interp = (x: number) => {
      let total = 0
      for (let i = 0; i < xs.length; i++) {
        let term = yy[i]
        for (let j = 0; j < xs.length; j++) {
          if (j !== i) term *= (x - xs[j]) / (xs[i] - xs[j])
        }
        total += term
      }
      return total
    }
    // x=0（秘密）まで届くよう xMin から描く。
    let d = ''
    const steps = Math.round((xMax - xMin) * 24)
    for (let k = 0; k <= steps; k++) {
      const x = xMin + ((xMax - xMin) * k) / steps
      const y = interp(x)
      d += `${k === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)} `
    }
    return d
  }, [sel, points, xMin, xMax, yMin, yMax])

  return (
    <section id="shamir">
      <span className="section-tag">01b · {t('navShamir')}</span>
      <Badge kind="block" />
      <h2>{t('shamirHeading')}</h2>
      <p className="lead">{t('shamirIntro')}</p>

      <div className="card">
        <div className="control">
          <label>
            {t('shamirSecretLabel')}: <span className="val">{secret}</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={secret}
            onChange={(e) => setSecret(Number(e.target.value))}
          />
        </div>
        <div className="party-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="control">
            <label>
              {t('shamirThresholdLabel')}: <span className="val">{threshold}</span>
            </label>
            <input
              type="range"
              min={2}
              max={5}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>
          <div className="control">
            <label>
              {t('shamirPartiesLabel')}: <span className="val">{parties}</span>
            </label>
            <input
              type="range"
              min={2}
              max={7}
              value={parties}
              onChange={(e) => setParties(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="btn-row">
          <button className="btn" onClick={() => setSeed((s) => s + 1)}>
            🎲 {t('shamirReshuffle')}
          </button>
        </div>

        {!valid ? (
          <p className="note">{t('shamirTooMany')}</p>
        ) : (
          <>
            {/* グラフ */}
            <div className="graph-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="graph" role="img" aria-label={t('shamirGraphAria')}>
                {/* x=0 の縦ガイド（秘密が隠れている列） */}
                <line x1={sx(0)} y1={padT} x2={sx(0)} y2={H - padB} className="secret-guide" />
                {/* x軸（y=0 の高さ） */}
                <line x1={padL} y1={sy(0)} x2={W - 6} y2={sy(0)} className="axis" />
                {/* y軸 */}
                <line x1={padL} y1={padT} x2={padL} y2={H - padB} className="axis" />

                {/* 軸ラベル */}
                <text x={W - 6} y={sy(0) + 14} className="axis-name" textAnchor="end">
                  {t('shamirAxisX')}
                </text>
                <text x={padL - 4} y={padT + 2} className="axis-name" textAnchor="end">
                  {t('shamirAxisY')}
                </text>

                {/* 補間曲線（選んだ点を通り、x=0 まで伸びる） */}
                {curvePath && <path d={curvePath} className="curve" />}

                {/* 秘密 = x=0 での高さ。復元できたときだけ「正解」として強調表示。 */}
                {enough && (
                  <>
                    <line
                      x1={sx(0)}
                      y1={sy(0)}
                      x2={sx(0)}
                      y2={sy(secret)}
                      className="secret-rise"
                    />
                    <circle cx={sx(0)} cy={sy(secret)} r={6} className="secret-dot" />
                    <text x={sx(0) + 9} y={sy(secret) - 7} className="secret-label">
                      {t('shamirHere', { s: secret })}
                    </text>
                  </>
                )}
                {/* x=0 の目盛りラベル */}
                <text x={sx(0)} y={H - padB + 15} className="axis-label">
                  0
                </text>

                {/* 各点（シェア） */}
                {points.map((p, k) => {
                  const i = k + 1
                  const on = selected.has(i)
                  return (
                    <g key={i} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
                      <circle
                        cx={sx(p.x)}
                        cy={sy(p.y)}
                        r={7}
                        fill={on ? partyColor(k) : 'var(--bg-soft)'}
                        stroke={partyColor(k)}
                        strokeWidth={2}
                        opacity={on ? 1 : 0.5}
                      />
                      <text x={sx(p.x)} y={H - padB + 15} className="axis-label">
                        {i}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <p className="graph-caption">{t('shamirGraphCaption')}</p>
            <p className="hint-line">👆 {t('shamirHint')}</p>

            {/* 点の一覧（タップで選択） */}
            <div className="chip-row">
              {points.map((p, k) => {
                const i = k + 1
                const on = selected.has(i)
                return (
                  <button
                    key={i}
                    type="button"
                    className={`chip${on ? ' flash' : ''}`}
                    style={{ cursor: 'pointer', borderColor: partyColor(k) }}
                    onClick={() => toggle(i)}
                  >
                    {on ? '🟢' : '⚪'} {t('shamirPartyPoint', { n: i, x: p.x, y: Math.round(p.y) })}
                  </button>
                )
              })}
            </div>

            <div className={`result${enough ? '' : ' result-locked'}`} style={{ marginTop: 14 }}>
              <div className="small">{t('shamirSelected', { k: sel.length, t: threshold })}</div>
              {enough ? (
                <>
                  <div className="big">{recovered}</div>
                  <div className="small">{t('shamirEnough', { s: recovered ?? '' })}</div>
                </>
              ) : (
                <>
                  <div className="big">🔒 ?</div>
                  <div className="small">{t('shamirNotEnough')}</div>
                </>
              )}
            </div>
          </>
        )}

        <p className="note">{t('shamirVsAdditive')}</p>

        <Detail>
          <p>{t('shamirMath1')}</p>
          <p>{t('shamirMath2')}</p>
          <p>{t('shamirMath3')}</p>
        </Detail>
      </div>
      <SectionNav id="shamir" />
    </section>
  )
}
