import { useT, type Key } from '../i18n'

// セクションの並び。ナビ・進捗・「次へ」リンクで共有する単一の真実。
export const SECTIONS: Array<{ id: string; navKey: Key }> = [
  { id: 'intro', navKey: 'navIntro' },
  { id: 'mod', navKey: 'navMod' },
  { id: 'shares', navKey: 'navShares' },
  { id: 'add', navKey: 'navAdd' },
  { id: 'mask', navKey: 'navMask' },
  { id: 'millionaire', navKey: 'navMillionaire' },
]

// 各セクション末尾の「次へ」リンク。学習の流れを前へ前へと押し出す。
export function SectionNav({ id }: { id: string }) {
  const { t } = useT()
  const idx = SECTIONS.findIndex((s) => s.id === id)
  const next = SECTIONS[idx + 1]
  if (!next) return null
  return (
    <div className="section-next">
      <a href={`#${next.id}`}>{t('nextSection', { name: t(next.navKey) })}</a>
    </div>
  )
}
