import { Form, Input } from 'antd'
import type { FormItemProps, InputProps } from 'antd'
import type { PasswordProps } from 'antd/es/input'

type InputFieldType = 'email' | 'password' | 'text'

type InputFieldProps = Omit<InputProps, 'type'> & {
  formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>
  inputType?: InputFieldType
  label?: FormItemProps['label']
  name: FormItemProps['name']
  passwordProps?: PasswordProps
  rules?: FormItemProps['rules']
}

export function InputField({
  formItemProps,
  inputType = 'text',
  label,
  name,
  passwordProps,
  rules,
  size = 'large',
  ...inputProps
}: InputFieldProps) {
  return (
    <Form.Item label={label} name={name} rules={rules} {...formItemProps}>
      {inputType === 'password' ? (
        <Input.Password size={size} {...passwordProps} {...inputProps} />
      ) : (
        <Input size={size} type={inputType} {...inputProps} />
      )}
    </Form.Item>
  )
}
