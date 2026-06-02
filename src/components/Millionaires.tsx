import { useMemo, useState } from 'react'
import { useT, type Key } from '../i18n'
import { additiveShares, mod, makeRng, FIELD_P } from '../mpc'
import { Chip, Detail, partyColor } from './shared'
import { SectionNav } from './SectionNav'

// 百万長者問題セクション：金額を明かさずに大小だけを判定する。
// 方式：加算的シェアで差 d = Alice − Bob を秘密計算し、その「符号」だけを公開する。
// （前セクションのシェアの仕組みがそのまま使える＝学びが地続きになる）
type Guess = 'alice' | 'bob' | 'equal' | null

export default function Millionaires() {
  const { t } = useT()
  const [alice, setAlice] = useState(7)
  const [bob, setBob] = useState(4)
  const [guess, setGuess] = useState<Guess>(null)
  const [step, setStep] = useState(0) // 0=未実行, 1..3
  const [seed, setSeed] = useState(1)

  // 各財産を2つのシェアに分割。P1(Alice) が [0]、P2(Bob) が [1] を保持する慣習。
  const { aShares, bShares } = useMemo(() => {
    const rng = makeRng()
    return { aShares: additiveShares(alice, 2, rng), bShares: additiveShares(bob, 2, rng) }
  }, [alice, bob, seed])

  // 各パーティが手元で計算する「差 d のシェア」 = 自分が持つ Alice のシェア − Bob のシェア。
  const diffShares = [mod(aShares[0] - bShares[0]), mod(aShares[1] - bShares[1])]
  // 復元される d（体の上での値）。符号判定には本当の差を使う。
  const trueDiff = alice - bob
  const sign = trueDiff > 0 ? 'pos' : trueDiff < 0 ? 'neg' : 'zero'

  const reset = () => setStep(0)
  const resultKey: Key =
    sign === 'pos' ? 'mResultAlice' : sign === 'neg' ? 'mResultBob' : 'mResultEqual'
  const guessCorrect =
    (guess === 'alice' && sign === 'pos') ||
    (guess === 'bob' && sign === 'neg') ||
    (guess === 'equal' && sign === 'zero')

  return (
    <section id="millionaire">
      <span className="section-tag">04 · {t('navMillionaire')}</span>
      <h2>{t('mHeading')}</h2>
      <p className="lead">{t('mIntro')}</p>

      <div className="card">
        {/* 入力（金額。実行後は隠す＝ここから先は金額を使わないことを示す） */}
        <div className="party-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="control">
            <label style={{ color: partyColor(0) }}>
              {t('mAliceLabel')}: <span className="val">{step === 0 ? alice : '🔒'}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={alice}
              disabled={step > 0}
              onChange={(e) => {
                setAlice(Number(e.target.value))
                setStep(0)
              }}
            />
          </div>
          <div className="control">
            <label style={{ color: partyColor(1) }}>
              {t('mBobLabel')}: <span className="val">{step === 0 ? bob : '🔒'}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={bob}
              disabled={step > 0}
              onChange={(e) => {
                setBob(Number(e.target.value))
                setStep(0)
              }}
            />
          </div>
        </div>

        {/* 実行前の予想（クイズ要素） */}
        {step === 0 && (
          <div className="guess-box">
            <div className="step-label">{t('mGuessPrompt')}</div>
            <div className="btn-row" style={{ margin: '8px 0 0' }}>
              {(['alice', 'bob', 'equal'] as const).map((g) => (
                <button
                  key={g}
                  className={`btn${guess === g ? ' btn-primary' : ''}`}
                  onClick={() => setGuess(g)}
                >
                  {g === 'alice' ? t('mGuessAlice') : g === 'bob' ? t('mGuessBob') : t('mGuessEqual')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="btn-row">
          {step === 0 ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSeed((s) => s + 1)
                setStep(1)
              }}
            >
              🔒 {t('mRun')}
            </button>
          ) : (
            <>
              {step < 3 && (
                <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                  {t('mNext')}
                </button>
              )}
              <button className="btn" onClick={reset}>
                ↺ {t('mReset')}
              </button>
              <span className="step-counter">{t('mStepCounter', { c: step })}</span>
            </>
          )}
        </div>

        {step >= 1 && (
          <div className="steps pop">
            {/* Step 1: それぞれが財産を2シェアに分割 */}
            <div>
              <div className="step-label">{t('mStep1')}</div>
              <p className="hint-line">{t('mStep1Body')}</p>
              <div className="party-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {[aShares, bShares].map((sh, who) => (
                  <div className="party" key={who}>
                    <div className="party-head">
                      <span className="party-dot" style={{ background: partyColor(who) }} />
                      <span className="party-name">{who === 0 ? 'Alice' : 'Bob'}</span>
                    </div>
                    <div className="chip-row">
                      <span className="chip-label">{t('mShareKeeps', { n: who + 1 })}</span>
                      <Chip>{sh[who]}</Chip>
                    </div>
                    <div className="chip-row" style={{ marginTop: 6 }}>
                      <span className="chip-label">{t('mShareGives')}</span>
                      <Chip>{sh[1 - who]}</Chip>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: 各自が差 d のシェアを手元で作る */}
            {step >= 2 && (
              <div className="pop">
                <div className="step-label">{t('mStep2')}</div>
                <p className="hint-line">{t('mStep2Body')}</p>
                <div className="party-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {[0, 1].map((who) => (
                    <div className="party" key={who}>
                      <div className="party-head">
                        <span className="party-dot" style={{ background: partyColor(who) }} />
                        <span className="party-name">{who === 0 ? 'Alice' : 'Bob'}</span>
                      </div>
                      <div className="sub-line">
                        {aShares[who]} − {bShares[who]} ≡ {diffShares[who]} (mod {FIELD_P})
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span className="chip-label">{t('mDiffShare', { n: who + 1 })}</span>
                        <Chip flash>{diffShares[who]}</Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: シェアを合わせ、符号だけ公開 */}
            {step >= 3 && (
              <div className="result pop">
                <div className="step-label">{t('mStep3')}</div>
                <p className="hint-line">{t('mStep3Body')}</p>

                <div className="small" style={{ marginTop: 8 }}>
                  {t('mSignLabel')}
                </div>
                <div className="big">
                  {sign === 'pos' ? t('mSignPos') : sign === 'neg' ? t('mSignNeg') : t('mSignZero')}
                  {'  '}
                  {sign === 'pos' ? '👈 Alice' : sign === 'neg' ? 'Bob 👉' : '🤝'}
                </div>
                <div className="small" style={{ marginTop: 4 }}>
                  <strong style={{ color: 'var(--accent-2)' }}>{t(resultKey)}</strong>
                </div>

                {guess && (
                  <div className="small" style={{ marginTop: 8 }}>
                    {guessCorrect ? t('mGuessRight') : t('mGuessWrong')}
                  </div>
                )}

                <div className="small" style={{ marginTop: 6 }}>
                  {t('mResultHidden')}
                </div>
              </div>
            )}
          </div>
        )}

        <Detail>
          <p>{t('mMath1')}</p>
          <p>{t('mMath2')}</p>
          <p>{t('mMath3', { p: FIELD_P })}</p>
        </Detail>
      </div>
      <SectionNav id="millionaire" />
    </section>
  )
}
