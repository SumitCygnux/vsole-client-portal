import { useCallback, useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  SwapOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { AutoComplete, Input, Select, message } from 'antd'
import dayjs from 'dayjs'

import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const { TextArea } = Input

type Complaint = {
  id: string
  capacity: string
  serialNo: string
  phase: string
  status: 'open' | 'closed'
}

const mockComplaints: Complaint[] = [
  { id: 'CMP-2026-0001', capacity: '5 kW', serialNo: 'SN-VSL-10234', phase: 'Single Phase', status: 'open' },
  { id: 'CMP-2026-0002', capacity: '10 kW', serialNo: 'SN-VSL-10456', phase: 'Three Phase', status: 'open' },
]

const pincodeStateMap: Record<string, string> = {
  '380001': 'Gujarat',
  '400001': 'Maharashtra',
  '110001': 'Delhi',
}

const typeOfFormOptions = [{ label: 'Replacement', value: 'replacement' }]

let formCounter = 1

function generateFormNo() {
  return `RPL-${dayjs().format('YYYYMMDD')}-${String(formCounter++).padStart(4, '0')}`
}

type FormErrors = Record<string, string>

function ReplacementPage() {
  const [formNo] = useState(() => generateFormNo())
  const [formDate] = useState(() => dayjs())

  const [complaintSearch, setComplaintSearch] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  const [capacityRight, setCapacityRight] = useState<boolean | null>(null)
  const [serialNoRight, setSerialNoRight] = useState<boolean | null>(null)
  const [correctCapacity, setCorrectCapacity] = useState('')
  const [correctSerialNo, setCorrectSerialNo] = useState('')

  const [epcName, setEpcName] = useState('')
  const [epcGstNo, setEpcGstNo] = useState('')
  const [dispatchAddress, setDispatchAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [clientContactNo, setClientContactNo] = useState('')
  const [typeOfForm, setTypeOfForm] = useState<string>('replacement')
  const [remark, setRemark] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const state = useMemo(
    () => (pincode.length === 6 ? pincodeStateMap[pincode] ?? '' : ''),
    [pincode],
  )

  const openComplaints = useMemo(
    () => mockComplaints.filter((c) => c.status === 'open'),
    [],
  )

  const complaintOptions = useMemo(
    () =>
      openComplaints
        .filter((c) => c.id.toLowerCase().includes(complaintSearch.toLowerCase()))
        .map((c) => ({
          label: (
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[#0F172A]">{c.id}</span>
              <span className="rounded-full bg-[#EAF0FF] px-2.5 py-1 text-xs font-semibold text-[#315BFF]">
                {c.capacity} - {c.phase}
              </span>
            </div>
          ),
          value: c.id,
        })),
    [complaintSearch, openComplaints],
  )

  const handleComplaintSelect = useCallback(
    (value: string) => {
      const complaint = openComplaints.find((c) => c.id === value)

      if (complaint) {
        setSelectedComplaint(complaint)
        setComplaintSearch(complaint.id)
        setCapacityRight(null)
        setSerialNoRight(null)
        setCorrectCapacity('')
        setCorrectSerialNo('')
        setErrors((prev) => {
          const next = { ...prev }
          delete next.complaintNo
          return next
        })
      }
    },
    [openComplaints],
  )

  const validate = useCallback(() => {
    const newErrors: FormErrors = {}

    if (!selectedComplaint) newErrors.complaintNo = 'Complaint is required'
    if (capacityRight === null) newErrors.capacityRight = 'Please confirm capacity'
    if (serialNoRight === null) newErrors.serialNoRight = 'Please confirm serial number'
    if (capacityRight === false && !correctCapacity.trim()) newErrors.correctCapacity = 'Correct capacity is required'
    if (serialNoRight === false && !correctSerialNo.trim()) newErrors.correctSerialNo = 'Correct serial number is required'
    if (!epcName.trim()) newErrors.epcName = 'EPC name is required'
    if (!epcGstNo.trim()) newErrors.epcGstNo = 'GST number is required'
    if (!dispatchAddress.trim()) newErrors.dispatchAddress = 'Dispatch address is required'
    if (!pincode.trim() || pincode.length !== 6) newErrors.pincode = 'Valid pincode is required'
    if (!state) newErrors.state = 'State is required'
    if (!clientContactNo.trim() || clientContactNo.length !== 10) newErrors.clientContactNo = 'Valid contact number is required'
    if (!typeOfForm) newErrors.typeOfForm = 'Type of form is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [
    selectedComplaint,
    capacityRight,
    serialNoRight,
    correctCapacity,
    correctSerialNo,
    epcName,
    epcGstNo,
    dispatchAddress,
    pincode,
    state,
    clientContactNo,
    typeOfForm,
  ])

  const resetForm = () => {
    setComplaintSearch('')
    setSelectedComplaint(null)
    setCapacityRight(null)
    setSerialNoRight(null)
    setCorrectCapacity('')
    setCorrectSerialNo('')
    setEpcName('')
    setEpcGstNo('')
    setDispatchAddress('')
    setPincode('')
    setClientContactNo('')
    setTypeOfForm('replacement')
    setRemark('')
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validate()) {
      message.error('Please fix the highlighted errors.')
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    message.success('Replacement form submitted successfully.')
    setSubmitting(false)
    resetForm()
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <span className="mt-1.5 block text-xs font-medium text-red-500">
        {errors[key]}
      </span>
    ) : null

  return (
    <div className="replacement-page text-[#0F172A] [&_.ant-input-affix-wrapper-focused]:!border-[#0B63CE] [&_.ant-input-affix-wrapper-focused]:!shadow-[0_0_0_3px_rgba(11,99,206,0.12)] [&_.ant-input-affix-wrapper]:!border-[#D8E0EC] [&_.ant-input-affix-wrapper]:!bg-white [&_.ant-input-focused]:!border-[#0B63CE] [&_.ant-input-focused]:!shadow-[0_0_0_3px_rgba(11,99,206,0.12)] [&_.ant-input::placeholder]:!text-[#9AA8BA] [&_.ant-input]:!border-[#D8E0EC] [&_.ant-input]:!bg-white [&_.ant-input]:!font-medium [&_.ant-input]:!text-[#0F172A] [&_.ant-select-selector]:!border-[#D8E0EC] [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#0F172A]">
      <div className="grid gap-5">
        <div className="overflow-hidden rounded-2xl border border-[#DCE2F1] bg-[radial-gradient(circle_at_92%_12%,rgba(246,180,0,0.16),transparent_24%),linear-gradient(135deg,#FFFFFF_0%,#F8FAFF_100%)] shadow-[0_18px_44px_rgba(15,23,42,0.07)] max-sm:rounded-xl">
          <div className="grid gap-5 p-6 max-sm:gap-4 max-sm:p-3">
            <PageHeader
              badge={
                <span className="inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#0B63CE]">
                  Replacement Workflow
                </span>
              }
              title="Replacement Form"
              description="Create a replacement request from an active complaint, verify product details, and prepare dispatch in one clean flow."
              actions={
                <>
                <span className="rounded-full border border-[#DCE5F4] bg-white px-3 py-1.5 text-xs font-extrabold text-[#526174] shadow-[0_6px_14px_rgba(15,23,42,0.04)]">
                  {formNo}
                </span>
                <span className="rounded-full bg-[#FFF7E6] px-3 py-1.5 text-xs font-extrabold text-[#D97706] shadow-[0_6px_14px_rgba(246,180,0,0.12)]">
                  Draft
                </span>
                </>
              }
            />

            <div className="grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-3">
              <InfoPill label="Form No" value={formNo} icon={<FileTextOutlined />} tone="blue" />
              <InfoPill label="Date" value={formDate.format('DD MMM YYYY')} icon={<CheckCircleOutlined />} tone="green" />
              <InfoPill label="Open Complaints" value={String(openComplaints.length).padStart(2, '0')} icon={<SwapOutlined />} tone="cyan" />
              <InfoPill label="Status" value="Draft" icon={<FileTextOutlined />} tone="amber" />
            </div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-[#DCE2F1] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] max-sm:rounded-xl [&_.ant-card-body]:!p-0">
          <div className="grid gap-5 p-6 max-sm:gap-3 max-sm:p-3">
            <div className="rounded-xl border border-[#E5EAF4] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.035)] max-sm:p-4">
            <SectionTitle icon={<FileTextOutlined />} title="Request Information" subtitle="Generated request details and complaint selection" />

            <div className="mt-5 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <ReadOnlyField label="Form Number" value={formNo} />
              <ReadOnlyField label="Date" value={formDate.format('DD MMM YYYY')} />

              <div>
                <FieldLabel label="Complaint No" required />
                <AutoComplete
                  className="w-full [&_.ant-input]:!rounded-xl"
                  options={complaintOptions}
                  value={complaintSearch}
                  onSearch={setComplaintSearch}
                  onSelect={handleComplaintSelect}
                  allowClear
                  onClear={() => {
                    setSelectedComplaint(null)
                    setComplaintSearch('')
                  }}
                >
                  <Input
                    size="large"
                    prefix={<SearchOutlined className="text-[#0B63CE]" />}
                    placeholder="Search open complaint"
                    className="!rounded-xl"
                  />
                </AutoComplete>
                {fieldError('complaintNo')}
              </div>
            </div>
            </div>

            <div className="rounded-xl border border-[#E5EAF4] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.035)] max-sm:p-4">
            <SectionTitle icon={<SwapOutlined />} title="Complaint Details" subtitle="Filled automatically after selecting a complaint" />

            <div className="mt-5 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <ReadOnlyField label="Capacity" value={selectedComplaint?.capacity || '-'} highlight={!!selectedComplaint} />
              <ReadOnlyField label="Serial No" value={selectedComplaint?.serialNo || '-'} highlight={!!selectedComplaint} />
              <ReadOnlyField label="Phase" value={selectedComplaint?.phase || '-'} highlight={!!selectedComplaint} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <ToggleBox
                label="Capacity Right?"
                value={capacityRight}
                error={errors.capacityRight}
                onChange={(value) => {
                  setCapacityRight(value)
                  if (value) setCorrectCapacity('')
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.capacityRight
                    delete next.correctCapacity
                    return next
                  })
                }}
              >
                {capacityRight === false && (
                  <>
                    <Input
                      size="large"
                      className="mt-4 !rounded-xl"
                      placeholder="Enter correct capacity"
                      value={correctCapacity}
                      onChange={(e) => setCorrectCapacity(e.target.value)}
                      status={errors.correctCapacity ? 'error' : undefined}
                    />
                    {fieldError('correctCapacity')}
                  </>
                )}
              </ToggleBox>

              <ToggleBox
                label="Serial No Right?"
                value={serialNoRight}
                error={errors.serialNoRight}
                onChange={(value) => {
                  setSerialNoRight(value)
                  if (value) setCorrectSerialNo('')
                  setErrors((prev) => {
                    const next = { ...prev }
                    delete next.serialNoRight
                    delete next.correctSerialNo
                    return next
                  })
                }}
              >
                {serialNoRight === false && (
                  <>
                    <Input
                      size="large"
                      className="mt-4 !rounded-xl"
                      placeholder="Enter correct serial number"
                      value={correctSerialNo}
                      onChange={(e) => setCorrectSerialNo(e.target.value)}
                      status={errors.correctSerialNo ? 'error' : undefined}
                    />
                    {fieldError('correctSerialNo')}
                  </>
                )}
              </ToggleBox>
            </div>
            </div>

            <div className="rounded-xl border border-[#E5EAF4] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.035)] max-sm:p-4">
            <SectionTitle icon={<FileTextOutlined />} title="EPC And Dispatch" subtitle="Partner, GST, and delivery information" />

            <div className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <FormInput label="EPC Name" required value={epcName} onChange={setEpcName} error={errors.epcName} placeholder="Enter EPC name" />
              <FormInput label="EPC GST No" required value={epcGstNo} onChange={setEpcGstNo} error={errors.epcGstNo} placeholder="Enter GST number" />
            </div>

            <div className="mt-5">
              <FieldLabel label="Dispatch Address" required />
              <TextArea
                rows={3}
                className="!rounded-xl"
                placeholder="Enter full dispatch address"
                value={dispatchAddress}
                onChange={(e) => setDispatchAddress(e.target.value)}
                status={errors.dispatchAddress ? 'error' : undefined}
              />
              {fieldError('dispatchAddress')}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <FormInput
                label="Pincode"
                required
                value={pincode}
                onChange={(value) => setPincode(value.replace(/\D/g, ''))}
                error={errors.pincode}
                placeholder="6-digit pincode"
                maxLength={6}
              />

              <ReadOnlyField label="State" value={state || '-'} highlight={!!state} />

              <FormInput
                label="Client Contact No"
                required
                value={clientContactNo}
                onChange={(value) => setClientContactNo(value.replace(/\D/g, ''))}
                error={errors.clientContactNo}
                placeholder="10-digit number"
                maxLength={10}
              />
            </div>

            {fieldError('state')}
            </div>

            <div className="rounded-xl border border-[#E5EAF4] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.035)] max-sm:p-4">
            <SectionTitle icon={<CheckCircleOutlined />} title="Classification" subtitle="Request type and internal remark" />

            <div className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <div>
                <FieldLabel label="Type Of Form" required />
                <Select
                  size="large"
                  className="w-full [&_.ant-select-selector]:!rounded-xl"
                  options={typeOfFormOptions}
                  value={typeOfForm}
                  onChange={setTypeOfForm}
                  status={errors.typeOfForm ? 'error' : undefined}
                />
                {fieldError('typeOfForm')}
              </div>

              <div>
                <FieldLabel label="Remark" />
                <TextArea
                  rows={3}
                  className="!rounded-xl"
                  placeholder="Enter remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
            </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E5EAF4] pt-1 max-sm:grid max-sm:grid-cols-2">
              <Button
                buttonVariant="secondary"
                className="!h-auto !rounded-lg !border-[#C9D6EA] !px-6 !py-2.5 !font-bold !text-[#526174] hover:!border-[#0B63CE] hover:!text-[#0B63CE] max-sm:!w-full max-sm:!px-3"
                onClick={resetForm}
              >
                <ReloadOutlined className="mr-1" />
                Reset
              </Button>

              <Button
                buttonVariant="primary"
                isLoading={submitting}
                onClick={handleSubmit}
                className="!h-auto !rounded-lg !border-0 !bg-[#0B63CE] !px-8 !py-2.5 !font-bold !text-white !shadow-[0_10px_24px_rgba(11,99,206,0.24)] hover:!bg-[#0957B6] max-sm:!w-full max-sm:!px-3"
              >
                <CheckCircleOutlined className="mr-1" />
                Submit Form
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function InfoPill({
  icon,
  label,
  tone,
  value,
}: {
  icon: React.ReactNode
  label: string
  tone: 'amber' | 'blue' | 'cyan' | 'green'
  value: string
}) {
  const toneClass = {
    amber: 'border-[#FDE7B7] bg-[#FFFBEB] text-[#D97706]',
    blue: 'border-[#CFE3FF] bg-[#EEF5FF] text-[#0B63CE]',
    cyan: 'border-[#BDEDF7] bg-[#ECFEFF] text-[#0891B2]',
    green: 'border-[#C7F2D7] bg-[#ECFDF3] text-[#16A34A]',
  }[tone]

  return (
    <div className="rounded-xl border border-[#E5EAF4] bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.035)]">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl border text-base ${toneClass}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#64748B]">
            {label}
          </span>
          <strong className="mt-1 block truncate text-sm font-extrabold text-[#0F172A]">
            {value}
          </strong>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-xl bg-[#EEF5FF] text-lg text-[#0B63CE] shadow-[inset_0_0_0_1px_rgba(11,99,206,0.08)]">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-[#0F172A]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs font-semibold text-[#64748B]">{subtitle}</p>}
      </div>
    </div>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.03em] text-[#64748B]">
      {label}
      {required && <span className="ml-1 text-[#DC2626]">*</span>}
    </label>
  )
}

function ReadOnlyField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <FieldLabel label={label} />
      <div
        className={`flex h-11 items-center rounded-xl border px-4 text-sm font-semibold ${highlight
          ? 'border-[#CFE3FF] bg-[#EEF5FF] text-[#0B63CE]'
          : 'border-[#D8E0EC] bg-[#F8FAFC] text-[#243247]'
          }`}
      >
        {value}
      </div>
    </div>
  )
}

function FormInput({
  label,
  required,
  value,
  onChange,
  error,
  placeholder,
  maxLength,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <Input
        size="large"
        maxLength={maxLength}
        className="!rounded-xl"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        status={error ? 'error' : undefined}
      />
      {error && <span className="mt-1.5 block text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}

function ToggleBox({
  label,
  value,
  error,
  onChange,
  children,
}: {
  label: string
  value: boolean | null
  error?: string
  onChange: (value: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${value === true
        ? 'border-[#BCECCF] bg-[#F3FFF7]'
        : value === false
          ? 'border-[#F5B8B8] bg-[#FFF6F6]'
          : 'border-[#D8E0EC] bg-white'
        }`}
    >
      <FieldLabel label={label} required />

      <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-[#D8E0EC] bg-[#EEF2F7] p-1">
        {[
          { icon: <CheckCircleOutlined />, label: 'Yes', optionValue: true },
          { icon: <CloseCircleOutlined />, label: 'No', optionValue: false },
        ].map((option) => {
          const isActive = value === option.optionValue

          return (
            <Button
              key={option.label}
              buttonVariant="ghost"
              htmlType="button"
              onClick={() => onChange(option.optionValue)}
              className={`!h-10 !rounded-lg !border-0 !font-extrabold !shadow-none transition-all ${isActive
                ? option.optionValue
                  ? '!bg-[#16A34A] !text-white hover:!bg-[#15803D] hover:!text-white'
                  : '!bg-[#EF4444] !text-white hover:!bg-[#DC2626] hover:!text-white'
                : '!bg-transparent !text-[#526174] hover:!bg-white hover:!text-[#0B63CE]'
                }`}
            >
              <span className="mr-2 text-base leading-none">{option.icon}</span>
              {option.label}
            </Button>
          )
        })}
      </div>

      {error && <span className="mt-1.5 block text-xs font-medium text-red-500">{error}</span>}

      {children}
    </div>
  )
}

export default ReplacementPage
