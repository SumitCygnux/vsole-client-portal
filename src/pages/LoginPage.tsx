import { Col, Form, Input, Row, Typography, message, Button } from 'antd'
import { useState, useEffect } from 'react'
import { ReloadOutlined, FormOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, type Location } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { login } from '@/store/slices/authSlice'
import vsoleLogo from '@/assets/image/VsoleLogo.png'
import { post } from '@/helpers/api_helper'
import { SEND_OTP, LOGIN_CUSTOMER } from '@/helpers/url_helper'

const { Link, Text, Title } = Typography

type LoginFormValues = {
  email: string
  captcha: string
  otp?: string
  password?: string
}

function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()


  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'PASSWORD'>('EMAIL')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaNum1, setCaptchaNum1] = useState(0)
  const [captchaNum2, setCaptchaNum2] = useState(0)
  const [form] = Form.useForm<LoginFormValues>()

  useEffect(() => {
    generateCaptcha()
  }, [])

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
            It looks like you're already authenticated as {localStorage.getItem('customerEmail') || 'a customer'}.
          </Text>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              style={{
                padding: '12px 24px', backgroundColor: '#283046', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600
              }}
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(ROUTES.REPLACEMENT)}
              style={{
                padding: '12px 24px', backgroundColor: '#F0F5FF', color: '#0B63CE', border: '1px solid #ADC6FF', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
              }}
            >
              Replacement Form
            </button>
          </div>
        </div>
      </main>
    )
  }

  const handleSendOTP = async () => {
    let values;
    try {
      values = await form.validateFields(['email', 'captcha'])
    } catch (err) {
      // Validation failed, UI will show the errors on the form fields
      return;
    }

    const expectedSum = captchaNum1 + captchaNum2
    if (parseInt(values.captcha) !== expectedSum) {
      message.error('Invalid CAPTCHA! Please try again.')
      generateCaptcha()
      return
    }

    try {
      setIsLoading(true);
      const data = await post(SEND_OTP, { email: values.email.trim(), action: 'login' });
      setIsLoading(false);

      if (data.status) {
        if (data.role === 'admin') {
          message.info('Please enter your admin password.')
          setStep('PASSWORD')
        } else {
          message.success(`OTP sent to ${values.email.trim()}!`)
          setStep('OTP')
        }
      } else {
        message.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      setIsLoading(false);
      const errorData = (error as any).response?.data;
      if (errorData?.isRegistered === false) {
        message.warning('Account not found. Redirecting to Register page...');
        navigate(ROUTES.REGISTER, { state: { email: values.email.trim() } });
      } else {
        message.error(errorData?.message || 'Failed to send OTP. Please try again.');
      }
    }
  }

  const handleLogin = async (values: LoginFormValues) => {
    if (step === 'EMAIL') {
      handleSendOTP()
      return
    }

    if (step === 'OTP' && !values.otp) {
      message.error('Please enter the OTP.')
      return
    }

    if (step === 'PASSWORD' && !values.password) {
      message.error('Please enter your password.')
      return
    }

    try {
      setIsLoading(true);
      const payload: any = { email: values.email };
      if (step === 'OTP') payload.otp = values.otp;
      if (step === 'PASSWORD') payload.password = values.password;

      const data = await post(LOGIN_CUSTOMER, payload);
      setIsLoading(false);

      if (data.status) {
        const name = data.data.full_name || data.data.name || '';
        const role = data.data.role || 'customer';
        const phone = data.data.mobile_no || '';
        dispatch(login({ email: values.email, name, role, phone }));
        localStorage.setItem('customerId', data.data.id);
        localStorage.setItem('customerEmail', data.data.email);
        localStorage.setItem('customerName', name);
        localStorage.setItem('customerRole', role);
        localStorage.setItem('customerPhone', phone);
        if (data.accessToken) {
          localStorage.setItem('authToken', data.accessToken);
        }
        message.success('Login successful!');
        const locationState = location.state as { from?: Location };
        const fromPath = locationState?.from?.pathname + (locationState?.from?.search || '');
        if (role === 'admin') {
          navigate(fromPath && fromPath !== '/' ? fromPath : ROUTES.ADMIN_WARRANTY_REQUESTS, { replace: true });
        } else {
          navigate(fromPath && fromPath !== '/' ? fromPath : ROUTES.DASHBOARD, { replace: true });
        }
      }
    } catch (e) {
      const errorData = (e as any).response?.data;
      if (errorData?.message === 'Account not found') {
        message.info('Account not found. Redirecting to Create Account...');
        navigate(ROUTES.REGISTER, { state: { email: values.email } });
      } else {
        message.error(errorData?.message || 'Login request failed');
      }
    } finally {
      setIsLoading(false);
    }
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
            <div style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '480px',
              padding: '50px 40px',
              borderRadius: '20px',
              boxShadow: '0 20px 48px rgba(20,27,52,0.12)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src={vsoleLogo} alt="VSOLE Solar" style={{ height: '70px', marginBottom: '10px' }} />
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666', letterSpacing: '2px', marginBottom: '20px' }}>
                  CYGNUX SOFTTECH
                </div>
                <Title level={2} style={{ margin: '0 0 10px 0', color: '#1a1f36', fontWeight: 700 }}>
                  Welcome Back
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '15px' }}>
                  {step === 'PASSWORD'
                    ? 'Please enter your admin password.'
                    : 'Please login with your Email & OTP.'}
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email', transform: (value) => value?.trim() },
                    { type: 'email', message: 'Please enter a valid email address', transform: (value) => value?.trim() }
                  ]}
                  normalize={(value) => value?.trim()}
                  style={{ marginBottom: '24px', display: (step === 'OTP' || step === 'PASSWORD') ? 'none' : 'block' }}
                >
                  <Input
                    placeholder="Email Address"
                    disabled={step === 'OTP' || step === 'PASSWORD'}
                    style={{
                      borderRadius: '10px',
                      height: '52px',
                      padding: '0 16px',
                      borderColor: '#e5e7eb',
                      fontSize: '15px'
                    }}
                  />
                </Form.Item>

                {step === 'EMAIL' && (
                  <Row gutter={16} align="middle" style={{ marginBottom: '24px' }}>
                    <Col span={10}>
                      <div style={{
                        height: '52px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        color: '#374151',
                        border: '1px solid #e5e7eb'
                      }}>
                        {captchaNum1} + {captchaNum2} = ?
                      </div>
                    </Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                      <Button
                        type="text"
                        icon={<ReloadOutlined style={{ fontSize: '20px', color: '#6b7280' }} />}
                        onClick={generateCaptcha}
                      />
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        name="captcha"
                        rules={[{ required: true, message: 'Solve CAPTCHA' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder="Answer"
                          style={{
                            borderRadius: '10px',
                            height: '52px',
                            padding: '0 16px',
                            borderColor: '#e5e7eb',
                            fontSize: '15px'
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {step === 'OTP' && (
                  <Form.Item
                    name="otp"
                    rules={[{ required: true, message: 'Please enter the OTP' }]}
                    style={{ marginBottom: '24px' }}
                  >
                    <Input
                      placeholder="Enter 6-digit OTP"
                      style={{
                        borderRadius: '10px',
                        height: '52px',
                        padding: '0 16px',
                        borderColor: '#e5e7eb',
                        fontSize: '15px'
                      }}
                    />
                  </Form.Item>
                )}

                {step === 'PASSWORD' && (
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                    style={{ marginBottom: '24px' }}
                  >
                    <Input.Password
                      placeholder="Enter Password"
                      style={{
                        borderRadius: '10px',
                        height: '52px',
                        padding: '0 16px',
                        borderColor: '#e5e7eb',
                        fontSize: '15px'
                      }}
                    />
                  </Form.Item>
                )}

                <Form.Item style={{ marginBottom: '24px' }}>
                  {step === 'EMAIL' ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
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
                      SUBMIT {isLoading ? '...' : ''}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        height: '52px',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        boxShadow: '0 10px 22px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {step === 'PASSWORD' ? 'LOGIN' : 'VERIFY OTP & LOG IN'} {isLoading ? '...' : ''}
                    </button>
                  )}
                </Form.Item>

                {step === 'OTP' && (
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                      Didn't receive the code? <Link onClick={handleSendOTP} style={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</Link>
                    </Text>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <Text style={{ fontSize: '14px', color: '#6b7280' }}>
                    Don't have an account? <Link href={ROUTES.REGISTER} style={{ color: '#3b82f6', fontWeight: 600 }}>Create Account</Link>
                  </Text>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.REPLACEMENT)}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      backgroundColor: '#F0F5FF',
                      color: '#0B63CE',
                      border: '1px solid #ADC6FF',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FormOutlined /> Product Replacement Request Form
                  </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
                    By continuing, you agree to our <Link style={{ color: '#3b82f6' }}>Conditions</Link> & <Link style={{ color: '#3b82f6' }}>Privacy</Link>.
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

export default LoginPage
