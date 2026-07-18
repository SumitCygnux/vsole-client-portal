import { Button as AntButton } from 'antd'
import type { ButtonProps as AntButtonProps } from 'antd'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

type CommonButtonProps = Omit<AntButtonProps, 'danger' | 'variant'> & {
  buttonVariant?: ButtonVariant
  isLoading?: boolean
}

const variantType: Record<ButtonVariant, AntButtonProps['type']> = {
  primary: 'primary',
  secondary: 'default',
  ghost: 'text',
  danger: 'primary',
}

export function Button({
  children,
  buttonVariant = 'primary',
  className = '',
  isLoading = false,
  loading,
  type,
  ...props
}: CommonButtonProps) {
  return (
    <AntButton
      className={className}
      danger={buttonVariant === 'danger'}
      loading={loading ?? isLoading}
      type={type ?? variantType[buttonVariant]}
      {...props}
    >
      {children}
    </AntButton>
  )
}
