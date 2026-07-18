import { ChevronRight, FileText, Home, UserRound } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import vsoleLogo from '@/assets/image/VsoleLogo.png'
import { ROUTES } from '@/constants/app'

const collapsedLogo = '/favicon.ico'

const menuItems = [
  { icon: Home, key: ROUTES.DASHBOARD, label: 'Dashboard' },
  { icon: FileText, key: ROUTES.REPLACEMENT, label: 'Replacement' },
  { icon: UserRound, key: ROUTES.PROFILE, label: 'Profile' },
]

type SidebarProps = {
  collapsed: boolean
  responsiveCollapsed?: boolean
}

function Sidebar({ collapsed, responsiveCollapsed = false }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const shouldHideLabels = collapsed || responsiveCollapsed

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
        className={`relative z-10 flex h-[72px] shrink-0 items-center justify-center border-b border-white/10 bg-[#17213F]/20 backdrop-blur ${
          shouldHideLabels ? 'px-3' : 'px-5'
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
        className={`relative z-10 min-h-0 flex-1 overflow-y-auto pb-5 ${
          shouldHideLabels ? 'px-2' : 'px-5'
        } ${shouldHideLabels ? 'pt-6' : 'pt-6'}`}
      >
        {!shouldHideLabels && (
          <p className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white/70">
            Main
          </p>
        )}

        <div className="grid gap-1">
          {menuItems.map((item) => {
            const isActive = item.key === location.pathname
            const Icon = item.icon

            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex items-center border-0 text-left text-[13px] font-semibold outline-none transition ${
                  shouldHideLabels
                    ? `mx-auto h-11 w-11 justify-center rounded-lg p-0 ${
                      isActive
                        ? 'bg-white text-[#111827] shadow-[0_14px_28px_rgba(17,24,39,0.22)] ring-1 ring-white/35'
                        : 'bg-white/0 text-white/78 hover:bg-white/14 hover:text-white'
                    }`
                    : `h-11 w-full gap-3 rounded-lg px-3 ${
                      isActive
                        ? 'bg-white text-[#111827] shadow-[0_14px_28px_rgba(17,24,39,0.22)] ring-1 ring-white/30'
                        : 'bg-white/0 text-white/82 hover:bg-white/14 hover:text-white'
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
                  className={`flex shrink-0 items-center justify-center ${shouldHideLabels ? 'h-6 w-6' : 'h-5 w-5'} ${
                    isActive
                      ? 'text-[#F6B400]'
                      : 'text-white/72 group-hover:text-[#F6C51F]'
                  }`}
                >
                  <Icon size={shouldHideLabels ? 18 : 16} strokeWidth={2.1} />
                </span>

                {!shouldHideLabels && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-left">
                      {item.label}
                    </span>
                    <ChevronRight
                      className={`shrink-0 transition ${
                        isActive
                          ? 'text-[#F6B400]'
                          : 'text-white/45 group-hover:text-[#F6C51F]'
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
