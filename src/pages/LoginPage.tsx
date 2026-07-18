import { Checkbox, Col, Form, Row, Space, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { InputField } from '@/components/ui/InputField'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login } from '@/store/slices/authSlice'
import vsoleLogo from '@/assets/image/VsoleLogo.png'

const { Link, Text, Title } = Typography

type LoginFormValues = {
  email: string
  password: string
}

function LoginPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  const handleLogin = (values: LoginFormValues) => {
    dispatch(login({ email: values.email }))
    navigate(from ?? ROUTES.DASHBOARD, { replace: true })
  }

  return (
    <main className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#EEF3FF]">
      <Row className="min-h-screen">
        <Col
          className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_70%_20%,rgba(255,214,102,0.5),transparent_26%),linear-gradient(140deg,rgba(20,27,52,0.94),rgba(91,110,245,0.82))] p-12 text-white after:absolute after:bottom-[-120px] after:right-[-80px] after:size-[360px] after:rounded-full after:bg-white/10 after:content-[''] max-[980px]:min-h-[540px] max-[980px]:gap-5 max-[980px]:p-7 max-sm:min-h-[500px] max-sm:p-5"
          aria-label="VSOLE Solar overview"
          lg={13}
          xs={24}
        >
          <div className="relative z-10 w-fit">
            <img alt="VSOLE Solar" className="h-14 w-auto object-contain max-sm:h-11" src={vsoleLogo} />
          </div>
          <div className="solar-3d-scene relative z-10 grid min-h-[300px] place-items-center max-[980px]:min-h-[230px] max-sm:min-h-[180px]">
            <div className="animate-solar-orbit absolute right-[13%] top-[6%] max-sm:right-[8%]">
              <div className="animate-solar-glow size-[92px] rounded-full bg-[#FACC15] shadow-[0_0_90px_rgba(250,204,21,0.55),0_18px_50px_rgba(250,204,21,0.2)] max-[980px]:size-20 max-sm:size-16" />
            </div>
            <div className="animate-solar-float absolute right-[8%] top-[20%] h-px w-[260px] rotate-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(250,204,21,0.6),transparent)] blur-sm max-sm:w-[190px]" />
            <div className="animate-solar-panel-drift grid w-[min(440px,92%)] grid-cols-6 gap-2.5 [transform-style:preserve-3d] max-[980px]:w-[min(380px,92%)] max-sm:w-[min(300px,96%)] max-sm:gap-[6px]">
              {Array.from({ length: 18 }, (_, index) => (
                <span
                  className="animate-panel-shimmer aspect-[1.5] rounded-md border border-white/20 bg-[linear-gradient(115deg,rgba(255,255,255,0.54),rgba(91,110,245,0.34),rgba(255,255,255,0.32))] shadow-[0_18px_38px_rgba(20,27,52,0.26),inset_0_1px_0_rgba(255,255,255,0.34)]"
                  style={{
                    animationDelay: `${index * 95}ms`,
                    transform: `translateZ(${(index % 6) * 3}px)`,
                  }}
                  key={index}
                />
              ))}
            </div>
          </div>
          <div className="relative z-10 mb-8 max-w-[640px] max-[980px]:mb-1">
            <Text className="mb-3 block text-xs font-extrabold uppercase tracking-normal !text-white">
              Solar Client Portal
            </Text>
            <Title
              className="!mb-4 !mt-0 max-w-[620px] !text-[clamp(34px,4.8vw,52px)] !font-semibold !leading-[1.04] !text-white max-[980px]:!text-[34px] max-sm:!mb-3 max-sm:!text-[28px]"
              level={1}
            >
              Clean energy projects, invoices, and support in one place.
            </Title>
            <Text className="block max-w-[600px] text-sm leading-6 !text-white/90 max-sm:!text-[12px] max-sm:!leading-5">
              Monitor plant performance, track service requests, and review project
              updates through a focused client dashboard.
            </Text>
          </div>
        </Col>

        <Col
          className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_24%_22%,rgba(91,110,245,0.16),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(250,204,21,0.14),transparent_28%),linear-gradient(135deg,#F8FAFF_0%,#EEF3FF_100%)] max-[980px]:min-h-0"
          aria-label="Login form"
          lg={11}
          xs={24}
        >
          <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-8 max-[980px]:min-h-0 max-[980px]:px-6 max-[980px]:py-14 max-sm:p-5">
            <Card
              className="w-[min(100%,460px)] border border-[#D9E2FF] bg-white shadow-[0_18px_48px_rgba(20,27,52,0.12)] [&_.ant-card-body]:!p-9 max-sm:[&_.ant-card-body]:!p-6"
              bordered={false}
            >
              <Space direction="vertical" size={2}>
                <Text className="mb-3 block text-xs font-extrabold uppercase !text-[#4258F5]">
                  Welcome back
                </Text>
                <Title className="!m-0 !text-[30px] !font-bold !leading-10 !text-[#0B1220]" level={2}>
                  Sign In
                </Title>
                <Text className="!text-sm !font-medium !text-[#475569]">
                  Enter your client credentials to continue.
                </Text>
              </Space>

              <Form
                className="mt-2 [&_.ant-checkbox-wrapper]:!text-[#0F172A] [&_.ant-form-item-label>label]:!text-sm [&_.ant-form-item-label>label]:!font-medium [&_.ant-form-item-label>label]:!text-[#0F172A] [&_.ant-form-item-label>label]:before:!text-[#EF4444] [&_.ant-form-item]:!mb-4 [&_.ant-input-affix-wrapper-focused]:!border-[#4258F5] [&_.ant-input-affix-wrapper-focused]:!shadow-[0_0_0_3px_rgba(66,88,245,0.12)] [&_.ant-input-affix-wrapper_.ant-input]:!bg-transparent [&_.ant-input-affix-wrapper]:!h-10 [&_.ant-input-affix-wrapper]:!rounded-lg [&_.ant-input-affix-wrapper]:!border-[#D7E0F0] [&_.ant-input-affix-wrapper]:!bg-[#F1F6FF] [&_.ant-input-affix-wrapper]:!px-3 [&_.ant-input-affix-wrapper]:!py-0 [&_.ant-input-password-icon]:!text-[#64748B] [&_.ant-input-focused]:!border-[#4258F5] [&_.ant-input-focused]:!shadow-[0_0_0_3px_rgba(66,88,245,0.12)] [&_.ant-input::placeholder]:!text-[#94A3B8] [&_.ant-input]:!h-10 [&_.ant-input]:!rounded-lg [&_.ant-input]:!border-[#D7E0F0] [&_.ant-input]:!bg-[#F1F6FF] [&_.ant-input]:!px-3 [&_.ant-input]:!py-0 [&_.ant-input]:!text-[#0F172A] [&_a]:!font-medium [&_a]:!text-[#2457FF]"
                initialValues={{ email: 'client@vsole.com', password: '123456' }}
                layout="vertical"
                onFinish={handleLogin}
              >
                <InputField
                  label="Email"
                  name="email"
                  inputType="email"
                  placeholder="client@company.com"
                  rules={[{ required: true, message: 'Please enter your email' }]}
                />

                <InputField
                  label="Password"
                  name="password"
                  inputType="password"
                  placeholder="Enter password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                />
                <div className="-mt-1 mb-6 flex items-center justify-between gap-4">
                  <Checkbox>Remember me</Checkbox>
                  <Link>Forgot password?</Link>
                </div>

                <Button
                  block
                  className="!h-10 !rounded-lg !border-0 !bg-[#4258F5] !font-semibold !text-white shadow-[0_10px_22px_rgba(66,88,245,0.22)] hover:!bg-[#3348E8]"
                  htmlType="submit"
                  size="large"
                  type="primary"
                >
                  Login
                </Button>
              </Form>
            </Card>
          </div>
        </Col>
      </Row>
    </main>
  )
}

export default LoginPage
