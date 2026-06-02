import { useT } from '../i18n'
import { SectionNav } from './SectionNav'

// 実世界での使い分け：ブロックチェーンの秘密鍵で SSS と MPC(TSS) がどう使い分けられるか。
// インタラクションのない解説セクション（デモ全体のまとめ的な位置づけ）。
export default function RealWorld() {
  const { t } = useT()
  return (
    <section id="real">
      <span className="section-tag">05 · {t('navReal')}</span>
      <h2>{t('realHeading')}</h2>
      <p className="lead">{t('realIntro')}</p>

      <div className="hero-grid">
        <div className="hero-card" style={{ cursor: 'default' }}>
          <h3>{t('realCard1Title')}</h3>
          <p>{t('realCard1Body')}</p>
        </div>
        <div className="hero-card" style={{ cursor: 'default' }}>
          <h3>{t('realCard2Title')}</h3>
          <p>{t('realCard2Body')}</p>
        </div>
      </div>

      <div className="card">
        <p style={{ margin: 0 }}>{t('realVerdict')}</p>
      </div>

      <SectionNav id="real" />
    </section>
  )
}
