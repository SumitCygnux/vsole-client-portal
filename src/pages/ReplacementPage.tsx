import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  SwapOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Input, Select, message } from 'antd'
import dayjs from 'dayjs'

import { get, post } from '@/helpers/api_helper'
import { CREATE_REPLACEMENT_DETAIL, GET_COMPLAINT_BY_NO, GET_PIN_DROPDOWN } from '@/helpers/url_helper'
import { useSearchParams } from 'react-router-dom'

import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const { TextArea } = Input

type Complaint = {
  id: string
  complaint_no: string
  capacity: string
  serialNo: string
  phase: string
  status: 'open' | 'closed'
  company_id?: string
  location_id?: string
  fin_year?: string
}




const typeOfFormOptions = [
  { label: 'Replacement', value: 'replacement' },
  { label: 'Repair', value: 'repair' },
  { label: 'Replacement Test', value: 'replacement_test' },
]

type FormErrors = Record<string, string>

function ReplacementPage() {
  const [searchParams] = useSearchParams()
  const complaintQuery = searchParams.get('complaint_no')

  const [formDate] = useState(() => dayjs())

  const [complaintSearch, setComplaintSearch] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [complaintError, setComplaintError] = useState('')

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

  const [pincodes, setPincodes] = useState<any[]>([])

  useEffect(() => {
    const fetchPincodes = async () => {
      try {
        const res = await get(GET_PIN_DROPDOWN)
        if (res.status) setPincodes(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchPincodes()
  }, [])

  useEffect(() => {
    if (complaintQuery) {
      setComplaintSearch(complaintQuery)
    }
  }, [complaintQuery])

  const state = useMemo(() => {
    if (pincode.length === 6) {
      const p = pincodes.find((pin) => (pin.pinCode || pin.pin_name) === pincode)
      return p ? (p.state_id?.name || p.state_id?.state_name || '') : ''
    }
    return ''
  }, [pincode, pincodes])





  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (complaintSearch.length > 3) {
        verifyComplaint(complaintSearch)
      } else if (!complaintSearch) {
        setSelectedComplaint(null)
        setComplaintError('')
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [complaintSearch])

  const verifyComplaint = async (value: string) => {
    setVerifying(true)
    try {
      const res = await get(`${GET_COMPLAINT_BY_NO}/${encodeURIComponent(value)}`)
      const complaint = res.data

      if (complaint) {
        if (complaint.status !== 'closed' && complaint.status !== 'resolved' && complaint.status !== 'cancelled') {
          setSelectedComplaint({
            id: complaint.id,
            complaint_no: complaint.complaint_no,
            capacity: complaint.product_type_name || complaint.capacity || '-',
            serialNo: complaint.serial_number || complaint.serialNo || '-',
            phase: complaint.phase && complaint.phase !== '-' ? (complaint.phase.toLowerCase().includes('phase') ? complaint.phase : `${complaint.phase}-Phase`) : '1-Phase',
            status: complaint.status,
            company_id: complaint.company_id,
            location_id: complaint.location_id,
            fin_year: complaint.fin_year
          })
          setComplaintError('')
          setCapacityRight(null)
          setSerialNoRight(null)
          setCorrectCapacity('')
          setCorrectSerialNo('')
          setErrors((prev) => {
            const next = { ...prev }
            delete next.complaintNo
            return next
          })
        } else {
          setSelectedComplaint(null)
          setComplaintError('This complaint is closed or resolved.')
        }
      } else {
        setSelectedComplaint(null)
        setComplaintError('Complaint not found.')
      }
    } catch (error) {
      setSelectedComplaint(null)
      setComplaintError('Complaint not found or invalid.')
    } finally {
      setVerifying(false)
    }
  }

  const handleComplaintVerify = (value: string) => {
    setComplaintSearch(value)
  }

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
    setComplaintError('')
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
    try {
      const payload = {
        complaint_id: selectedComplaint?.id,
        complaint_number: selectedComplaint?.complaint_no,
        date: formDate.toISOString(),
        capacity: capacityRight === false ? correctCapacity : selectedComplaint?.capacity,
        serial_no: serialNoRight === false ? correctSerialNo : selectedComplaint?.serialNo,
        phase: selectedComplaint?.phase,
        capacity_right: capacityRight,
        serial_no_right: serialNoRight,
        epc_name: epcName,
        epc_gst_no: epcGstNo,
        dispatch_address: dispatchAddress,
        pincode,
        state,
        client_contact_no: clientContactNo,
        type_of_form: typeOfForm,
        remarks: remark,
        is_form_fill: true,
        company_id: selectedComplaint?.company_id,
        location_id: selectedComplaint?.location_id,
        fin_year: selectedComplaint?.fin_year,
      }

      await post(CREATE_REPLACEMENT_DETAIL, payload)
      message.success('Replacement form submitted successfully.')
      resetForm()
    } catch (error) {
      console.error('Failed to submit form:', error)
      message.error('Failed to submit replacement form. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
                <span className="rounded-full bg-[#FFF7E6] px-3 py-1.5 text-xs font-extrabold text-[#D97706] shadow-[0_6px_14px_rgba(246,180,0,0.12)]">
                  Draft
                </span>
              }
            />

            <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-3">
              <InfoPill label="Date" value={formDate.format('DD MMM YYYY')} icon={<CheckCircleOutlined />} tone="green" />
              <InfoPill label="Status" value="Draft" icon={<FileTextOutlined />} tone="amber" />
            </div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-[#DCE2F1] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] max-sm:rounded-xl [&_.ant-card-body]:!p-0">
          <div className="grid gap-5 p-6 max-sm:gap-3 max-sm:p-3">
            <div className="rounded-xl border border-[#E5EAF4] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.035)] max-sm:p-4">
              <SectionTitle icon={<FileTextOutlined />} title="Request Information" subtitle="Generated request details and complaint selection" />

              <div className="mt-5 grid grid-cols-2 gap-4 max-lg:grid-cols-1 max-sm:grid-cols-1">
                <ReadOnlyField label="Date" value={formDate.format('DD MMM YYYY')} />

                <div>
                  <FieldLabel label="Complaint No" required />
                  <Input
                    size="large"
                    prefix={<SearchOutlined className="text-[#0B63CE]" />}
                    placeholder="Enter complaint number"
                    className="!rounded-xl"
                    value={complaintSearch}
                    onChange={(e) => handleComplaintVerify(e.target.value)}
                    disabled={verifying || !!complaintQuery}
                    status={errors.complaintNo || complaintError ? 'error' : undefined}
                  />
                  {(errors.complaintNo || complaintError) ? (
                    <span className="mt-1.5 block text-xs font-medium text-red-500">
                      {errors.complaintNo || complaintError}
                    </span>
                  ) : null}
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
                <div>
                  <FieldLabel label="Pincode" required />
                  <Select
                    showSearch
                    placeholder="6-digit pincode"
                    optionFilterProp="children"
                    className="w-full [&_.ant-select-selector]:!rounded-xl"
                    size="large"
                    value={pincode || undefined}
                    onChange={(val) => setPincode(val)}
                    status={errors.pincode ? 'error' : undefined}
                  >
                    {pincodes.map((p) => (
                      <Select.Option key={p.id} value={p.pinCode || p.pin_name}>
                        {p.pinCode || p.pin_name}
                      </Select.Option>
                    ))}
                  </Select>
                  {fieldError('pincode')}
                </div>

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
