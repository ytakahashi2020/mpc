import { useState } from 'react'
import { useT } from '../i18n'
import { garbleLabel } from '../mpc'
import { Chip, Detail } from './shared'

// 百万長者問題セクション：金額を明かさずに大小だけを判定する体験。
// 注意：本デモは本物の Garbled Circuit / OT は実装せず、比較自体はローカルで行う簡略版。
// 表示するガーブル風ラベルは「不可読なワイヤラベル」のイメージ図であり、実通信内容ではない。
export default function Millionaires() {
  const { t } = useT()
  const [alice, setAlice] = useState(7)
  const [bob, setBob] = useState(4)
  const [revealed, setRevealed] = useState(false)
  // 表示用ラベルは実行ごとに引き直す nonce から作る（金額には依存させない＝逆算不能）。
  const [nonce, setNonce] = useState(1)

  const equal = alice === bob
  const aliceWins = alice > bob

  // 結果が出ても金額そのものは出さず、相対的な長さ（どちらが長いか）だけバーで見せる。
  const aliceLabel = garbleLabel(nonce * 2654435761 + 0x11)
  const bobLabel = garbleLabel(nonce * 40503 + 0x22)

  const run = () => {
    setNonce((n) => n + 1)
    setRevealed(true)
  }

  return (
    <section id="millionaire">
      <span className="section-tag">04 · {t('navMillionaire')}</span>
      <h2>{t('mHeading')}</h2>
      <p className="lead">{t('mIntro')}</p>
      <p className="note">{t('mDisclaimer')}</p>

      <div className="card">
        <div className="party-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="control">
            <label style={{ color: 'var(--accent)' }}>
              {t('mAliceLabel')}: <span className="val">{alice}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={alice}
              onChange={(e) => {
                setAlice(Number(e.target.value))
                setRevealed(false)
              }}
            />
          </div>
          <div className="control">
            <label style={{ color: 'var(--accent-2)' }}>
              {t('mBobLabel')}: <span className="val">{bob}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={bob}
              onChange={(e) => {
                setBob(Number(e.target.value))
                setRevealed(false)
              }}
            />
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={run}>
            🔒 {t('mRun')}
          </button>
        </div>

        {/* 各パーティが「見たもの」= ガーブルされた不可読なラベル（イメージ図） */}
        <div className="party">
          <div className="step-label">{t('mGarbled')}</div>
          <div className="chip-row">
            <Chip>0x{aliceLabel}</Chip>
            <Chip>0x{bobLabel}</Chip>
          </div>
        </div>

        {revealed && (
          <div className="result pop">
            <div className="big">
              {equal ? '🤝' : aliceWins ? '👈 Alice' : 'Bob 👉'}
            </div>
            <div className="small">
              {equal ? t('mResultEqual') : aliceWins ? t('mResultAlice') : t('mResultBob')}
            </div>

            {/* 金額は隠したまま、相対的な長さだけ見せる（数値ラベルは出さない） */}
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(alice / 10) * 100}%`, background: 'var(--accent)' }}
                />
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(bob / 10) * 100}%`, background: 'var(--accent-2)' }}
                />
              </div>
              <div className="small">{t('mBarsNote')}</div>
            </div>

            <div className="small" style={{ marginTop: 6 }}>
              {t('mResultHidden')}
            </div>
          </div>
        )}

        <Detail>
          <p>
            Yao’s original 1982 problem: two parties with private inputs <code>a</code> and{' '}
            <code>b</code> learn only the bit <code>a ≥ b</code>.
          </p>
          <p>
            In a <strong>garbled circuit</strong>, one party encrypts (“garbles”) a boolean comparison
            circuit so every wire carries a random-looking label instead of a real <code>0/1</code>.
            The other party evaluates it via <em>oblivious transfer</em>, learning only the output
            label — never the inputs. The strings above <strong>stand in for</strong> those opaque wire
            labels; they are decorative, not a real protocol transcript.
          </p>
          <p>
            <strong>Honesty note:</strong> unlike the previous three sections (which run real{' '}
            <code>Z_p</code> arithmetic), this section computes the comparison locally as a simplified
            simulation. Only the final “who is richer” bit is meant to be revealed; the amounts are
            never displayed.
          </p>
        </Detail>
      </div>
    </section>
  )
}
