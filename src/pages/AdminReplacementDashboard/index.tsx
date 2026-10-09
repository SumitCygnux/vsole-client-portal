import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Card,
  Typography,
  Table,
  Button,
  message,
  Input,
  Select,
  AutoComplete,
  Tooltip,
  Empty,
  Drawer,
  DatePicker,
  Row,
  Col,
  Badge,
  Tag,
} from 'antd'
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
  FilterOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { get } from '@/helpers/api_helper'
import {
  GET_REPLACEMENT_DETAILS,
  GET_STATE_DROPDOWN,
} from '@/helpers/url_helper'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import dayjs, { Dayjs } from 'dayjs'

const { Title, Text } = Typography

interface DrawerFilterState {
  fromFormNo: string
  toFormNo: string
  complaintNo: string
  serialNo: string
  customer: string
  epc: string
  item: string
  dateRange: [Dayjs | null, Dayjs | null] | null
  state: string
  status: string
}

const initialFilters: DrawerFilterState = {
  fromFormNo: '',
  toFormNo: '',
  complaintNo: '',
  serialNo: '',
  customer: '',
  epc: '',
  item: '',
  dateRange: null,
  state: 'ALL',
  status: 'ALL',
}

interface DynamicFilterOptions {
  states: string[]
  customers: string[]
  items: string[]
  epcs: string[]
  form_numbers: string[]
  complaint_numbers: string[]
  serial_numbers: string[]
  statuses: string[]
}


export default function AdminReplacementDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const navigate = useNavigate()

  // Dynamic status counts and filter options from backend
  const [filterOptions, setFilterOptions] = useState<DynamicFilterOptions>({
    states: [],
    customers: [],
    items: [],
    epcs: [],
    form_numbers: [],
    complaint_numbers: [],
    serial_numbers: [],
    statuses: [],
  })

  const [masterStates, setMasterStates] = useState<string[]>([])

  const [statusCounts, setStatusCounts] = useState<{
    total: number
    submitted: number
    approved: number
    rejected: number
    draft: number
  }>({
    total: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  })

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Slide-over Filter Drawer states
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [drawerFilters, setDrawerFilters] = useState<DrawerFilterState>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<DrawerFilterState>(initialFilters)

  // Fetch status counts dynamically from backend
  const fetchStatusCounts = async () => {
    try {
      const res = await get('/customer-replacement-detail/status-counts')
      if (res?.status && res?.data) {
        setStatusCounts({
          total: Number(res.data.total) || 0,
          submitted: Number(res.data.submitted) || 0,
          approved: Number(res.data.approved) || 0,
          rejected: Number(res.data.rejected) || 0,
          draft: Number(res.data.draft) || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load status counts:', error)
    }
  }

  // Fetch filter options dynamically from backend (including all State Master states)
  const fetchFilterOptions = async () => {
    try {
      const res = await get('/customer-replacement-detail/filter-options')
      if (res?.status && res?.data) {
        setFilterOptions({
          states: res.data.states || [],
          customers: res.data.customers || [],
          items: res.data.items || [],
          epcs: res.data.epcs || [],
          form_numbers: res.data.form_numbers || [],
          complaint_numbers: res.data.complaint_numbers || [],
          serial_numbers: res.data.serial_numbers || [],
          statuses: res.data.statuses || ['submitted', 'approved', 'rejected', 'draft'],
        })
      }
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }

    // Also fetch State Master explicitly to ensure every master state is included
    try {
      const stateRes = await get(GET_STATE_DROPDOWN)
      const dataList = stateRes?.data || stateRes || []
      if (Array.isArray(dataList)) {
        const mStates = dataList
          .map((s: any) => (typeof s === 'string' ? s : s?.name || s?.state_name || ''))
          .filter(Boolean)
        setMasterStates(mStates)
      }
    } catch (e) {
      console.error('Failed to load state master:', e)
    }
  }

  // Load dynamic filters & status counts on mount
  useEffect(() => {
    fetchFilterOptions()
    fetchStatusCounts()
  }, [])

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

  // API Fetch with full backend filter support
  const fetchRequests = async (
    page = pagination.page,
    limit = pagination.limit,
    search = debouncedSearch,
    status = statusFilter,
    filters = appliedFilters
  ) => {
    setLoading(true)
    try {
      const params: any = { limit, page }
      if (search && search.trim()) params.search = search.trim()

      const effStatus = (filters?.status && filters.status !== 'ALL') ? filters.status : (status !== 'ALL' ? status : undefined)
      if (effStatus) params.status = effStatus

      if (filters?.fromFormNo?.trim()) params.doc_no_from = filters.fromFormNo.trim()
      if (filters?.toFormNo?.trim()) params.doc_no_to = filters.toFormNo.trim()
      if (filters?.complaintNo?.trim()) params.complaint_id = filters.complaintNo.trim()
      if (filters?.serialNo?.trim()) params.serial_no = filters.serialNo.trim()
      if (filters?.customer?.trim()) params.customer_name = filters.customer.trim()
      if (filters?.epc?.trim()) params.epc = filters.epc.trim()
      if (filters?.item?.trim()) params.item = filters.item.trim()

      if (filters?.dateRange?.[0]) params.date_from = filters.dateRange[0].format('YYYY-MM-DD')
      if (filters?.dateRange?.[1]) params.date_to = filters.dateRange[1].format('YYYY-MM-DD')

      if (filters?.state && filters.state !== 'ALL') params.state = filters.state

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
    fetchRequests(pagination.page, pagination.limit, debouncedSearch, statusFilter, appliedFilters)
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter])

  const handleView = (record: any) => {
    navigate(ROUTES.ADMIN_REPLACEMENT_REQUEST_DETAILS.replace(':id', record.id))
  }

  // Extract distinct States for Drawer Filter dynamically from State Master + database records
  const stateOptions = useMemo(() => {
    const set = new Set<string>([
      ...(filterOptions.states || []),
      ...masterStates,
    ])
    requests.forEach(r => {
      const st = getStateName(r)
      if (st && st !== '—' && st !== '-') set.add(st)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [filterOptions.states, masterStates, requests, getStateName])


  // Active filter count for the badge
  const activeDrawerFilterCount = useMemo(() => {
    let count = 0
    if (appliedFilters.fromFormNo.trim()) count++
    if (appliedFilters.toFormNo.trim()) count++
    if (appliedFilters.complaintNo.trim()) count++
    if (appliedFilters.serialNo.trim()) count++
    if (appliedFilters.customer?.trim()) count++
    if (appliedFilters.epc.trim()) count++
    if (appliedFilters.item.trim()) count++
    if (appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1]) count++
    if (appliedFilters.state && appliedFilters.state !== 'ALL') count++
    if (appliedFilters.status && appliedFilters.status !== 'ALL') count++
    return count
  }, [appliedFilters])

  // Apply filters via API Call
  const handleApplyDrawerFilters = () => {
    setAppliedFilters(drawerFilters)
    if (drawerFilters.status !== 'ALL') {
      setStatusFilter(drawerFilters.status)
    }
    setIsFilterDrawerOpen(false)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRequests(1, pagination.limit, debouncedSearch, drawerFilters.status, drawerFilters)
    message.success('Filters applied successfully')
  }

  // Reset Drawer Filters
  const handleResetDrawerFilters = () => {
    setDrawerFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setStatusFilter('ALL')
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRequests(1, pagination.limit, debouncedSearch, 'ALL', initialFilters)
    fetchStatusCounts()
    fetchFilterOptions()
  }

  // Clear all filters completely
  const handleClearAllFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setStatusFilter('ALL')
    setDrawerFilters(initialFilters)
    setAppliedFilters(initialFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRequests(1, pagination.limit, '', 'ALL', initialFilters)
    fetchStatusCounts()
    fetchFilterOptions()
  }

  // Remove a single active filter tag
  const handleRemoveTag = (key: keyof DrawerFilterState, defaultVal: any) => {
    const nextFilters = { ...appliedFilters, [key]: defaultVal }
    setAppliedFilters(nextFilters)
    setDrawerFilters(prev => ({ ...prev, [key]: defaultVal }))
    if (key === 'status') {
      setStatusFilter('ALL')
    }
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRequests(1, pagination.limit, debouncedSearch, nextFilters.status, nextFilters)
  }

  // Toolbar Quick Status Dropdown Handler
  const handleToolbarStatusChange = (val: string) => {
    setStatusFilter(val)
    const nextFilters = { ...appliedFilters, status: val }
    setAppliedFilters(nextFilters)
    setDrawerFilters(prev => ({ ...prev, status: val }))
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRequests(1, pagination.limit, debouncedSearch, val, nextFilters)
  }

  // Metric Cards Click Handler
  const handleMetricCardClick = (status: string) => {
    const nextStatus = statusFilter === status && appliedFilters.status === status ? 'ALL' : status
    setStatusFilter(nextStatus)
    const nextFilters = { ...appliedFilters, status: nextStatus }
    setAppliedFilters(nextFilters)
    setDrawerFilters(prev => ({ ...prev, status: nextStatus }))
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchRequests(1, pagination.limit, debouncedSearch, nextStatus, nextFilters)
  }

  // Dynamic metrics from backend status-counts API
  const metrics = useMemo(() => {
    return {
      total: statusCounts.total || pagination.total || requests.length,
      submitted: statusCounts.submitted,
      approved: statusCounts.approved,
      rejected: statusCounts.rejected,
      draft: statusCounts.draft,
    }
  }, [statusCounts, pagination.total, requests.length])

  const hasAnyFilterActive =
    searchQuery !== '' || statusFilter !== 'ALL' || activeDrawerFilterCount > 0

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
      width: 220,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px', whiteSpace: 'nowrap', display: 'block' }}>
          {text || '—'}
        </span>
      ),
    },
    {
      title: 'EPC Name',
      key: 'epc_name',
      width: 180,
      render: (_: any, record: any) => {
        const epc = record.epc_name || record.complaint?.epc_name
        if (!epc || epc === '-') {
          return <span style={{ color: '#94a3b8' }}>—</span>
        }
        return (
          <span style={{ fontWeight: 500, color: '#334155', fontSize: '13px', whiteSpace: 'nowrap' }}>
            {epc}
          </span>
        )
      },
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

  const drawerLabelStyle = {
    fontSize: '11px',
    fontWeight: 700 as const,
    color: '#475569',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
    display: 'block',
  }

  const drawerInputStyle = {
    borderRadius: '8px',
    padding: '7px 11px',
    fontSize: '13px',
  }

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
            onClick={() => {
              fetchRequests(pagination.page, pagination.limit, debouncedSearch, statusFilter, appliedFilters)
              fetchStatusCounts()
              fetchFilterOptions()
            }}
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
          onClick={() => handleMetricCardClick('ALL')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: (statusFilter === 'ALL' && appliedFilters.status === 'ALL') ? '2px solid #0B63CE' : '1px solid #e2e8f0',
            boxShadow: (statusFilter === 'ALL' && appliedFilters.status === 'ALL') ? '0 4px 12px rgba(11, 99, 206, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
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
          onClick={() => handleMetricCardClick('submitted')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: (statusFilter === 'submitted' || appliedFilters.status === 'submitted') ? '2px solid #2563eb' : '1px solid #e2e8f0',
            boxShadow: (statusFilter === 'submitted' || appliedFilters.status === 'submitted') ? '0 4px 12px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
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
          onClick={() => handleMetricCardClick('approved')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: (statusFilter === 'approved' || appliedFilters.status === 'approved') ? '2px solid #10b981' : '1px solid #e2e8f0',
            boxShadow: (statusFilter === 'approved' || appliedFilters.status === 'approved') ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
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
          onClick={() => handleMetricCardClick('rejected')}
          style={{
            cursor: 'pointer',
            padding: '14px 18px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: (statusFilter === 'rejected' || appliedFilters.status === 'rejected') ? '2px solid #ef4444' : '1px solid #e2e8f0',
            boxShadow: (statusFilter === 'rejected' || appliedFilters.status === 'rejected') ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
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
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
            {/* Search Input */}
            <Input
              placeholder="Search by Form No, Complaint No, Serial No, Customer Name..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              allowClear
              style={{
                width: '100%',
                maxWidth: '380px',
                borderRadius: '8px',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            />

            {/* Quick Status Filter Dropdown */}
            <Select
              value={statusFilter}
              onChange={handleToolbarStatusChange}
              style={{ width: 150 }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                ...filterOptions.statuses.map(s => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
                })),
              ]}
            />

            {/* Side Drawer Filters Button */}
            <Tooltip title="Filters">
              <Badge count={activeDrawerFilterCount} offset={[-2, 2]} color="#0B63CE">
                <Button
                  icon={<FilterOutlined style={{ color: activeDrawerFilterCount > 0 ? '#0B63CE' : '#475569' }} />}
                  onClick={() => {
                    setDrawerFilters(appliedFilters)
                    setIsFilterDrawerOpen(true)
                  }}
                  style={{
                    borderRadius: '8px',
                    height: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 500,
                    borderColor: activeDrawerFilterCount > 0 ? '#0B63CE' : '#cbd5e1',
                    backgroundColor: activeDrawerFilterCount > 0 ? '#eff6ff' : '#ffffff',
                    color: activeDrawerFilterCount > 0 ? '#0B63CE' : '#334155',
                  }}
                >
                  Filters
                </Button>
              </Badge>
            </Tooltip>

            {/* Clear All Filters Button */}
            {hasAnyFilterActive && (
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearAllFilters}
                style={{ borderRadius: '8px', color: '#64748b' }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Records Counter */}
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            Showing <strong style={{ color: '#0f172a' }}>{requests.length}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{pagination.total || requests.length}</strong> requests
          </div>
        </div>

        {/* Active Filter Tags Bar (shows all active filters applied via Drawer) */}
        {activeDrawerFilterCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Active Filters:</span>
            {appliedFilters.fromFormNo && (
              <Tag closable onClose={() => handleRemoveTag('fromFormNo', '')} color="blue">
                From Form: {appliedFilters.fromFormNo}
              </Tag>
            )}
            {appliedFilters.toFormNo && (
              <Tag closable onClose={() => handleRemoveTag('toFormNo', '')} color="blue">
                To Form: {appliedFilters.toFormNo}
              </Tag>
            )}
            {appliedFilters.complaintNo && (
              <Tag closable onClose={() => handleRemoveTag('complaintNo', '')} color="cyan">
                Complaint: {appliedFilters.complaintNo}
              </Tag>
            )}
            {appliedFilters.serialNo && (
              <Tag closable onClose={() => handleRemoveTag('serialNo', '')} color="purple">
                Serial No: {appliedFilters.serialNo}
              </Tag>
            )}
            {appliedFilters.customer && (
              <Tag closable onClose={() => handleRemoveTag('customer', '')} color="volcano">
                Customer: {appliedFilters.customer}
              </Tag>
            )}
            {appliedFilters.epc && (
              <Tag closable onClose={() => handleRemoveTag('epc', '')} color="geekblue">
                EPC: {appliedFilters.epc}
              </Tag>
            )}
            {appliedFilters.item && (
              <Tag closable onClose={() => handleRemoveTag('item', '')} color="magenta">
                Item: {appliedFilters.item}
              </Tag>
            )}
            {appliedFilters.state !== 'ALL' && (
              <Tag closable onClose={() => handleRemoveTag('state', 'ALL')} color="orange">
                State: {appliedFilters.state}
              </Tag>
            )}
            {appliedFilters.dateRange && (
              <Tag closable onClose={() => handleRemoveTag('dateRange', null)} color="gold">
                Date: {appliedFilters.dateRange[0]?.format('DD/MM/YYYY')} - {appliedFilters.dateRange[1]?.format('DD/MM/YYYY')}
              </Tag>
            )}
            {appliedFilters.status !== 'ALL' && (
              <Tag closable onClose={() => handleRemoveTag('status', 'ALL')} color="green">
                Status: {appliedFilters.status.toUpperCase()}
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              onClick={handleResetDrawerFilters}
              style={{ padding: 0, fontSize: '12px', color: '#ef4444' }}
            >
              Reset All
            </Button>
          </div>
        )}

        {/* Table */}
        <Table
          className="replacement-table"
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  hasAnyFilterActive ? (
                    <div>
                      <p style={{ margin: 0, color: '#64748b' }}>No replacement forms match your filter criteria</p>
                      <Button
                        type="link"
                        size="small"
                        onClick={handleClearAllFilters}
                        style={{ padding: 0, marginTop: '4px' }}
                      >
                        Reset All Filters
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
              fetchRequests(page, pageSize, debouncedSearch, statusFilter, appliedFilters)
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* FILTER DRAWER */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilterOutlined style={{ color: '#0B63CE', fontSize: '18px' }} />
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>
              Filter Replacement Forms
            </span>
          </div>
        }
        placement="right"
        width={380}
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        closeIcon={<CloseOutlined style={{ fontSize: '15px', color: '#64748b' }} />}
        styles={{
          body: { padding: '20px', paddingBottom: '80px' },
          footer: { padding: '16px 20px', borderTop: '1px solid #f1f5f9' },
        }}
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              onClick={handleResetDrawerFilters}
              style={{
                borderRadius: '8px',
                fontWeight: 600,
                height: '38px',
                padding: '0 20px',
                color: '#64748b',
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              onClick={handleApplyDrawerFilters}
              style={{
                backgroundColor: '#0B63CE',
                borderRadius: '8px',
                fontWeight: 600,
                height: '38px',
                padding: '0 24px',
                boxShadow: '0 2px 4px rgba(11, 99, 206, 0.25)',
              }}
            >
              Apply Filters
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* FROM DOC NO. & TO DOC NO. */}
          <div>
            <Row gutter={12}>
              <Col span={12}>
                <label style={drawerLabelStyle}>From Doc No.</label>
                <AutoComplete
                  placeholder="Search from..."
                  value={drawerFilters.fromFormNo}
                  onChange={val => setDrawerFilters({ ...drawerFilters, fromFormNo: val })}
                  options={filterOptions.form_numbers.map(fn => ({ value: fn, label: fn }))}
                  filterOption={(inputValue, option) =>
                    (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
                  }
                  allowClear
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={12}>
                <label style={drawerLabelStyle}>To Doc No.</label>
                <AutoComplete
                  placeholder="Search to..."
                  value={drawerFilters.toFormNo}
                  onChange={val => setDrawerFilters({ ...drawerFilters, toFormNo: val })}
                  options={filterOptions.form_numbers.map(fn => ({ value: fn, label: fn }))}
                  filterOption={(inputValue, option) =>
                    (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
                  }
                  allowClear
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>

          {/* SERIAL NO. */}
          <div>
            <label style={drawerLabelStyle}>Serial No.</label>
            <AutoComplete
              placeholder="Search serial no..."
              value={drawerFilters.serialNo}
              onChange={val => setDrawerFilters({ ...drawerFilters, serialNo: val })}
              options={filterOptions.serial_numbers.map(sn => ({ value: sn, label: sn }))}
              filterOption={(inputValue, option) =>
                (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
              }
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* CUSTOMER */}
          <div>
            <label style={drawerLabelStyle}>Customer</label>
            <AutoComplete
              placeholder="Search customer..."
              value={drawerFilters.customer}
              onChange={val => setDrawerFilters({ ...drawerFilters, customer: val })}
              options={filterOptions.customers.map(c => ({ value: c, label: c }))}
              filterOption={(inputValue, option) =>
                (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
              }
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* EPC */}
          <div>
            <label style={drawerLabelStyle}>EPC</label>
            <AutoComplete
              placeholder="Search EPC..."
              value={drawerFilters.epc}
              onChange={val => setDrawerFilters({ ...drawerFilters, epc: val })}
              options={filterOptions.epcs.map(epc => ({ value: epc, label: epc }))}
              filterOption={(inputValue, option) =>
                (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
              }
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* DATE RANGE */}
          <div>
            <label style={drawerLabelStyle}>Date Range</label>
            <DatePicker.RangePicker
              value={drawerFilters.dateRange}
              onChange={val => setDrawerFilters({ ...drawerFilters, dateRange: val })}
              format="DD/MM/YYYY"
              placeholder={['Start date', 'End date']}
              style={{ width: '100%', borderRadius: '8px', padding: '7px 11px' }}
            />
          </div>

          {/* ITEM */}
          <div>
            <label style={drawerLabelStyle}>Item</label>
            <AutoComplete
              placeholder="Search item..."
              value={drawerFilters.item}
              onChange={val => setDrawerFilters({ ...drawerFilters, item: val })}
              options={filterOptions.items.map(it => ({ value: it, label: it }))}
              filterOption={(inputValue, option) =>
                (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
              }
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* COMPLAINT NO. */}
          <div>
            <label style={drawerLabelStyle}>Complaint No.</label>
            <AutoComplete
              placeholder="Search complaint no..."
              value={drawerFilters.complaintNo}
              onChange={val => setDrawerFilters({ ...drawerFilters, complaintNo: val })}
              options={filterOptions.complaint_numbers.map(cn => ({ value: cn, label: cn }))}
              filterOption={(inputValue, option) =>
                (option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) ?? -1) !== -1
              }
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          {/* COMPLAINT STATUS */}
          <div>
            <label style={drawerLabelStyle}>Complaint Status</label>
            <Select
              value={drawerFilters.status}
              onChange={val => setDrawerFilters({ ...drawerFilters, status: val })}
              style={{ width: '100%' }}
              options={[
                { value: 'ALL', label: 'All Status' },
                ...filterOptions.statuses.map(s => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
                })),
              ]}
            />
          </div>

          {/* STATE */}
          <div>
            <label style={drawerLabelStyle}>State</label>
            <Select
              value={drawerFilters.state}
              onChange={val => setDrawerFilters({ ...drawerFilters, state: val })}
              showSearch
              placeholder="Select states..."
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: 'ALL', label: 'All States' },
                ...stateOptions.map(st => ({ value: st, label: st })),
              ]}
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}
