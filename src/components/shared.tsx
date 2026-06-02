import { useState, type ReactNode } from 'react'
import { useT, type Key } from '../i18n'

// パーティごとの識別色。最大8パーティまで。
export const PARTY_COLORS = [
  '#6ea8fe',
  '#8be9c0',
  '#ffb86b',
  '#ff7a90',
  '#c792ea',
  '#7ee0e0',
  '#f7d486',
  '#a0e57f',
]

export function partyColor(i: number): string {
  return PARTY_COLORS[i % PARTY_COLORS.length]
}

// 「数式を見る / 隠す」トグル。中身は children に渡す。
export function Detail({ children }: { children: ReactNode }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button className="detail-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? t('hideDetail') : t('showDetail')}
      </button>
      {open && <div className="detail pop">{children}</div>}
    </div>
  )
}

// 単一のシェアチップ。flash 中は強調表示。
export function Chip({ children, flash }: { children: ReactNode; flash?: boolean }) {
  return <span className={`chip${flash ? ' flash' : ''}`}>{children}</span>
}

// 各セクションが「部品」か「MPC本体」かを示す位置づけバッジ。
// kind: 'foundation'（土台の考え方）/ 'block'（分けるだけの部品）/ 'mpc'（隠したまま計算）
export function Badge({ kind }: { kind: 'foundation' | 'block' | 'mpc' }) {
  const { t } = useT()
  const key: Key =
    kind === 'mpc' ? 'badgeMpc' : kind === 'block' ? 'badgeBuildingBlock' : 'badgeFoundation'
  return <div className={`role-badge role-${kind}`}>{t(key)}</div>
}
