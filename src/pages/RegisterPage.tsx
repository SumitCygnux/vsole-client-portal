import { Col, Form, Input, Row, Typography, message, Button, Select } from 'antd'
import { useState, useEffect } from 'react'
import { ReloadOutlined } from '@ant-design/icons'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login } from '@/store/slices/authSlice'
import vsoleLogo from '@/assets/image/VsoleLogo.png'
import { post, get } from '../helpers/api_helper'
import { SEND_OTP, REGISTER_CUSTOMER, GET_PIN_DROPDOWN } from '../helpers/url_helper'
const { Text, Title } = Typography

type RegisterFormValues = {
  full_name: string
  email: string
  captcha: string
  otp: string
  mobile_no: string
  address_line_1: string
  address_line_2?: string
  pincode: string
  city: string
  state: string
}

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const defaultEmail = location.state?.email || ''

  const [form] = Form.useForm<RegisterFormValues>()
  const [captchaNum1, setCaptchaNum1] = useState(0)
  const [captchaNum2, setCaptchaNum2] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pincodes, setPincodes] = useState<any[]>([])

  useEffect(() => {
    generateCaptcha()
    fetchPincodes()
  }, [])

  const fetchPincodes = async () => {
    try {
      const res = await get(GET_PIN_DROPDOWN)
      if (res.status) setPincodes(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const generateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1)
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1)
    form.setFieldsValue({ captcha: '' })
  }

  if (localStorage.getItem('authToken')) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EEF3FF]">
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <Title level={3}>You are already logged in!</Title>
          <Text style={{ display: 'block', marginBottom: '20px', color: '#6b7280' }}>
            It looks like you're already authenticated as {localStorage.getItem('customerEmail')}.
          </Text>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            style={{
              padding: '12px 24px', backgroundColor: '#283046', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    )
  }

  const handleSendOTP = async () => {
    try {
      const values = await form.validateFields(['email', 'captcha'])
      const expectedSum = captchaNum1 + captchaNum2
      if (parseInt(values.captcha) !== expectedSum) {
        message.error('Invalid CAPTCHA! Please try again.')
        generateCaptcha()
        return
      }

      setIsLoading(true);
      // Connect to backend API to send OTP
      const data = await post(SEND_OTP, { email: values.email, action: 'register' });
      setIsLoading(false);

      if (data.status) {
        message.success(`OTP sent to ${values.email}!`)
        setOtpSent(true)
      } else {
        message.error(data.message || 'Failed to send OTP')
      }
    } catch (e) {
      setIsLoading(false);
      const errorData = (e as any).response?.data;
      if (errorData && errorData.message) {
        message.error(errorData.message);
      } else {
        message.error('Failed to send OTP. Please try again.');
      }
    }
  }

  const handleRegister = async (values: RegisterFormValues) => {
    if (!otpSent) {
      message.error('Please verify your email with an OTP first.')
      return
    }

    if (!values.otp) {
      message.error('Please enter the OTP.')
      return
    }

    try {
      setIsLoading(true);
      // Connect to real backend API
      const payload = { ...values }

      const data = await post(REGISTER_CUSTOMER, payload);

      if (data.status) {
        // Log user in dynamically and send to Dashboard
        const name = values.full_name || 'John Doe';
        dispatch(login({ email: values.email, name }));
        localStorage.setItem('customerId', data.data?.id || 'temp-id');
        localStorage.setItem('customerEmail', values.email);
        localStorage.setItem('customerName', name);
        if (data.accessToken) {
          localStorage.setItem('authToken', data.accessToken);
        }
        message.success('Account Created Successfully!');
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        message.error(data.message || 'Registration failed');
      }
    } catch (e) {
      const errorData = (e as any).response?.data;
      message.error(errorData?.message || 'Registration request failed');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <main className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#EEF3FF]">
      <Row className="min-h-screen">
        <Col
          className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_70%_20%,rgba(255,214,102,0.5),transparent_26%),linear-gradient(140deg,rgba(20,27,52,0.94),rgba(91,110,245,0.82))] p-12 text-white after:absolute after:bottom-[-120px] after:right-[-80px] after:size-[360px] after:rounded-full after:bg-white/10 after:content-[''] max-[980px]:min-h-[540px] max-[980px]:gap-5 max-[980px]:p-7 max-sm:min-h-[500px] max-sm:p-5"
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
              Start your clean energy journey today.
            </Title>
            <Text className="block max-w-[600px] text-sm leading-6 !text-white/90 max-sm:!text-[12px] max-sm:!leading-5">
              Create an account to monitor plant performance, track service requests, and review project updates.
            </Text>
          </div>
        </Col>

        <Col
          className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_24%_22%,rgba(91,110,245,0.16),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(250,204,21,0.14),transparent_28%),linear-gradient(135deg,#F8FAFF_0%,#EEF3FF_100%)] max-[980px]:min-h-0"
          lg={11}
          xs={24}
        >
          <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-8 max-[980px]:min-h-0 max-[980px]:px-6 max-[980px]:py-14 max-sm:p-5">
            <div style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '520px',
              padding: '40px',
              borderRadius: '20px',
              boxShadow: '0 20px 48px rgba(20,27,52,0.12)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src={vsoleLogo} alt="VSOLE Solar" style={{ height: '60px', marginBottom: '10px' }} />
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666', letterSpacing: '2px', marginBottom: '20px' }}>
                  CYGNUX SOFTTECH
                </div>
                <Title level={2} style={{ margin: '0 0 10px 0', color: '#1a1f36', fontWeight: 700 }}>
                  Create Account
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Please verify your email and fill in your details.
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                size="large"
                initialValues={{ email: defaultEmail }}
              >
                <Form.Item
                  name="full_name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    placeholder="Full Name"
                    style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}
                  style={{ marginBottom: '20px', display: otpSent ? 'none' : 'block' }}
                >
                  <Input
                    placeholder="Email Address"
                    disabled={otpSent}
                    style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px' }}
                  />
                </Form.Item>

                {!otpSent && (
                  <Row gutter={16} align="middle" style={{ marginBottom: '20px' }}>
                    <Col span={8}>
                      <div style={{
                        height: '48px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        color: '#374151',
                        border: '1px solid #e5e7eb'
                      }}>
                        {captchaNum1} + {captchaNum2} = ?
                      </div>
                    </Col>
                    <Col span={3} style={{ textAlign: 'center' }}>
                      <Button
                        type="text"
                        icon={<ReloadOutlined style={{ fontSize: '18px', color: '#6b7280' }} />}
                        onClick={generateCaptcha}
                      />
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="captcha"
                        rules={[{ required: true, message: 'Solve CAPTCHA' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Ans"
                          style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        style={{
                          width: '100%', height: '48px', backgroundColor: '#3b82f6', color: '#ffffff',
                          border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        SEND OTP {isLoading ? '...' : ''}
                      </button>
                    </Col>
                  </Row>
                )}

                {otpSent && (
                  <Form.Item
                    name="otp"
                    rules={[{ required: true, message: 'Please enter the OTP' }]}
                    style={{ marginBottom: '20px' }}
                  >
                    <Input
                      placeholder="Enter Email OTP (e.g. 123456)"
                      autoComplete="one-time-code"
                      style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px', letterSpacing: '3px', textAlign: 'center' }}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="mobile_no"
                  rules={[{ required: true, message: 'Please enter your mobile number' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    placeholder="Mobile Number"
                    style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="address_line_1"
                  rules={[{ required: true, message: 'Please enter Address Line 1' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    placeholder="Address Line 1"
                    style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="address_line_2"
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    placeholder="Address Line 2 (Optional)"
                    style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px' }}
                  />
                </Form.Item>

                <Row gutter={16} style={{ marginBottom: '20px' }}>
                  <Col span={8}>
                    <Form.Item
                      name="pincode"
                      rules={[{ required: true, message: 'Pincode' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder="Pincode"
                        showSearch
                        optionFilterProp="children"
                        style={{ height: '48px' }}
                        onChange={(val) => {
                          const p = pincodes.find(pin => (pin.pinCode || pin.pin_name) === val);
                          if (p) {
                            form.setFieldsValue({
                              city: p.city_id?.name || p.city_id?.city_name || '',
                              state: p.state_id?.name || p.state_id?.state_name || ''
                            });
                          }
                        }}
                      >
                        {pincodes.map(p => <Select.Option key={p.id} value={p.pinCode || p.pin_name}>{p.pinCode || p.pin_name}</Select.Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="city"
                      rules={[{ required: true, message: 'City' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="City"
                        readOnly
                        style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px', backgroundColor: '#f9fafb' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="state"
                      rules={[{ required: true, message: 'State' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        placeholder="State"
                        readOnly
                        style={{ borderRadius: '10px', height: '48px', padding: '0 16px', borderColor: '#e5e7eb', fontSize: '15px', backgroundColor: '#f9fafb' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginBottom: '24px' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      height: '52px',
                      backgroundColor: '#283046',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      letterSpacing: '0.5px',
                      boxShadow: '0 10px 22px rgba(40, 48, 70, 0.22)'
                    }}
                  >
                    CREATE ACCOUNT {isLoading ? '...' : ''}
                  </button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                    Already have an account? <RouterLink to={ROUTES.LOGIN} style={{ color: '#3b82f6', fontWeight: 600 }}>Login here</RouterLink>
                  </Text>
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </main>
  )
}

export default RegisterPage
