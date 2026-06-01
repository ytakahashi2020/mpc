import { useEffect, useState } from 'react'
import { LangContext, useT, type Lang, type Key } from './i18n'
import SecretSharing from './components/SecretSharing'
import AdditiveMPC from './components/AdditiveMPC'
import RandomMasking from './components/RandomMasking'
import Millionaires from './components/Millionaires'

// 言語の初期値：URL ハッシュやブラウザ設定から日本語を優先判定する。
function detectInitialLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return nav.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

function Header() {
  const { t, lang, setLang } = useT()
  return (
    <header className="header">
      <div className="header-row">
        <div className="brand">
          <div className="brand-mark">∑</div>
          <div>
            <h1>{t('appTitle')}</h1>
            <p>{t('appSubtitle')}</p>
          </div>
        </div>
        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
            EN
          </button>
          <button className={lang === 'ja' ? 'active' : ''} onClick={() => setLang('ja')}>
            日本語
          </button>
        </div>
      </div>
    </header>
  )
}

function Nav() {
  const { t } = useT()
  return (
    <nav className="nav">
      <a href="#intro">{t('navIntro')}</a>
      <a href="#shares">{t('navShares')}</a>
      <a href="#add">{t('navAdd')}</a>
      <a href="#mask">{t('navMask')}</a>
      <a href="#millionaire">{t('navMillionaire')}</a>
    </nav>
  )
}

function Intro() {
  const { t } = useT()
  const cards: Array<{ num: string; href: string; title: Key; body: Key }> = [
    { num: '01', href: '#shares', title: 'introCardSharesTitle', body: 'introCardSharesBody' },
    { num: '02', href: '#add', title: 'introCardAddTitle', body: 'introCardAddBody' },
    { num: '03', href: '#mask', title: 'introCardMaskTitle', body: 'introCardMaskBody' },
    {
      num: '04',
      href: '#millionaire',
      title: 'introCardMillionaireTitle',
      body: 'introCardMillionaireBody',
    },
  ]
  return (
    <section id="intro">
      <span className="section-tag">{t('navIntro')}</span>
      <h2>{t('introHeading')}</h2>
      <p className="lead">{t('introBody')}</p>
      <div className="hero-grid">
        {cards.map((c) => (
          <a className="hero-card" href={c.href} key={c.num}>
            <span className="hero-num">{c.num}</span>
            <h3>{t(c.title)}</h3>
            <p>{t(c.body)}</p>
          </a>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  const { t } = useT()
  return (
    <footer className="footer">
      <p>{t('footerNote')}</p>
    </footer>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')

  // 初回マウント時に言語を判定（SSR 非対応のため effect 内で）。
  useEffect(() => {
    setLang(detectInitialLang())
  }, [])

  // html lang 属性も同期して、スクリーンリーダ等に伝える。
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Header />
      <div className="app">
        <Nav />
        <Intro />
        <SecretSharing />
        <AdditiveMPC />
        <RandomMasking />
        <Millionaires />
        <Footer />
      </div>
    </LangContext.Provider>
  )
}
