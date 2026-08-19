import { Layout, Avatar, Dropdown, Space, Button as AntButton } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate, Link, Outlet } from 'react-router-dom'
import { LogoutOutlined, UserOutlined, ArrowLeftOutlined, FormOutlined } from '@ant-design/icons'
import vsoleLogo from '@/assets/image/VsoleLogo.png'
import { ROUTES } from '@/constants/app'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logout } from '@/store/slices/authSlice'

const { Header: AntHeader, Content } = Layout

export default function HeaderOnlyLayout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated) || !!localStorage.getItem('authToken')
  const user = useAppSelector((state) => state.auth.user)

  const customerName = localStorage.getItem('customerName') || user?.name || 'Customer'

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('authToken')
    localStorage.removeItem('customerId')
    localStorage.removeItem('customerEmail')
    localStorage.removeItem('customerName')
    localStorage.removeItem('customerRole')
    localStorage.removeItem('customerPhone')
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const profileMenuItems: MenuProps['items'] = [
    {
      icon: <UserOutlined />,
      key: 'dashboard',
      label: 'Dashboard',
      onClick: () => navigate(ROUTES.DASHBOARD),
    },
    {
      danger: true,
      icon: <LogoutOutlined />,
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="min-h-screen bg-[#F1F3FC]">
      <AntHeader className="sticky top-0 z-50 flex !h-[72px] items-center justify-between border-b !border-[#DCE2F1] !bg-white !px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} className="flex items-center gap-3">
            <img src={vsoleLogo} alt="VSOLE Solar" className="h-10 w-auto object-contain" />
          </Link>
          <div className="h-6 w-px bg-gray-300 hidden sm:block" />
          <span className="text-base font-semibold text-gray-800 hidden sm:flex items-center gap-2">
            <FormOutlined style={{ color: '#0B63CE' }} /> Product Replacement Request Form
          </span>
        </div>

        <Space size={12}>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <AntButton
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="hidden sm:inline-flex"
                style={{ borderRadius: '8px' }}
              >
                Back to Dashboard
              </AntButton>
              <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
                <div className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#D8DFF0] bg-white py-1 pl-1 pr-3 hover:border-[#0B63CE]/50">
                  <Avatar className="!bg-[#F6B400] !text-xs !font-bold !text-[#171C2C]">
                    {customerName.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{customerName}</span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <AntButton type="primary" onClick={() => navigate(ROUTES.LOGIN)} style={{ backgroundColor: '#0B63CE', borderRadius: '8px' }}>
              Sign In
            </AntButton>
          )}
        </Space>
      </AntHeader>

      <Content className="p-4 sm:p-6 max-w-[1200px] w-full mx-auto">
        <Outlet />
      </Content>
    </Layout>
  )
}
