import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, message, Space, Tag, Input, Button } from 'antd'
import { get } from '@/helpers/api_helper'
import dayjs from 'dayjs'
import { SearchOutlined, CheckCircleOutlined, SyncOutlined, PauseCircleOutlined, CloseCircleOutlined, FormOutlined, FilePdfOutlined } from '@ant-design/icons'
import { GET_COMPLAINTS } from '@/helpers/url_helper'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const MyProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [eligibleComplaints, setEligibleComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const customerId = localStorage.getItem('customerId')
      if (!customerId) return

      setLoading(true)
      const res = await get(`/customer-product?customerId=${customerId}`)
      if (res.status) {
        setProducts(res.data || [])
      } else {
        message.error(res.message || 'Failed to fetch products')
      }

      // Fetch complaints that require replacement
      try {
        const compRes = await get(`${GET_COMPLAINTS}?customer_id=${customerId}&review_status=replacement,replacement_test,repair&limit=100`)
        if (compRes.status && compRes.data) {
          setEligibleComplaints(compRes.data)
        }
      } catch (e) {
        console.error('Failed to fetch eligible complaints', e)
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Registration Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => (
        <Space>
          {dayjs(text).format('DD MMM YYYY')}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'processing';
        let icon = <SyncOutlined spin />;
        let text = 'Pending Warranty';

        if (status === 'Approved') {
          color = 'success';
          icon = <CheckCircleOutlined />;
          text = 'Active Warranty';
        } else if (status === 'Hold') {
          color = 'warning';
          icon = <PauseCircleOutlined />;
          text = 'On Hold';
        } else if (status === 'Rejected') {
          color = 'error';
          icon = <CloseCircleOutlined />;
          text = 'Rejected';
        }

        return (
          <Tag color={color} icon={icon} style={{ borderRadius: '20px', padding: '4px 12px', fontWeight: 600, border: 'none' }}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => {
        const replacementComplaint = eligibleComplaints.find(c => c.serial_number === record.serial_number || c.product_id === record.id)
        return (
          <Space>
            {record.status === 'Approved' && (
              <Button
                type="default"
                icon={<FilePdfOutlined />}
                onClick={() => navigate(`/warranty-card/${record.id}/print?autoDownload=true`)}
                style={{ borderRadius: '8px', color: '#10b981', borderColor: '#10b981' }}
              >
                Download Warranty Card
              </Button>
            )}
            {replacementComplaint && (
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => navigate(`/replacement?complaint_no=${replacementComplaint.complaint_no}`)}
                style={{ backgroundColor: '#0B63CE', borderRadius: '8px' }}
              >
                Replacement Form
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  const filteredProducts = products.filter(p =>
    p.serial_number?.toLowerCase().includes(searchText.toLowerCase()) ||
    p.product_name?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={<Title level={3} style={{ margin: 0 }}>My Registered Products</Title>}
        bordered={false}
        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by serial number or product name..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', maxWidth: 300, borderRadius: '8px' }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

    </div>
  )
}

export default MyProductsPage
