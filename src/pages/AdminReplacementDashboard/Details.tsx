import { useEffect, useState } from 'react'
import { Typography, Tag, Button, message, Spin, Row, Col, Divider, Modal, Input } from 'antd'
import { CheckCircleOutlined, ArrowLeftOutlined, SettingOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { get, patch } from '@/helpers/api_helper'
import { GET_REPLACEMENT_DETAILS, UPDATE_REPLACEMENT_STATUS } from '@/helpers/url_helper'
import dayjs from 'dayjs'
import { ROUTES } from '@/constants/app'

const { Title, Text } = Typography

export default function AdminReplacementDashboardDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionReason, setActionReason] = useState('')
  const [reasonModalVisible, setReasonModalVisible] = useState(false)
  const [actionType, setActionType] = useState<'Reject' | null>(null)

  const fetchRequestDetails = async () => {
    setLoading(true)
    try {
      const res = await get(`${GET_REPLACEMENT_DETAILS}/${id}`)
      if (res.status && res.data) {
        setRequest(res.data)
      } else if (res.data) {
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
    if (!status) return 'default'
    switch (status.toLowerCase()) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'submitted': return 'processing'
      case 'draft': return 'default'
      default: return 'default'
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res = await patch(`${UPDATE_REPLACEMENT_STATUS}/${id}`, { status: 'approved' })
      if (res.status || res.success) {
        message.success('Replacement form approved and ERP request created successfully!')
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

  const submitActionWithReason = async () => {
    if (!actionReason.trim()) {
      return message.warning('Please enter a reason')
    }
    setActionLoading(true)
    try {
      const endpoint = `${UPDATE_REPLACEMENT_STATUS}/${id}`
      const res = await patch(endpoint, { status: 'rejected', reason: actionReason })
      if (res.status || res.success) {
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
        <Button onClick={() => navigate(ROUTES.ADMIN_REPLACEMENT_REQUESTS)}>Go Back</Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', backgroundColor: '#ffffff', maxWidth: '1000px', margin: '0 auto', minHeight: 'calc(100vh - 140px)', borderRadius: '12px' }}>
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.ADMIN_REPLACEMENT_REQUESTS)} style={{ fontSize: '20px', padding: 0 }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>Replacement Form</Title>
            <Text style={{ color: '#6b7280', fontSize: '14px' }}>Form No: {request.form_no}</Text>
          </div>
        </div>
        <Tag color={getStatusColor(request.status)} style={{ fontSize: '14px', padding: '6px 16px', borderRadius: '20px', fontWeight: 600, border: 'none' }}>
          {request.status ? request.status.toUpperCase() : 'DRAFT'}
        </Tag>
      </div>

      {/* Details Area */}
      <Row gutter={[48, 48]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined /> Form Information
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Complaint Number</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.complaint_number || request.complaint_no || request.complaint?.complaint_no}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Client Contact No</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.client_contact_no || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>EPC Name</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.epc_name || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>EPC GST No</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.epc_gst_no || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Created Date</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.created_at ? dayjs(request.created_at).format('DD MMM YYYY') : 'N/A'}</Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined /> Additional Info
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Correct Serial Number</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.correct_serial_number || request.serial_no || request.complaint?.serial_number || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Dispatch Address</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>{request.dispatch_address || 'N/A'}</Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>Pincode</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>
                    {request.pincode || '-'}
                  </Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>City</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>
                    {request.city || '-'}
                  </Text>
                </div>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>State</Text>
                  <Text style={{ color: '#111827', fontSize: '15px', fontWeight: 500 }}>
                    {request.state || '-'}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {request.remarks && request.remarks.includes('Rejection Reason:') && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <Text style={{ color: '#991b1b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Rejection Reason</Text>
            <Text style={{ color: '#b91c1c' }}>{request.remarks.split('Rejection Reason:')[1]}</Text>
          </div>
        </div>
      )}

      {/* Action Buttons */}
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
        {request.status !== 'approved' && request.status !== 'rejected' && (
          <>
            <Button
              danger
              style={{ fontWeight: 600, height: '40px', padding: '0 24px' }}
              icon={<CloseCircleOutlined />}
              onClick={() => { setActionType('Reject'); setActionReason(''); setReasonModalVisible(true); }}
              loading={actionType === 'Reject' && actionLoading}
            >
              Reject
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 600, height: '40px', padding: '0 24px' }}
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              loading={!actionType && actionLoading}
            >
              Approve
            </Button>
          </>
        )}
      </div>

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
    </div>
  )
}
