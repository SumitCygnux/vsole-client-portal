import { Avatar, Dropdown, Layout, message, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  BellOutlined,
  DownOutlined,
  FullscreenOutlined,
  KeyOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import vsoleLogo from '@/assets/image/VsoleLogo.png'
import { ROUTES } from '@/constants/app'
import { Button } from '@/components/ui/Button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logout } from '@/store/slices/authSlice'

const { Header: AntHeader } = Layout

type AppHeaderProps = {
  onToggleSidebar: () => void
}

const getInitialsFromText = (text: string) => {
  const parts = text.split(/[._-\s]+/).filter(Boolean)

  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }

  return text.slice(0, 2).toUpperCase()
}

function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const user = useAppSelector((state) => state.auth.user)

  const userName = user?.name ?? 'VSOLE Solar Energy Pvt. Ltd.'
  const userEmail = user?.email ?? 'vsole@yopmail.com'
  const avatarText = getInitialsFromText(userName)

  const profileMenuItems: MenuProps['items'] = [
    {
      icon: <UserOutlined />,
      key: 'profile',
      label: 'Profile',
    },
    {
      icon: <KeyOutlined />,
      key: 'change-password',
      label: 'Change Password',
    },
    {
      danger: true,
      icon: <LogoutOutlined />,
      key: 'logout',
      label: 'Logout',
    },
  ]

  const handleProfileMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      dispatch(logout())
      localStorage.removeItem('authToken')
      localStorage.removeItem('customerId')
      localStorage.removeItem('customerEmail')
      localStorage.removeItem('customerName')
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    if (key === 'change-password') {
      message.info('Change password will be added here.')
      return
    }

    navigate(ROUTES.PROFILE)
  }

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      await document.documentElement.requestFullscreen()
    } catch {
      message.error('Fullscreen mode is not available.')
    }
  }

  return (
    <AntHeader className="sticky top-0 z-20 flex !h-[72px] items-center justify-between gap-4 border-b !border-[#DCE2F1] !bg-white !px-[25px] py-0 !leading-normal shadow-[0_8px_24px_rgba(15,23,42,0.04)] max-[900px]:!px-4 max-sm:!h-16 max-sm:!gap-2 max-sm:!px-3">
      <div className="flex min-w-0 flex-1 items-center gap-4 max-sm:gap-2">
        <button
          aria-label="Toggle menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-[#4B5563] transition hover:bg-[#F1F5FB] hover:text-[#0B63CE] max-sm:h-8 max-sm:w-8"
          onClick={onToggleSidebar}
          type="button"
        >
          <MenuOutlined className="text-[17px]" />
        </button>

        <img
          alt="VSOLE Solar"
          className="hidden h-auto w-[92px] object-contain max-[900px]:block max-sm:w-[82px]"
          src={vsoleLogo}
        />

      </div>

      <Space size={8} className="shrink-0">
        <button
          aria-label="Fullscreen"
          className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-[#4B5563] transition hover:bg-[#F1F5FB] hover:text-[#0B63CE] max-sm:hidden"
          onClick={handleToggleFullscreen}
          type="button"
        >
          <FullscreenOutlined className="text-[18px]" />
        </button>

        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4B5563] transition hover:bg-[#F1F5FB] hover:text-[#0B63CE] max-sm:h-8 max-sm:w-8">
          <Button
            buttonVariant="ghost"
            className="!h-9 !w-9 !p-0 !text-[#4B5563] hover:!bg-transparent hover:!text-[#0B63CE] max-sm:!h-8 max-sm:!w-8"
            icon={<BellOutlined className="text-[17px]" />}
            shape="circle"
          />
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#EF4444]" />
        </span>

        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4B5563] transition hover:bg-[#F1F5FB] hover:text-[#0B63CE] max-sm:h-8 max-sm:w-8">
          <MailOutlined className="text-[18px]" />
          <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F6B400] px-1 text-[10px] font-bold leading-none text-white">
            6
          </span>
        </span>

        <Dropdown
          align={{ offset: [0, 12] }}
          dropdownRender={(menu) => (
            <div className="w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-[14px] border border-[#ECEFF5] bg-white shadow-[0_22px_50px_rgba(23,28,44,0.18)] [&_.ant-menu-item-danger_.anticon]:!text-[#FF3B30] [&_.ant-menu-item-danger]:!text-[#FF3B30] [&_.ant-menu-item_.anticon]:!text-[15px] [&_.ant-menu-item_.anticon]:!text-[#171C2C] [&_.ant-menu-item]:!mx-1 [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-9 [&_.ant-menu-item]:!rounded-lg [&_.ant-menu-item]:!px-4 [&_.ant-menu-item]:!text-sm [&_.ant-menu-item]:!text-[#263042] [&_.ant-menu-item:hover]:!bg-[#F3F4F6] [&_.ant-menu]:!border-0 [&_.ant-menu]:!px-1 [&_.ant-menu]:!pb-2 [&_.ant-menu]:!pt-1 [&_.ant-menu]:!shadow-none">
              <div className="bg-[#F6F7FB] px-5 pb-5 pt-6 text-center">
                <span className="relative mb-3 inline-flex">
                  <Avatar className="!h-[54px] !w-[54px] !border-[3px] !border-white !bg-[#171C2C] !text-sm !font-bold !text-white shadow-[0_8px_18px_rgba(23,28,44,0.22)] [&_.ant-avatar-string]:!text-white">
                    {avatarText}
                  </Avatar>
                  <span className="absolute bottom-1 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#22C55E]" />
                </span>

                <strong className="block max-w-[250px] truncate text-sm font-bold text-[#1F2937]">
                  {userName}
                </strong>

                <span className="mt-1 block truncate text-xs text-[#6B7280]">
                  {userEmail}
                </span>
              </div>

              {menu}
            </div>
          )}
          getPopupContainer={() => document.body}
          menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#D8DFF0] bg-white py-1 pl-1 pr-3 transition hover:border-[#0B63CE]/50 hover:bg-[#F8FAFF] max-sm:h-9 max-sm:gap-1.5 max-sm:pr-2">
            <Avatar className="!h-8 !w-8 !bg-[#F6B400] !text-[12px] !font-bold !text-[#171C2C] shadow-[0_4px_12px_rgba(246,180,0,0.24)] max-sm:!h-7 max-sm:!w-7 max-sm:!text-[11px] [&_.ant-avatar-string]:!text-[#171C2C]">
              {avatarText}
            </Avatar>

            <DownOutlined className="text-[10px] !text-[#6B7280]" />
          </div>
        </Dropdown>

        <button
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-[#4B5563] transition hover:bg-[#F1F5FB] hover:text-[#0B63CE] max-sm:hidden"
          type="button"
        >
          <SettingOutlined className="text-[18px]" />
        </button>
      </Space>
    </AntHeader>
  )
}

export default AppHeader
