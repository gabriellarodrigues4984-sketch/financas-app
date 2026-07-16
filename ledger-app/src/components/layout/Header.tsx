import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DesktopNav } from './BottomNav'
import { NotificationBell } from './NotificationBell'

export function Header() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? ''

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant px-4 md:px-8 py-3">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-blue text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          <span className="font-display font-bold text-lg text-brand-blue">Grão Finanças</span>
        </div>

        <DesktopNav />

        <div className="flex items-center gap-3" ref={menuRef}>
          <NotificationBell />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-low flex items-center justify-center"
              aria-label="Menu do usuário"
            >
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-pop-in origin-top-right">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <div className="text-sm font-bold text-on-surface truncate">{name}</div>
                  <div className="text-xs text-on-surface-variant truncate">{user?.email}</div>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand-red font-medium hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
