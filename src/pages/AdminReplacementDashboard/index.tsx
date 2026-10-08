import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, Typography, Table, Button, message, Input, Select, Tooltip, Empty } from 'antd'
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClearOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { get } from '@/helpers/api_helper'
import { GET_REPLACEMENT_DETAILS } from '@/helpers/url_helper'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function AdminReplacementDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const navigate = useNavigate()

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 350)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Helper to extract Serial Number reliably
  const getSerialNumber = useCallback((record: any): string => {
    const sn =
      record.serial_no ||
      record.correct_serial_number ||
      record.complaint?.serial_number ||
      record.complaint?.serialNo ||
      record.serial_number ||
      record.complaint_serial_no ||
      ''
    return typeof sn === 'string' ? sn.trim() : String(sn || '')
  }, [])

  // Helper to extract State reliably
  const getStateName = useCallback((record: any): string => {
    let s = ''
    if (typeof record.state === 'string') {
      s = record.state
    } else if (record.state && typeof record.state === 'object') {
      s = record.state.name || record.state.state_name || ''
    }

    if (!s) {
      s =
        record.state_name ||
        record.pincode_rel?.state_id?.name ||
        record.pincode_rel?.state_name ||
        record.pincode?.state_name ||
        record.complaint?.state ||
        record.complaint?.state_name ||
        ''
    }
    return typeof s === 'string' ? s.trim() : ''
  }, [])

  const fetchRequests = async (
    page = pagination.page,
    limit = pagination.limit,
    search = debouncedSearch,
    status = statusFilter
  ) => {
    setLoading(true)
    try {
      const params: any = { limit, page }
      if (search) params.search = search
      if (status && status !== 'ALL') params.status = status

      const res = await get(GET_REPLACEMENT_DETAILS, { params })
      if (res.status && res.data) {
        setRequests(res.data)
        if (res.pagination) {
          setPagination(prev => ({ ...prev, total: res.pagination.totalRecords, page, limit }))
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

  // Trigger fetch when pagination, debouncedSearch or statusFilter changes
  useEffect(() => {
    fetchRequests(pagination.page, pagination.limit, debouncedSearch, statusFilter)
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter])

  const handleView = (record: any) => {
    navigate(ROUTES.ADMIN_REPLACEMENT_REQUEST_DETAILS.replace(':id', record.id))
  }

  // Client-side filtering ensures instant reactivity on search & status
  const filteredRequests = useMemo(() => {
    return requests.filter(record => {
      // 1. Search Query filter (matches Form No, Complaint No, Serial No, Customer Name, State, City, Created By)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        const formNo = (record.form_no || '').toLowerCase()
        const compNo = (record.complaint_number || record.complaint_no || '').toLowerCase()
        const sn = getSerialNumber(record).toLowerCase()
        const custName = (record.customer_name || '').toLowerCase()
        const stateName = getStateName(record).toLowerCase()
        const cityName = (record.city || '').toLowerCase()
        const createdBy = (record.created_by_name || '').toLowerCase()

        const matchesSearch =
          formNo.includes(q) ||
          compNo.includes(q) ||
          sn.includes(q) ||
          custName.includes(q) ||
          stateName.includes(q) ||
          cityName.includes(q) ||
          createdBy.includes(q)

        if (!matchesSearch) return false
      }

      // 2. Status filter
      if (statusFilter !== 'ALL') {
        const currentStatus = (record.status || 'draft').toLowerCase()
        if (currentStatus !== statusFilter.toLowerCase()) return false
      }

      return true
    })
  }, [requests, debouncedSearch, statusFilter, getSerialNumber, getStateName])

  // Count summaries for metrics chips
  const metrics = useMemo(() => {
    let submitted = 0
    let approved = 0
    let rejected = 0
    let other = 0

    requests.forEach(r => {
      const st = (r.status || '').toLowerCase()
      if (st === 'submitted') submitted++
      else if (st === 'approved') approved++
      else if (st === 'rejected') rejected++
      else other++
    })

    return {
      total: requests.length,
      submitted,
      approved,
      rejected,
      other,
    }
  }, [requests])

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL'

  const resetFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setStatusFilter('ALL')
  }

  // Render Status Badge
  const renderStatus = (status: string) => {
    const s = (status || 'draft').toLowerCase()
    let bg = '#f3f4f6'
    let color = '#4b5563'
    let border = '#e5e7eb'
    let dotColor = '#9ca3af'

    if (s === 'approved') {
      bg = '#ecfdf5'
      color = '#059669'
      border = '#a7f3d0'
      dotColor = '#10b981'
    } else if (s === 'submitted') {
      bg = '#eff6ff'
      color = '#2563eb'
      border = '#bfdbfe'
      dotColor = '#3b82f6'
    } else if (s === 'rejected') {
      bg = '#fef2f2'
      color = '#dc2626'
      border = '#fecaca'
      dotColor = '#ef4444'
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '11.5px',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
          }}
        />
        {status ? status.toUpperCase() : 'DRAFT'}
      </span>
    )
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <span style={{ color: '#475569', fontSize: '13px', whiteSpace: 'nowrap' }}>
          {date ? dayjs(date).format('DD MMM YYYY') : '—'}
        </span>
      ),
    },
    {
      title: 'Form No',
      dataIndex: 'form_no',
      key: 'form_no',
      width: 160,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap' }}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'Complaint No',
      dataIndex: 'complaint_number',
      key: 'complaint_number',
      width: 165,
      render: (text: string) => (
        <span style={{ color: '#0284c7', fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap' }}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'Serial Number',
      key: 'serial_no',
      width: 140,
      render: (_: any, record: any) => {
        const sn = getSerialNumber(record)
        if (!sn || sn === '-') {
          return <span style={{ color: '#94a3b8' }}>—</span>
        }
        return (
          <span
            style={{
              fontWeight: 600,
              color: '#1e293b',
              backgroundColor: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {sn}
          </span>
        )
      },
    },
    {
      title: 'State',
      key: 'state',
      width: 120,
      render: (_: any, record: any) => {
        const stateName = getStateName(record)
        if (!stateName || stateName === '-') {
          return <span style={{ color: '#94a3b8' }}>—</span>
        }
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: '#334155',
              fontWeight: 500,
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            <EnvironmentOutlined style={{ color: '#0284c7', fontSize: '12px' }} />
            {stateName}
          </span>
        )
      },
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 250,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px', whiteSpace: 'nowrap', display: 'block' }}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      width: 120,
      render: (val: string) => (
        <span
          style={{
            color: '#64748b',
            fontSize: '13px',
            backgroundColor: '#f8fafc',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid #f1f5f9',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
        >
          {val || 'Customer'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => renderStatus(status),
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          style={{
            borderRadius: '6px',
            backgroundColor: '#0B63CE',
            boxShadow: '0 2px 4px rgba(11, 99, 206, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}
          onClick={() => handleView(record)}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px', width: '100%' }}>
      {/* Table Style Overrides to ensure header never wraps badly and columns occupy properly */}
      <style>{`
        .replacement-table .ant-table-thead > tr > th {
          white-space: nowrap !important;
          font-weight: 600 !important;
          color: #475569 !important;
          background-color: #f8fafc !important;
          font-size: 13px !important;
        }
        .replacement-table .ant-table-tbody > tr > td {
          vertical-align: middle !important;
          padding: 12px 14px !important;
        }
      `}</style>

      {/* Top Header */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            Replacement Forms Dashboard
          </Title>
          <Text style={{ color: '#64748b', fontSize: '13px' }}>
            Manage, search, and track all submitted product replacement and repair forms.
          </Text>
        </div>

        <Tooltip title="Reload latest data">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => fetchRequests(pagination.page, pagination.limit, debouncedSearch, statusFilter)}
            style={{ borderRadius: '8px' }}
          >
            Refresh
          </Button>
        </Tooltip>
      </div>

      {/* Metrics Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Total Card */}
        <div
          onClick={() => setStatusFilter('ALL')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'ALL' ? '2px solid #0B63CE' : '1px solid #e2e8f0',
            boxShadow: statusFilter === 'ALL' ? '0 4px 12px rgba(11, 99, 206, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>Total Requests</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
              {pagination.total || metrics.total}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#0B63CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
            }}
          >
            <FileTextOutlined />
          </div>
        </div>

        {/* Submitted Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'submitted' ? 'ALL' : 'submitted')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'submitted' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            boxShadow: statusFilter === 'submitted' ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>Submitted</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb', lineHeight: 1.2, marginTop: '2px' }}>
              {metrics.submitted}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
            }}
          >
            <ClockCircleOutlined />
          </div>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'ALL' : 'approved')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'approved' ? '2px solid #10b981' : '1px solid #e2e8f0',
            boxShadow: statusFilter === 'approved' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>Approved</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', lineHeight: 1.2, marginTop: '2px' }}>
              {metrics.approved}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
            }}
          >
            <CheckCircleOutlined />
          </div>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'ALL' : 'rejected')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: statusFilter === 'rejected' ? '2px solid #ef4444' : '1px solid #e2e8f0',
            boxShadow: statusFilter === 'rejected' ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>Rejected</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', lineHeight: 1.2, marginTop: '2px' }}>
              {metrics.rejected}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
            }}
          >
            <CloseCircleOutlined />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          borderRadius: '14px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          width: '100%',
        }}
        bodyStyle={{ padding: '20px' }}
      >
        {/* Filters Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
            {/* Search Input */}
            <Input
              placeholder="Search by Form No, Complaint No, Serial No, Customer Name, State..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              allowClear
              style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: '8px',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            />

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={val => setStatusFilter(val)}
              style={{ width: 160 }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'draft', label: 'Draft' },
              ]}
            />

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <Button
                icon={<ClearOutlined />}
                onClick={resetFilters}
                style={{ borderRadius: '8px', color: '#64748b' }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Records Counter */}
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            Showing <strong style={{ color: '#0f172a' }}>{filteredRequests.length}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{pagination.total || requests.length}</strong> requests
          </div>
        </div>

        {/* Table */}
        <Table
          className="replacement-table"
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  hasActiveFilters ? (
                    <div>
                      <p style={{ margin: 0, color: '#64748b' }}>No replacement forms match your search</p>
                      <Button
                        type="link"
                        size="small"
                        onClick={resetFilters}
                        style={{ padding: 0, marginTop: '4px' }}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  ) : (
                    'No replacement forms found'
                  )
                }
              />
            ),
          }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} forms`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, page, limit: pageSize }))
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}
