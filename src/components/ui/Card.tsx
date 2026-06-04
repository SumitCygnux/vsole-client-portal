import { Card as AntCard } from 'antd'
import type { CardProps as AntCardProps } from 'antd'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type CardVariant = 'default' | 'form' | 'stat' | 'chart' | 'table'

type CommonCardProps = Omit<AntCardProps, 'variant'> & {
  cardVariant?: CardVariant
  children: ReactNode
}

type CardSectionProps = ComponentPropsWithoutRef<'div'> & {
  children: ReactNode
}

const cardVariantClasses: Record<CardVariant, string> = {
  chart: '[&_.ant-card-body]:!px-3 [&_.ant-card-body]:!pb-1 [&_.ant-card-body]:!pt-2.5 max-[900px]:[&_.ant-card-body]:!px-2',
  default: '',
  form: '[&_.ant-card-body]:!p-6',
  stat: '[&_.ant-card-body]:!px-6 [&_.ant-card-body]:!py-[18px] max-sm:[&_.ant-card-body]:!px-4',
  table: '[&_.ant-card-body]:!px-6 [&_.ant-card-body]:!py-4 max-[900px]:[&_.ant-card-body]:!px-4 max-sm:[&_.ant-card-body]:!px-3',
}

export function Card({
  children,
  cardVariant = 'default',
  className = '',
  ...props
}: CommonCardProps) {
  return (
    <AntCard
      className={`min-w-0 rounded-lg border-[#E5E7EB] shadow-[0_1px_2px_rgba(20,27,52,0.03)] [&_.ant-card-head-title]:!py-3 [&_.ant-card-head]:!min-h-12 [&_.ant-card-head]:!border-b-[#EEF2F7] ${cardVariantClasses[cardVariant]} ${className}`}
      {...props}
    >
      {children}
    </AntCard>
  )
}

export function CardHeader({ children, className = '', ...props }: CardSectionProps) {
  return (
    <div className={`border-b border-[#EEF2F7] p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }: CardSectionProps) {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>
}

export function CardFooter({ children, className = '', ...props }: CardSectionProps) {
  return (
    <div className={`border-t border-[#EEF2F7] p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
