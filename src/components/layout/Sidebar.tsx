import { ChevronRight, FileText, Home, UserRound, LayoutDashboard, PlusCircle, List, Shield, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'

import vsoleLogo from '@/assets/image/VsoleLogo.png'
import { ROUTES } from '@/constants/app'

const collapsedLogo = '/favicon.ico'

type MenuItem = {
  icon: any
  key: string
  label: string
  roles: string[]
}

const menuItems: MenuItem[] = [
  { icon: Home, key: ROUTES.DASHBOARD, label: 'Dashboard', roles: ['admin'] },
  { icon: LayoutDashboard, key: ROUTES.CUSTOMER_DASHBOARD, label: 'Customer Dashboard', roles: ['customer'] },
  { icon: PlusCircle, key: ROUTES.REGISTER_PRODUCT, label: 'Register Product', roles: ['customer'] },
  { icon: List, key: ROUTES.MY_PRODUCTS, label: 'My Products', roles: ['customer'] },
  { icon: Shield, key: ROUTES.WARRANTY_STATUS, label: 'Warranty Status', roles: ['customer'] },
  { icon: FileText, key: ROUTES.ADMIN_REPLACEMENT_FORM, label: 'Replacement Form', roles: ['admin'] },
  // { icon: List, key: ROUTES.MY_REPLACEMENTS, label: 'My Replacements', roles: ['customer'] },
  { icon: Settings, key: ROUTES.ADMIN_WARRANTY_REQUESTS, label: 'Warranty Dashboard', roles: ['admin'] },
  { icon: FileText, key: ROUTES.ADMIN_REPLACEMENT_REQUESTS, label: 'Replacement Dashboard', roles: ['admin'] },
  { icon: UserRound, key: ROUTES.PROFILE, label: 'Profile', roles: ['customer', 'admin'] },
]

type SidebarProps = {
  collapsed: boolean
  responsiveCollapsed?: boolean
}

function Sidebar({ collapsed, responsiveCollapsed = false }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const userRole = useAppSelector((state) => state.auth.user?.role) || localStorage.getItem('customerRole') || 'customer'
  const shouldHideLabels = collapsed || responsiveCollapsed

  const dynamicMenuItems = [...menuItems]

  return (
    <aside className="relative flex h-full flex-col overflow-hidden border-r border-[#3E4A82] bg-[radial-gradient(circle_at_104%_98%,rgba(255,255,255,0.16),transparent_32%),linear-gradient(145deg,#283354_0%,#465692_48%,#6E7DE8_100%)] shadow-[10px_0_28px_rgba(31,42,86,0.2)]">
      {!shouldHideLabels && (
        <>
          <div className="animate-solar-glow pointer-events-none absolute right-[-28px] bottom-[132px] h-[76px] w-[76px] rounded-full bg-[#F6C51F] shadow-[0_0_82px_rgba(246,197,31,0.52)]" />
          <div className="solar-3d-scene pointer-events-none absolute left-[32px] bottom-[144px] opacity-42">
            <div className="animate-solar-panel-drift grid w-[190px] grid-cols-6 gap-1.5 [transform-style:preserve-3d]">
              {Array.from({ length: 18 }, (_, index) => (
                <span
                  className="animate-panel-shimmer h-4 rounded-[4px] border border-white/20 bg-[linear-gradient(115deg,rgba(255,255,255,0.34),rgba(91,110,245,0.28),rgba(255,255,255,0.22))] shadow-[0_10px_18px_rgba(20,27,52,0.12),inset_0_1px_0_rgba(255,255,255,0.28)]"
                  style={{
                    animationDelay: `${index * 90}ms`,
                    transform: `translateZ(${(index % 6) * 2}px)`,
                  }}
                  key={index}
                />
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[-92px] right-[-86px] h-[190px] w-[190px] rounded-full bg-white/12" />
        </>
      )}

      <div
        className={`relative z-10 flex h-[72px] shrink-0 items-center justify-center border-b border-white/10 bg-[#17213F]/20 backdrop-blur ${shouldHideLabels ? 'px-3' : 'px-5'
          }`}
      >
        {shouldHideLabels ? (
          <img
            alt="VSOLE Solar"
            className="h-10 w-10 object-contain"
            src={collapsedLogo}
          />
        ) : (
          <img
            alt="VSOLE Solar"
            className="h-auto w-[112px] object-contain"
            src={vsoleLogo}
          />
        )}
      </div>


      <nav
        className={`relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-5 ${shouldHideLabels ? 'px-2' : 'px-5'
          } ${shouldHideLabels ? 'pt-6' : 'pt-6'}`}
      >
        {!shouldHideLabels && (
          <p className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white">
            Main
          </p>
        )}

        <div className="grid gap-1">
          {dynamicMenuItems.filter(item => item.roles.includes(userRole)).map((item) => {
            const isActive = item.key === location.pathname
            const Icon = item.icon

            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex items-center border-0 text-left text-[13px] font-semibold outline-none transition ${shouldHideLabels
                  ? `mx-auto h-11 w-11 justify-center rounded-lg p-0 ${isActive
                    ? 'bg-white text-[#111827] shadow-[0_14px_28px_rgba(17,24,39,0.22)] ring-1 ring-white/35'
                    : 'bg-white/0 text-white hover:bg-white/10 hover:text-white'
                  }`
                  : `h-11 w-full gap-3 rounded-lg px-3 ${isActive
                    ? 'bg-white text-[#111827] shadow-[0_14px_28px_rgba(17,24,39,0.22)] ring-1 ring-white/30'
                    : 'bg-white/0 text-white hover:bg-white/10 hover:text-white'
                  }`
                  }`}
                key={item.key}
                onClick={() => navigate(item.key)}
                type="button"
              >
                {isActive && !shouldHideLabels && (
                  <span className="absolute -left-5 h-7 w-1 rounded-r-full bg-[#F6B400]" />
                )}

                <span
                  className={`flex shrink-0 items-center justify-center ${shouldHideLabels ? 'h-6 w-6' : 'h-5 w-5'} ${isActive
                    ? 'text-[#F6B400]'
                    : 'text-white group-hover:text-[#F6C51F]'
                    }`}
                >
                  <Icon size={shouldHideLabels ? 18 : 16} strokeWidth={2.1} />
                </span>

                {!shouldHideLabels && (
                  <>
                    <span className={`min-w-0 flex-1 truncate text-left transition-colors ${isActive ? 'text-[#F6B400]' : 'text-white group-hover:text-[#F6C51F]'}`}>
                      {item.label}
                    </span>
                    <ChevronRight
                      className={`shrink-0 transition ${isActive
                        ? 'text-[#F6B400]'
                        : 'text-white group-hover:text-[#F6C51F]'
                        }`}
                      size={14}
                      strokeWidth={2.2}
                    />
                  </>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
