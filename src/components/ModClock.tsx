import { useState } from 'react'
import { useT } from '../i18n'
import { FIELD_P, mod } from '../mpc'
import { Badge } from './shared'
import { SectionNav } from './SectionNav'

// 入門者が最初にぶつかる「mod（剰余）」を、時計のたとえで先に体感させるミニデモ。
// 小さな法 (CLOCK_P) の時計を実際に描き、針が一周して戻る様子を見せる。
const CLOCK_P = 12

export default function ModClock() {
  const { t } = useT()
  const [value, setValue] = useState(15)

  const r = mod(value, CLOCK_P)
  const wraps = Math.floor(value / CLOCK_P)
  // 針の角度（12時を上に、時計回り）。
  const angle = (r / CLOCK_P) * 360 - 90

  // 12個の目盛り。
  const ticks = Array.from({ length: CLOCK_P }, (_, i) => i)

  return (
    <section id="mod">
      <span className="section-tag">00 · {t('modValue')}</span>
      <Badge kind="foundation" />
      <h2>{t('modHeading')}</h2>
      <p className="lead">{t('modIntro', { p: FIELD_P })}</p>

      <div className="card">
        <div className="clock-wrap">
          <svg viewBox="-60 -60 120 120" className="clock" role="img" aria-label="clock">
            <circle cx="0" cy="0" r="50" className="clock-face" />
            {ticks.map((i) => {
              const a = (i / CLOCK_P) * 2 * Math.PI - Math.PI / 2
              const x = Math.cos(a) * 50
              const y = Math.sin(a) * 50
              const lx = Math.cos(a) * 40
              const ly = Math.sin(a) * 40
              return (
                <g key={i}>
                  <line x1={lx} y1={ly} x2={x} y2={y} className="clock-tick" />
                  <text
                    x={Math.cos(a) * 33}
                    y={Math.sin(a) * 33 + 3}
                    textAnchor="middle"
                    className={`clock-num${i === r ? ' active' : ''}`}
                  >
                    {i}
                  </text>
                </g>
              )
            })}
            {/* 針 */}
            <line
              x1="0"
              y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 30}
              y2={Math.sin((angle * Math.PI) / 180) * 30}
              className="clock-hand"
            />
            <circle cx="0" cy="0" r="3.5" className="clock-pin" />
          </svg>

          <div className="clock-side">
            <div className="control">
              <label>
                {t('modValue')}: <span className="val">{value}</span>
              </label>
              <input
                type="range"
                min={0}
                max={48}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </div>
            <div className="result" style={{ marginTop: 8 }}>
              <div className="small">{t('modResult', { a: value, p: CLOCK_P })}</div>
              <div className="big">{r}</div>
              <div className="small">
                {wraps > 0
                  ? t('modWrapNote', { a: value, p: CLOCK_P, w: wraps, r })
                  : t('modNoWrap', { a: value })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SectionNav id="mod" />
    </section>
  )
}
