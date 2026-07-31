import { EditOutlined, MailOutlined, PhoneOutlined, UserOutlined, CheckCircleFilled, CameraOutlined } from '@ant-design/icons'
import { Form, message, Tooltip } from 'antd'
import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { updateProfile } from '@/store/slices/authSlice'

type ProfileFormValues = {
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
    <div className="pb-10">
      <PageHeader
        title="Account Profile"
        description="Manage your personal information and preferences securely."
      />

      {/* Modern Profile Header */}
      <div className="relative mb-8 mt-4 rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#283354_0%,#465692_48%,#6E7DE8_100%)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          {/* Action button on top right of cover */}
          <div className="absolute right-4 top-4">
            <Button
              className="!border-white/20 !bg-white/10 !text-white backdrop-blur-md hover:!bg-white/20"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Floating Avatar & Basic Info */}
        <div className="relative flex flex-col items-center px-4 pb-6 pt-0 sm:flex-row sm:px-8 sm:pb-8">
          <div className="-mt-16 relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[linear-gradient(145deg,#283354_0%,#465692_48%,#6E7DE8_100%)] shadow-xl ring-4 ring-white/50 backdrop-blur-sm">
              <span className="text-4xl font-bold tracking-wider text-white">
                {initials}
              </span>
            </div>
            <div className="absolute bottom-1 right-1 grid size-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-slate-800 text-white shadow-md transition-transform hover:scale-110">
              <CameraOutlined className="text-sm" />
            </div>
          </div>

          <div className="mt-4 text-center sm:ml-6 sm:mt-0 sm:text-left sm:pt-4">
            <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 sm:justify-start">
              {initialValues.name}
              <Tooltip title="Verified Account">
                <CheckCircleFilled className="text-xl text-emerald-500" />
              </Tooltip>
            </h1>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Contact Stats */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="rounded-2xl border-none shadow-sm ring-1 ring-slate-100/50 hover:shadow-md transition-shadow">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Contact Overview
            </h3>
            <div className="space-y-4">
              <div className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-indigo-50/50">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <MailOutlined className="text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">Email Address</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{initialValues.email}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-emerald-50/50">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <PhoneOutlined className="text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">Phone Number</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{initialValues.phone}</p>
                </div>
              </div>


            </div>
          </Card>
        </div>

        {/* Right Side: Details / Edit Form */}
        <div className="lg:col-span-2">
          <Card className="h-full rounded-2xl border-none shadow-sm ring-1 ring-slate-100/50">
            <div className="mb-6 border-b border-slate-100 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditing ? 'Update Your Information' : 'Personal Information'}
              </h3>
            </div>

            {isEditing ? (
              <Form
                className="grid grid-cols-1 gap-x-6 sm:grid-cols-2"
                form={form}
                initialValues={initialValues}
                layout="vertical"
                onFinish={handleFinish}
              >
                <InputField
                  label="Full Name"
                  name="name"
                  prefix={<UserOutlined className="text-slate-400" />}
                  rules={[{ required: true, message: 'Full name is required' }]}
                  formItemProps={{ className: 'sm:col-span-2' }}
                />



                <InputField
                  inputType="email"
                  label="Email Address"
                  name="email"
                  prefix={<MailOutlined className="text-slate-400" />}
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Enter a valid email address' },
                  ]}
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  prefix={<PhoneOutlined className="text-slate-400" />}
                />

                <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                  <Button
                    buttonVariant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      form.resetFields()
                      setIsEditing(false)
                    }}
                    htmlType="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full bg-indigo-600 hover:!bg-indigo-700 sm:w-auto"
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Full Name
                  </span>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <UserOutlined className="text-indigo-500" />
                    <span className="font-semibold text-slate-800">{initialValues.name}</span>
                  </div>
                </div>


                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <MailOutlined className="text-indigo-500" />
                    <span className="font-semibold text-slate-800">{initialValues.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Phone Number
                  </span>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <PhoneOutlined className="text-indigo-500" />
                    <span className="font-semibold text-slate-800">{initialValues.phone}</span>
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
