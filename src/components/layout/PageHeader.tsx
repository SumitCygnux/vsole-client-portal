import { Space, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Text, Title } = Typography

type PageHeaderProps = {
  actions?: ReactNode
  badge?: ReactNode
  description?: ReactNode
  title: ReactNode
}

function PageHeader({ actions, badge, description, title }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 max-sm:gap-3">
      <Space direction="vertical" size={4} className="min-w-0">
        {badge ? <div>{badge}</div> : null}
        <Title className="!m-0 !text-[28px] !font-extrabold !leading-tight !text-[#0F172A] max-sm:!text-[24px]" level={2}>
          {title}
        </Title>
        {description ? (
          <Text className="!max-w-2xl !text-sm !font-medium !text-[#64748B]">
            {description}
          </Text>
        ) : null}
      </Space>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 max-sm:w-full">{actions}</div> : null}
    </div>
  )
}

export default PageHeader
