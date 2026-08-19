import { useState } from 'react'
import { Card, Input, Typography, message, Descriptions, Tag, Spin, Button } from 'antd'
import { get } from '@/helpers/api_helper'
import dayjs from 'dayjs'
import { SearchOutlined, SafetyCertificateOutlined, CloseCircleOutlined, BarcodeOutlined, AppstoreOutlined, CalendarOutlined, ClockCircleOutlined, ShopOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function WarrantyStatusPage() {
  const [serialNumber, setSerialNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [warrantyDetails, setWarrantyDetails] = useState<any>(null)
  const [searched, setSearched] = useState(false)

  const handleCheckStatus = async () => {
    if (!serialNumber.trim()) {
      return message.warning('Please enter a valid serial number.')
    }

    setLoading(true)
    setSearched(true)
    setWarrantyDetails(null)

    try {
      const res = await get(`/customer-product/warranty/${serialNumber.trim()}`)
      if (res.status && res.data) {
        setWarrantyDetails(res.data)
        message.success('Warranty details found!')
      } else {
        message.error(res.message || 'Product not found.')
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        message.error('No warranty details found for this serial number.')
      } else {
        message.error(error.response?.data?.message || 'Failed to check warranty status.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getWarrantyStatus = () => {
    if (!warrantyDetails?.warranty_end_date) return null
    const isExpired = dayjs().isAfter(dayjs(warrantyDetails.warranty_end_date))

    if (isExpired) {
      return (
        <Tag color="error" icon={<CloseCircleOutlined />} style={{ padding: '6px 12px', fontSize: '14px' }}>
          Expired
        </Tag>
      )
    }
    return (
      <Tag color="success" icon={<SafetyCertificateOutlined />} style={{ padding: '6px 12px', fontSize: '14px' }}>
        Active Warranty
      </Tag>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        Check Warranty Status
      </Title>

      <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Input
              size="large"
              placeholder="Enter product serial number (e.g., DUMMY12345)"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              onPressEnter={handleCheckStatus}
              style={{ borderRadius: '8px', width: '100%' }}
            />
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleCheckStatus}
            loading={loading}
            style={{ borderRadius: '8px', fontWeight: 'bold', minWidth: '140px', flex: '0 0 auto' }}
          >
            Check Status
          </Button>
        </div>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#888' }}>Checking warranty database...</p>
        </div>
      )}

      {!loading && searched && warrantyDetails && (
        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={4} style={{ margin: 0 }}>Product Warranty Details</Title>
            {getWarrantyStatus()}
          </div>

          <Descriptions bordered layout="vertical" column={{ xxl: 4, xl: 4, lg: 3, md: 2, sm: 1, xs: 1 }} labelStyle={{ fontWeight: 'bold', background: '#fafafa' }} contentStyle={{ background: '#fff', fontSize: '15px' }}>
            <Descriptions.Item label={<span><BarcodeOutlined /> Serial Number</span>}>
              <Text strong>{warrantyDetails.serial_number}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<span><AppstoreOutlined /> Product Name</span>}>
              {warrantyDetails.product_name ? warrantyDetails.product_name.replace(/\s*\([^)]*\)\s*$/, '') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<span><CalendarOutlined /> Purchase Date</span>}>
              {warrantyDetails.purchase_date ? dayjs(warrantyDetails.purchase_date).format('DD MMM YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<span><ClockCircleOutlined /> Warranty Period</span>}>
              {warrantyDetails.warranty_period_months ? `${warrantyDetails.warranty_period_months} Months` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<span><CalendarOutlined /> Warranty Start</span>}>
              {warrantyDetails.warranty_start_date ? dayjs(warrantyDetails.warranty_start_date).format('DD MMM YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<span><CalendarOutlined /> Warranty End</span>}>
              {warrantyDetails.warranty_end_date ? (
                <Text strong type={dayjs().isAfter(dayjs(warrantyDetails.warranty_end_date)) ? 'danger' : 'success'}>
                  {dayjs(warrantyDetails.warranty_end_date).format('DD MMM YYYY')}
                </Text>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<span><ShopOutlined /> Dealer Name</span>}>
              {warrantyDetails.dealer_name || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {!loading && searched && !warrantyDetails && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <SearchOutlined style={{ fontSize: '48px', color: '#e0e0e0', marginBottom: '16px' }} />
          <p>No warranty information found. Please check your serial number and try again.</p>
        </div>
      )}
    </div>
  )
}
