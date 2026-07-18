import { EditOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { Form, message } from 'antd'
import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { updateProfile } from '@/store/slices/authSlice'

type ProfileFormValues = {
  company?: string
  email: string
  name: string
  phone?: string
}

const getInitialsFromEmail = (email: string) => {
  const username = email.split('@')[0] || email
  return username.slice(0, 2).toUpperCase()
}

function ProfilePage() {
  const [form] = Form.useForm<ProfileFormValues>()
  const [isEditing, setIsEditing] = useState(false)
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const initialValues: ProfileFormValues = {
    company: user?.company ?? 'VSOLE Solar Energy Pvt. Ltd.',
    email: user?.email ?? 'client@vsole.com',
    name: user?.name ?? 'VSOLE Solar Energy Pvt. Ltd.',
    phone: user?.phone ?? '+91 98765 43210',
  }

  const initials = getInitialsFromEmail(initialValues.email)

  const handleFinish = (values: ProfileFormValues) => {
    dispatch(updateProfile(values))
    message.success('Profile updated successfully.')
    setIsEditing(false)
  }

  const handleEdit = () => {
    form.setFieldsValue(initialValues)
    setIsEditing(true)
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage client account details and contact information."
      />

      <div className="grid grid-cols-[minmax(260px,0.38fr)_minmax(0,0.62fr)] gap-4 max-lg:grid-cols-1">
        <Card className="overflow-hidden [&_.ant-card-body]:!p-0">
          <div className="bg-[#EDF4FF] bg-[length:20px_20px] bg-[linear-gradient(#D7E4FF_1px,transparent_1px),linear-gradient(90deg,#D7E4FF_1px,transparent_1px)] px-6 py-8 text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full border-4 border-white bg-[linear-gradient(145deg,#7C8CFF,#7451C8)] text-2xl font-bold text-white shadow-[0_16px_34px_rgba(91,110,245,0.24)]">
              {initials}
            </span>
            <h3 className="mt-4 text-lg font-bold text-[#0F172A]">{initialValues.name}</h3>
            <p className="mt-1 text-sm text-[#64748B]">{initialValues.email}</p>
          </div>

          <div className="grid gap-3 p-5">
            <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3">
              <span className="grid size-9 place-items-center rounded-lg bg-[#ECFDF3] text-[#16A34A]">
                <PhoneOutlined />
              </span>
              <div>
                <span className="block text-xs text-[#64748B]">Phone</span>
                <strong className="text-sm text-[#0F172A]">{initialValues.phone}</strong>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3">
              <span className="grid size-9 place-items-center rounded-lg bg-[#FFFBEB] text-[#D97706]">
                <MailOutlined />
              </span>
              <div>
                <span className="block text-xs text-[#64748B]">Email Status</span>
                <strong className="text-sm text-[#16A34A]">Verified</strong>
              </div>
            </div>
          </div>
        </Card>

        <Card
          cardVariant="form"
          title={
            <span className="text-base font-semibold text-[#0F172A]">
              {isEditing ? 'Update Profile' : 'Profile Details'}
            </span>
          }
        >
          {isEditing ? (
            <Form
              className="grid grid-cols-2 gap-x-4 max-md:grid-cols-1"
              form={form}
              initialValues={initialValues}
              layout="vertical"
              onFinish={handleFinish}
            >
              <InputField
                label="Client Name"
                name="name"
                prefix={<UserOutlined />}
                rules={[{ required: true, message: 'Client name is required' }]}
              />
              <InputField
                label="Company"
                name="company"
                rules={[{ required: true, message: 'Company name is required' }]}
              />
              <InputField
                inputType="email"
                label="Email"
                name="email"
                prefix={<MailOutlined />}
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email address' },
                ]}
              />
              <InputField
                label="Phone"
                name="phone"
                prefix={<PhoneOutlined />}
              />
              <div className="col-span-2 mt-2 flex justify-end gap-2 border-t border-[#E5E7EB] pt-4 max-md:col-span-1 max-sm:flex-col">
                <Button
                  buttonVariant="secondary"
                  onClick={() => {
                    form.resetFields()
                    setIsEditing(false)
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  buttonVariant="secondary"
                  onClick={() => form.resetFields()}
                  type="button"
                >
                  Reset
                </Button>
                <Button htmlType="submit" type="primary">
                  Update Profile
                </Button>
              </div>
            </Form>
          ) : (
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                    Client Name
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                    <UserOutlined className="text-[#5B6EF5]" />
                    {initialValues.name}
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                    Company
                  </span>
                  <div className="mt-2 text-base font-semibold text-[#0F172A]">
                    {initialValues.company}
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                    Email
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                    <MailOutlined className="text-[#5B6EF5]" />
                    {initialValues.email}
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                    Phone
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                    <PhoneOutlined className="text-[#16A34A]" />
                    {initialValues.phone}
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t border-[#E5E7EB] pt-4">
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
                type="button"
              >
                Edit Profile
              </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

export default ProfilePage
