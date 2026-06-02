import { useEffect, useState } from 'react'
import { LangContext, useT, type Lang, type Key } from './i18n'
import ModClock from './components/ModClock'
import SecretSharing from './components/SecretSharing'
import Shamir from './components/Shamir'
import AdditiveMPC from './components/AdditiveMPC'
import RandomMasking from './components/RandomMasking'
import Millionaires from './components/Millionaires'
import RealWorld from './components/RealWorld'
import { SECTIONS, SectionNav } from './components/SectionNav'

// 言語の初期値：URL の ?lang= を最優先、なければブラウザ設定で日本語を判定する。
function detectInitialLang(): Lang {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q === 'ja' || q === 'en') return q
  }
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

function Nav({ active }: { active: string }) {
  const { t } = useT()
  return (
    <nav className="nav">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''}>
          {t(s.navKey)}
        </a>
      ))}
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
      <p className="note">{t('introMap')}</p>
      <div className="hero-grid">
        {cards.map((c) => (
          <a className="hero-card" href={c.href} key={c.num}>
            <span className="hero-num">{c.num}</span>
            <h3>{t(c.title)}</h3>
            <p>{t(c.body)}</p>
          </a>
        ))}
      </div>
      <SectionNav id="intro" />
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
  const [active, setActive] = useState('intro')

  // 初回マウント時に言語を判定（SSR 非対応のため effect 内で）。
  useEffect(() => {
    setLang(detectInitialLang())
  }, [])

  // html lang 属性も同期して、スクリーンリーダ等に伝える。
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // 現在地のセクションをナビでハイライト（進捗インジケータ）。
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Header />
      <div className="app">
        <Nav active={active} />
        <Intro />
        <ModClock />
        <SecretSharing />
        <Shamir />
        <AdditiveMPC />
        <RandomMasking />
        <Millionaires />
        <RealWorld />
        <Footer />
      </div>
    </LangContext.Provider>
  )
}
