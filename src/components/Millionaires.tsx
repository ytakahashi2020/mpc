import { useState } from 'react'
import { useT } from '../i18n'
import { garble } from '../mpc'
import { Chip, Detail } from './shared'

// 百万長者問題セクション：金額を明かさずに大小だけを判定する体験。
// 実際の Garbled Circuit は実装せず、入力が秘匿される様子を演出で伝える入門向け構成。
export default function Millionaires() {
  const { t } = useT()
  const [alice, setAlice] = useState(7)
  const [bob, setBob] = useState(4)
  const [revealed, setRevealed] = useState(false)

  const aliceWins = alice >= bob

  // バー表示は「結果が出た後」も金額そのものは隠し、相対比だけ見せない方針。
  // ここでは演出としてガーブル文字列を表示する。
  const aliceGarbled = garble(alice, 0xa11ce)
  const bobGarbled = garble(bob, 0xb0b)

  return (
    <section id="millionaire">
      <span className="section-tag">04 · {t('navMillionaire')}</span>
      <h2>{t('mHeading')}</h2>
      <p className="lead">{t('mIntro')}</p>

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
          <button className="btn btn-primary" onClick={() => setRevealed(true)}>
            🔒 {t('mRun')}
          </button>
        </div>

        {/* 各パーティが「見たもの」= ガーブルされた不可読な値 */}
        <div className="party">
          <div className="step-label">{t('mGarbled')}</div>
          <div className="chip-row">
            <Chip>0x{aliceGarbled}</Chip>
            <Chip>0x{bobGarbled}</Chip>
          </div>
        </div>

        {revealed && (
          <div className="result pop">
            <div className="big">{aliceWins ? '👈 Alice' : 'Bob 👉'}</div>
            <div className="small">{aliceWins ? t('mResultAlice') : t('mResultBob')}</div>
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
            label — never the inputs. The strings above stand in for those opaque wire labels.
          </p>
          <p>
            Only the final comparison bit is decoded. Neither <code>a</code> nor <code>b</code> is ever
            revealed.
          </p>
        </Detail>
      </div>
    </section>
  )
}
