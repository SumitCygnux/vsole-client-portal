import { Layout } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import AppHeader from './Header'
import Sidebar from './Sidebar'

const { Content, Sider } = Layout

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [responsiveCollapsed, setResponsiveCollapsed] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)')

    const updateResponsiveState = () => {
      setResponsiveCollapsed(mediaQuery.matches)
    }

    updateResponsiveState()
    mediaQuery.addEventListener('change', updateResponsiveState)

    return () => {
      mediaQuery.removeEventListener('change', updateResponsiveState)
    }
  }, [])

  const isSidebarCollapsed = collapsed || responsiveCollapsed

  return (
    <Layout className="min-h-dvh bg-[#F1F3FC]">
      <Sider
        collapsed={isSidebarCollapsed}
        collapsedWidth={78}
        width={230}
        trigger={null}
        className="!sticky !top-0 !h-dvh !bg-white"
      >
        <Sidebar
          collapsed={collapsed}
          responsiveCollapsed={responsiveCollapsed}
        />
      </Sider>

      <Layout className="min-w-0 bg-[#F1F3FC]">
        <AppHeader onToggleSidebar={() => setCollapsed((value) => !value)} />

        <Content className="min-w-0 overflow-x-hidden px-3 pb-10 pt-5 max-[900px]:px-3 max-[900px]:pt-4 max-sm:px-2">
          <div className="grid w-full gap-2">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
