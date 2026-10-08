import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, Table, Tag, message, Input, Select, Button, Empty } from 'antd'
import { SearchOutlined, EnvironmentOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons'
import { get } from '@/helpers/api_helper'
import { GET_REPLACEMENT_DETAILS } from '@/helpers/url_helper'
import dayjs from 'dayjs'
import PageHeader from '@/components/layout/PageHeader'

export default function MyReplacementRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 350)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const getSerialNumber = useCallback((record: any): string => {
    const sn =
      record.serial_no ||
      record.correct_serial_number ||
      record.complaint?.serial_number ||
      record.complaint?.serialNo ||
      record.serial_number ||
      ''
    return typeof sn === 'string' ? sn.trim() : String(sn || '')
  }, [])

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

  useEffect(() => {
    fetchRequests(pagination.page, pagination.limit, debouncedSearch, statusFilter)
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter])

  const filteredRequests = useMemo(() => {
    return requests.filter(record => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        const formNo = (record.form_no || '').toLowerCase()
        const compNo = (record.complaint_number || record.complaint_no || '').toLowerCase()
        const sn = getSerialNumber(record).toLowerCase()
        const stateName = getStateName(record).toLowerCase()

        const matches =
          formNo.includes(q) ||
          compNo.includes(q) ||
          sn.includes(q) ||
          stateName.includes(q)

        if (!matches) return false
      }

      if (statusFilter !== 'ALL') {
        const currentStatus = (record.status || 'draft').toLowerCase()
        if (currentStatus !== statusFilter.toLowerCase()) return false
      }

      return true
    })
  }, [requests, debouncedSearch, statusFilter, getSerialNumber, getStateName])

  const renderStatus = (status: string) => {
    const s = (status || 'draft').toLowerCase()
    let color = 'default'
    if (s === 'approved') color = 'success'
    else if (s === 'rejected') color = 'error'
    else if (s === 'submitted') color = 'processing'

    return (
      <Tag
        color={color}
        style={{
          borderRadius: '9999px',
          fontWeight: 600,
          padding: '2px 10px',
          textTransform: 'uppercase',
          fontSize: '11.5px',
        }}
      >
        {status ? status.toUpperCase() : 'DRAFT'}
      </Tag>
    )
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <span style={{ color: '#475569', fontSize: '13px' }}>
          {date ? dayjs(date).format('DD MMM YYYY') : '—'}
        </span>
      ),
    },
    {
      title: 'Form No',
      dataIndex: 'form_no',
      key: 'form_no',
      width: 170,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'Complaint No',
      dataIndex: 'complaint_number',
      key: 'complaint_number',
      width: 170,
      render: (text: string) => (
        <span style={{ color: '#0284c7', fontWeight: 500, fontSize: '13px' }}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'Serial Number',
      key: 'serial_no',
      width: 170,
      render: (_: any, record: any) => {
        const sn = getSerialNumber(record)
        if (!sn || sn === '-') {
          return <span style={{ color: '#94a3b8' }}>—</span>
        }
        return (
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: 600,
              color: '#1e293b',
              backgroundColor: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
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
      width: 140,
      render: (_: any, record: any) => {
        const st = getStateName(record)
        if (!st || st === '-') {
          return <span style={{ color: '#94a3b8' }}>—</span>
        }
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: 500 }}>
            <EnvironmentOutlined style={{ color: '#0284c7', fontSize: '12px' }} />
            {st}
          </span>
        )
      },
    },
    {
      title: 'Type',
      dataIndex: 'type_of_form',
      key: 'type_of_form',
      width: 130,
      render: (type: string) => (
        <span style={{ textTransform: 'capitalize', color: '#475569' }}>
          {type || 'Replacement'}
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
  ]

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL'

  const resetFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setStatusFilter('ALL')
  }

  return (
    <div className="w-full flex-col items-center min-h-screen relative p-6">
      <div className="relative z-10 mx-auto w-full max-w-[1300px]">
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <PageHeader
            title="My Replacement Requests"
            description="Track the status of all your replacement and repair forms."
          />
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => fetchRequests(pagination.page, pagination.limit, debouncedSearch, statusFilter)}
            style={{ borderRadius: '8px' }}
          >
            Refresh
          </Button>
        </div>

        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          {/* Filters Bar */}
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
              <Input
                placeholder="Search by Form No, Complaint No, Serial No, State..."
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                allowClear
                style={{ width: '100%', maxWidth: '380px', borderRadius: '8px' }}
              />

              <Select
                value={statusFilter}
                onChange={val => setStatusFilter(val)}
                style={{ width: 150 }}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />

              {hasActiveFilters && (
                <Button icon={<ClearOutlined />} onClick={resetFilters} style={{ borderRadius: '8px', color: '#64748b' }}>
                  Clear Filters
                </Button>
              )}
            </div>

            <div style={{ color: '#64748b', fontSize: '13px' }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredRequests.length}</strong> of{' '}
              <strong style={{ color: '#0f172a' }}>{pagination.total || requests.length}</strong> forms
            </div>
          </div>

          <Table
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
                        <p style={{ margin: 0, color: '#64748b' }}>No requests match your search/filter</p>
                        <Button type="link" size="small" onClick={resetFilters} style={{ padding: 0, marginTop: '4px' }}>
                          Reset Filters
                        </Button>
                      </div>
                    ) : (
                      'No replacement requests found'
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
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} forms`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, page, limit: pageSize }))
              },
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </div>
  )
}
