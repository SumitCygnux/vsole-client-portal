import { useEffect, useState } from 'react'
import { Card, Table, Tag, message } from 'antd'
import { get } from '@/helpers/api_helper'
import { GET_REPLACEMENT_DETAILS } from '@/helpers/url_helper'
import dayjs from 'dayjs'
import PageHeader from '@/components/layout/PageHeader'


export default function MyReplacementRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  const fetchRequests = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true)
    try {
      const res = await get(GET_REPLACEMENT_DETAILS, { params: { limit, page } })
      if (res.status && res.data) {
        setRequests(res.data)
        if (res.pagination) {
          setPagination(prev => ({ ...prev, total: res.pagination.totalRecords }))
        }
      } else if (res.data) {
        setRequests(res.data)
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

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Form No',
      dataIndex: 'form_no',
      key: 'form_no',
    },
    {
      title: 'Complaint No',
      dataIndex: 'complaint_number',
      key: 'complaint_number',
    },
    {
      title: 'Serial No',
      dataIndex: 'serial_no',
      key: 'serial_no',
    },
    {
      title: 'Type',
      dataIndex: 'type_of_form',
      key: 'type_of_form',
      render: (type: string) => <span className="capitalize">{type || 'N/A'}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status ? status.toUpperCase() : 'DRAFT'}</Tag>
      ),
    }
  ]

  return (
    <div className="w-full flex-col items-center min-h-screen relative p-6">
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <div className="mb-6">
          <PageHeader
            title="My Replacement Requests"
            description="Track the status of all your replacement and repair forms."
          />
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
    </div>
  )
}
