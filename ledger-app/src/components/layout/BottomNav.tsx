import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: 'dashboard', end: true },
  { to: '/mensal', label: 'Mensal', icon: 'calendar_month' },
  { to: '/cartoes', label: 'Cartões', icon: 'credit_card' },
  { to: '/metas', label: 'Metas', icon: 'ads_click' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-2px_12px_rgba(0,0,0,0.05)] md:hidden safe-bottom">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1.5 rounded-xl transition-colors ${
              isActive ? 'text-brand-blue' : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] uppercase tracking-tighter font-bold mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
              isActive ? 'text-brand-blue bg-brand-blue/10' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
