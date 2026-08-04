import { useEffect, useState } from 'react'
import { Typography, Tag, Button, Modal, message, Input, Steps, Spin, Row, Col, Divider } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, PauseCircleOutlined, ArrowLeftOutlined, FileTextOutlined, SyncOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { get, post } from '@/helpers/api_helper'
import dayjs from 'dayjs'
import { ROUTES } from '@/constants/app'
import WarrantyCardPrint from './WarrantyCardPrint'

const { Title, Text } = Typography

export default function AdminWarrantyDashboardDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [reasonModalVisible, setReasonModalVisible] = useState(false)
  const [actionType, setActionType] = useState<'Reject' | 'Hold' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const fetchRequestDetails = async () => {
    setLoading(true)
    try {
      const res = await get(`/admin-warranty/requests/${id}`)
      if (res.status && res.data) {
        setRequest(res.data)
      } else {
        message.error(res.message || 'Failed to fetch request details')
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch request details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchRequestDetails()
  }, [id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success'
      case 'Rejected': return 'error'
      case 'Hold': return 'warning'
      case 'Pending': return 'processing'
      default: return 'default'
    }
  }

  const handleApproveClick = () => {
    setIsGeneratingPDF(true)
  }

  const handleBlobGenerated = async (blob: Blob) => {
    setIsGeneratingPDF(false)
    setActionLoading(true)
    try {
      const formData = new FormData()
      formData.append('warrantyCard', blob, `Warranty_Card_${request?.serial_number || id}.pdf`)

      const res = await post(`/admin-warranty/requests/${id}/approve`, formData)
      if (res.status) {
        message.success('Request approved successfully & email sent')
        fetchRequestDetails()
      } else {
        message.error(res.message || 'Failed to approve request')
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to approve request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleActionWithReason = (type: 'Reject' | 'Hold') => {
    setActionType(type)
    setActionReason('')
    setReasonModalVisible(true)
  }

  const submitActionWithReason = async () => {
    if (!actionReason.trim()) {
      return message.warning('Please enter a reason')
    }
    setActionLoading(true)
    try {
      const endpoint = `/admin-warranty/requests/${id}/${actionType?.toLowerCase()}`
      const res = await post(endpoint, { reason: actionReason })
      if (res.status) {
        message.success(`Request ${actionType?.toLowerCase()}ed successfully`)
        fetchRequestDetails()
        setReasonModalVisible(false)
      } else {
        message.error(res.message || `Failed to ${actionType?.toLowerCase()} request`)
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || `Failed to ${actionType?.toLowerCase()} request`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && !request) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!request) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={4}>Request not found</Title>
        <Button onClick={() => navigate(ROUTES.ADMIN_WARRANTY_REQUESTS)}>Go Back</Button>
      </div>
    )
  }

  const currentStep = request.status === 'Pending' ? 0 : request.status === 'Hold' ? 1 : 2
  const stepStatus = request.status === 'Rejected' ? 'error' : request.status === 'Hold' ? 'wait' : 'process'

  return (
    <div style={{ padding: '32px', backgroundColor: '#ffffff', maxWidth: '1000px', margin: '0 auto', minHeight: 'calc(100vh - 140px)', borderRadius: '12px' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.ADMIN_WARRANTY_REQUESTS)} style={{ fontSize: '20px', padding: 0 }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>Warranty Request</Title>
            <Text style={{ color: '#6b7280', fontSize: '14px' }}>Request ID: {request.serial_number}</Text>
          </div>
        </div>
        <Tag color={getStatusColor(request.status)} style={{ fontSize: '14px', padding: '6px 16px', borderRadius: '20px', fontWeight: 600, border: 'none' }}>
          {request.status.toUpperCase()}
        </Tag>
      </div>

      {/* Steps Area */}
      <div style={{ marginBottom: '48px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
        <Steps
          current={currentStep}
          status={stepStatus as any}
          items={[
            {
              title: 'Submitted',
              description: dayjs(request.created_at).format('DD MMM YYYY'),
              icon: <FileTextOutlined />
            },
            {
              title: 'Review in Progress',
              description: request.status === 'Hold' ? 'On Hold' : 'Processing',
              icon: request.status === 'Hold' ? <PauseCircleOutlined /> : <SyncOutlined spin={currentStep === 1} />
            },
            {
              title: request.status === 'Rejected' ? 'Rejected' : 'Approved',
              icon: request.status === 'Rejected' ? <CloseCircleOutlined /> : <CheckCircleOutlined />
            }
          ]}
        />
      </div>

      {/* Details Area */}
      <Row gutter={[48, 48]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined /> Product Information
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Serial Number</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.serial_number}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Product Name</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.product_name || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Purchase Date</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.purchase_date ? dayjs(request.purchase_date).format('DD MMM YYYY') : 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Registration Date</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.created_at ? dayjs(request.created_at).format('DD MMM YYYY') : 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Dealer Name</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.dealer_name || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Invoice Document</Text>
                  {request.invoice_url ? (
                    <a href={request.invoice_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1677ff', fontWeight: 500 }}>
                      View Invoice
                    </a>
                  ) : <Text style={{ color: '#9ca3af', fontSize: '15px' }}>Not Available</Text>}
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined /> Customer Information
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Customer Name</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.customer_name}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Mobile No</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.mobile_no}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Email</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.email}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Address</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500, lineHeight: 1.5 }}>
                    {[request.address_line_1, request.address_line_2, request.city, request.state, request.pincode].filter(val => val && val !== '-' && val !== 'null').join(', ') || 'N/A'}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {(request.rejection_reason || request.hold_reason) && (
        <div style={{ marginTop: '24px' }}>
          {request.rejection_reason && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <Text style={{ color: '#991b1b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Rejection Reason</Text>
              <Text style={{ color: '#b91c1c' }}>{request.rejection_reason}</Text>
            </div>
          )}
          {request.hold_reason && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fefce8', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
              <Text style={{ color: '#854d0e', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Hold Reason</Text>
              <Text style={{ color: '#a16207' }}>{request.hold_reason}</Text>
            </div>
          )}
        </div>
      )}

      {request.status === 'Pending' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          padding: '16px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end',
          zIndex: 10,
          boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.03)'
        }}>
          <Button danger size="large" icon={<CloseCircleOutlined />} onClick={() => handleActionWithReason('Reject')} style={{ width: '130px', borderRadius: '8px', fontWeight: 500 }}>
            Reject
          </Button>
          <Button size="large" style={{ color: '#d97706', borderColor: '#d97706', width: '130px', borderRadius: '8px', fontWeight: 500 }} icon={<PauseCircleOutlined />} onClick={() => handleActionWithReason('Hold')}>
            Hold
          </Button>
          <Button type="primary" size="large" style={{ background: '#10b981', borderColor: '#10b981', width: '130px', borderRadius: '8px', fontWeight: 500, boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }} icon={<CheckCircleOutlined />} onClick={handleApproveClick} loading={actionLoading || isGeneratingPDF}>
            Approve
          </Button>
        </div>
      )}



      <Modal
        title={`Reason for ${actionType}`}
        open={reasonModalVisible}
        onOk={submitActionWithReason}
        onCancel={() => setReasonModalVisible(false)}
        confirmLoading={actionLoading}
        okText={`Confirm ${actionType}`}
        okButtonProps={{ danger: actionType === 'Reject' }}
        centered
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>Please provide a reason for putting this request on {actionType?.toLowerCase()}:</Text>
        </div>
        <Input.TextArea
          rows={4}
          placeholder="Enter reason..."
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
        />
      </Modal>

      {isGeneratingPDF && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '210mm', height: '0', overflow: 'hidden' }}>
          <WarrantyCardPrint
            id={id}
            onBlobGenerated={handleBlobGenerated}
          />
        </div>
      )}
    </div>
  )
}
