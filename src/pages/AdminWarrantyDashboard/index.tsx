import { useEffect, useState } from 'react'
import { Card, Typography, Table, Tag, Button, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { get } from '@/helpers/api_helper'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import dayjs from 'dayjs'

const { Title } = Typography

export default function AdminWarrantyDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const navigate = useNavigate()

  const fetchRequests = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true)
    try {
      const res = await get('/admin-warranty/requests', { params: { page, limit } })
      if (res.status && res.data) {
        setRequests(res.data)
        if (res.pagination) {
          setPagination(prev => ({ ...prev, total: res.pagination.totalRecords }))
        }
      } else {
        message.error(res.message || 'Failed to fetch requests')
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit])

  const handleView = (record: any) => {
    navigate(ROUTES.ADMIN_WARRANTY_REQUEST_DETAILS.replace(':id', record.id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success'
      case 'Rejected': return 'error'
      case 'Hold': return 'warning'
      case 'Pending': return 'processing'
      default: return 'default'
    }
  }



  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Phone',
      dataIndex: 'mobile_no',
      key: 'mobile_no',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleView(record)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Warranty Requests Dashboard</Title>
      </div>

      <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, page, limit: pageSize })
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>


    </div>
  )
}
