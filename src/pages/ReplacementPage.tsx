import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Input, Select, message, Checkbox } from 'antd'
import dayjs from 'dayjs'
import axios from 'axios'

import { get, post } from '@/helpers/api_helper'
import { CREATE_REPLACEMENT_DETAIL, GET_COMPLAINT_BY_NO, GET_PIN_DROPDOWN, GET_COMPLAINTS } from '@/helpers/url_helper'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

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

type FormErrors = Record<string, string>

function ReplacementPage() {
  const [searchParams] = useSearchParams()
  const complaintQuery = searchParams.get('complaint_no')

  const [formDate] = useState(() => dayjs())

  const [complaintSearch, setComplaintSearch] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [complaintError, setComplaintError] = useState('')

  const [capacityRight, setCapacityRight] = useState<boolean | null>(true)
  const [serialNoRight, setSerialNoRight] = useState<boolean | null>(true)
  const [correctCapacity, setCorrectCapacity] = useState('')
  const [correctSerialNo, setCorrectSerialNo] = useState('')

  const [epcName, setEpcName] = useState('')
  const [epcGstNo, setEpcGstNo] = useState('')
  const [dispatchAddress, setDispatchAddress] = useState('')
  const [pincode, setPincode] = useState('')
  const [pincodeId, setPincodeId] = useState<string | null>(null)
  const [selectedPin, setSelectedPin] = useState<any>(null)
  const [clientContactNo, setClientContactNo] = useState('')
  const [typeOfForm, setTypeOfForm] = useState<string>('replacement')
  
  const [verifyGst, setVerifyGst] = useState(false)
  const [gstVerifyLoading, setGstVerifyLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [complaintOptions, setComplaintOptions] = useState<{ label: string, value: string }[]>([])
  const [fetchingComplaints, setFetchingComplaints] = useState(false)

  const [complaintPage, setComplaintPage] = useState(1)
  const [hasMoreComplaints, setHasMoreComplaints] = useState(true)
  const [complaintSearchTerm, setComplaintSearchTerm] = useState('')

  const fetchComplaints = useCallback(async (search = '', page = 1, append = false) => {
    setFetchingComplaints(true)
    try {
      const res = await get(`${GET_COMPLAINTS}?limit=10&page=${page}&search=${encodeURIComponent(search)}`)
      if (res.success && res.data) {
        const newOptions = res.data.map((c: any) => ({
          label: c.complaint_no,
          value: c.complaint_no
        }))
        setComplaintOptions(prev => append ? [...prev, ...newOptions] : newOptions)
        setHasMoreComplaints(page < (res.pagination?.totalPages || 1))
        setComplaintPage(page)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setFetchingComplaints(false)
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      fetchComplaints('', 1, false)
    }
  }, [fetchComplaints])

  const handlePopupScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 20) {
      if (hasMoreComplaints && !fetchingComplaints) {
        fetchComplaints(complaintSearchTerm, complaintPage + 1, true)
      }
    }
  }

  const handleDropdownSearch = (val: string) => {
    setComplaintSearchTerm(val)
    fetchComplaints(val, 1, false)
  }

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

  const [pincodes, setPincodes] = useState<any[]>([])
  const [fetchingPincodes, setFetchingPincodes] = useState(false)
  const [pincodePage, setPincodePage] = useState(1)
  const [hasMorePincodes, setHasMorePincodes] = useState(true)
  const [pincodeSearchTerm, setPincodeSearchTerm] = useState('')

  const pincodesReqRef = useRef(0)
  const fetchPincodes = useCallback(async (search = '', page = 1, append = false) => {
    const reqId = ++pincodesReqRef.current
    setFetchingPincodes(true)
    try {
      const res = await get(`${GET_PIN_DROPDOWN}?limit=50&page=${page}&search=${encodeURIComponent(search)}`)
      if (reqId !== pincodesReqRef.current) return // stale response, ignore
      if (res.status && res.data) {
        setPincodes(prev => append ? [...prev, ...res.data] : res.data)
        setHasMorePincodes(page < (res.pagination?.totalPages || 1))
        setPincodePage(page)
      }
    } catch (error) {
      if (reqId !== pincodesReqRef.current) return
      console.error(error)
    } finally {
      if (reqId === pincodesReqRef.current) setFetchingPincodes(false)
    }
  }, [])

  useEffect(() => {
    fetchPincodes('', 1, false)
  }, [fetchPincodes])

  const handlePincodePopupScroll = (e: any) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 20) {
      if (hasMorePincodes && !fetchingPincodes) {
        fetchPincodes(pincodeSearchTerm, pincodePage + 1, true)
      }
    }
  }

  const pincodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handlePincodeSearch = (val: string) => {
    setPincodeSearchTerm(val)
    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current)
    pincodeDebounceRef.current = setTimeout(() => {
      fetchPincodes(val, 1, false)
    }, 300)
  }

  const state = useMemo(() => {
    if (selectedPin) return selectedPin.state_id?.name || selectedPin.state_id?.state_name || ''
    return ''
  }, [selectedPin])

  const city = useMemo(() => {
    if (selectedPin) return selectedPin.city_id?.name || selectedPin.city_id?.city_name || ''
    return ''
  }, [selectedPin])

  const pincodeOptions = useMemo(() => {
    return pincodes.map(p => ({ value: p.id, label: String(p.pinCode || p.pin_name) }))
  }, [pincodes])

  const autoVerifyGstIfReady = async (rawGst: string, forceVerify = false) => {
    const gst = String(rawGst)
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .slice(0, 15)
    
    if (gst.length !== 15 || gstVerifyLoading) return
    if (!verifyGst && !forceVerify) return

    setGstVerifyLoading(true)
    try {
      const res = await axios.post("https://services.cygnux.in/api/gst", {
        api_key: "f1af2edece05bbd40a8f98002286446e",
        user_id: 17,
        gst: gst,
      })
      if (res.data?.status === 1 && !res.data?.response?.error) {
        const d = res.data?.response?.data || {}
        const tradeNam = d?.tradeNam || ""
        const lgnm = d?.lgnm || ""
        const addr = d?.pradr?.addr || {}
        const fullAddress = [
          addr?.bnm,
          addr?.flno,
          addr?.bno,
          addr?.st,
          addr?.loc,
          addr?.dst,
          addr?.stcd,
          addr?.pncd,
        ].filter(Boolean).join(", ")

        if (tradeNam || lgnm) {
          setEpcName(tradeNam || lgnm)
        }
        if (fullAddress.trim()) {
          setDispatchAddress(fullAddress.trim())
        }
        if (addr?.pncd) {
          setPincode(addr.pncd)
          handlePincodeSearch(addr.pncd)
        }
        message.success("GST verified and details autofilled")
      } else {
        const msg = res.data?.message || res.data?.response?.error || "GST verification failed"
        message.error(msg)
      }
    } catch (e: any) {
      message.error(e?.message || "GST verification failed")
    } finally {
      setGstVerifyLoading(false)
    }
  }

  useEffect(() => {
    if (complaintQuery) {
      setComplaintSearch(complaintQuery)
    }
  }, [complaintQuery])

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
      const token = localStorage.getItem('authToken')
      const url = token
        ? `${GET_COMPLAINT_BY_NO}?complaintNo=${encodeURIComponent(value)}`
        : `${GET_COMPLAINT_BY_NO}/${encodeURIComponent(value)}`
      const res = await get(url)
      const complaint = res.data

      if (complaint) {
        if (complaint.is_form_fill) {
          setSelectedComplaint(null)
          setComplaintError('A replacement request has already been submitted for this complaint.')
          setVerifying(false)
          return
        }

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
          setCapacityRight(true)
          setSerialNoRight(true)
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
    if (!epcGstNo.trim()) {
      newErrors.epcGstNo = 'GST number is required'
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(epcGstNo)) {
      newErrors.epcGstNo = 'Invalid GST format (e.g. 22AAAAA0000A1Z5)'
    }
    if (!dispatchAddress.trim()) newErrors.dispatchAddress = 'Dispatch address is required'
    if (!pincode.trim() || pincode.length !== 6) newErrors.pincode = 'Valid pincode is required'
    if (!state) newErrors.state = 'State is required'
    if (!city) newErrors.city = 'City is required'
    if (!clientContactNo.trim() || clientContactNo.length !== 10) {
      newErrors.clientContactNo = 'Valid contact number is required'
    } else if (!/^[6-9][0-9]{9}$/.test(clientContactNo)) {
      newErrors.clientContactNo = 'Must start with 6, 7, 8, or 9'
    }
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
    city,
    state,
    clientContactNo,
    typeOfForm,
  ])

  const resetForm = () => {
    setComplaintSearch('')
    setSelectedComplaint(null)
    setComplaintError('')
    setCapacityRight(true)
    setSerialNoRight(true)
    setCorrectCapacity('')
    setCorrectSerialNo('')
    setEpcName('')
    setEpcGstNo('')
    setDispatchAddress('')
    setPincode('')
    setPincodeId(null)
    setSelectedPin(null)
    setClientContactNo('')
    setTypeOfForm('replacement')
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
        pincode_id: pincodeId,
        state,
        city,
        client_contact_no: clientContactNo,
        type_of_form: typeOfForm,
        is_form_fill: true,
        company_id: selectedComplaint?.company_id,
        location_id: selectedComplaint?.location_id,
        fin_year: selectedComplaint?.fin_year,
      }

      await post(CREATE_REPLACEMENT_DETAIL, payload)
      message.success('Replacement form submitted successfully.')
      resetForm()
    } catch (error: any) {
      console.error('Failed to submit form:', error)
      const errorMsg = error?.response?.data?.message || 'Failed to submit replacement form. Please try again.'
      message.error(errorMsg)
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
    <div className="replacement-page bg-[#F1F3FC] min-h-[calc(100vh-72px)] p-6 max-sm:p-4 pb-24 max-sm:pb-20 text-[#374151] font-sans flex flex-col">
      <div className="mx-auto w-full max-w-[1400px] flex flex-col gap-6 flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-[#111827] m-0">Replacement Form</h1>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-[6px] px-4 py-2 min-w-[140px] shadow-sm h-[60px] justify-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">DATE</span>
              <span className="text-[13px] font-semibold text-gray-800">{formDate.format('DD MMM YYYY')}</span>
            </div>

            <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-[6px] px-4 py-2 min-w-[140px] shadow-sm h-[60px] justify-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">TYPE OF FORM</span>
              <span className="text-[13px] font-semibold text-gray-800">Replacement</span>
            </div>

            <div className="flex flex-col gap-1 min-w-[180px] max-w-[280px]">
              <div className={`flex flex-col items-center text-center bg-white border rounded-[6px] px-4 py-2 w-full shadow-sm h-[60px] justify-center ${errors.complaintNo || complaintError ? 'border-red-400' : 'border-gray-200'}`}>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex gap-1 justify-center w-full">COMPLAINT NO <span className="text-red-500">*</span></span>
                {localStorage.getItem('authToken') ? (
                  <Select
                    showSearch
                    variant="borderless"
                    className="w-full text-center [&_.ant-select-selector]:!p-0 [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-gray-800 [&_.ant-select-selection-item]:!text-[13px] [&_.ant-select-selection-search-input]:!text-center [&_.ant-select-arrow]:!hidden"
                    placeholder="Select complaint"
                    value={complaintSearch || undefined}
                    onChange={(val) => handleComplaintVerify(val)}
                    onSearch={(val) => {
                      handleComplaintVerify(val)
                      handleDropdownSearch(val)
                    }}
                    onPopupScroll={handlePopupScroll}
                    suffixIcon={null}
                    showArrow={false}
                    listHeight={250}
                    dropdownClassName="[&_.ant-select-item]:!text-center"
                    filterOption={false}
                    options={complaintOptions}
                    loading={fetchingComplaints}
                    disabled={verifying || !!complaintQuery}
                  />
                ) : (
                  <Input
                    variant="borderless"
                    className="!p-0 !font-semibold text-gray-800 text-[13px] placeholder:font-normal placeholder:text-gray-400 !bg-transparent h-auto leading-tight text-center disabled:!text-gray-800 disabled:!opacity-100 [&_input]:disabled:!text-gray-800"
                    placeholder="Enter complaint number"
                    value={complaintSearch}
                    onChange={(e) => handleComplaintVerify(e.target.value)}
                    disabled={verifying || !!complaintQuery}
                  />
                )}
              </div>
              {(errors.complaintNo || complaintError) && (
                <span className="text-[11px] text-red-500 text-center leading-tight mt-0.5">
                  {errors.complaintNo || complaintError}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Box */}
        <div className="rounded-[12px] bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#FAFAFA] px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5C6BC0] text-white">
              <FileTextOutlined className="text-[13px]" />
            </div>
            <h2 className="text-[15px] font-bold text-gray-800">Replacement Details</h2>
          </div>

          <div className="p-6 grid gap-6">
            <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <ReadOnlyField label="Capacity" value={selectedComplaint?.capacity || 'N/A'} />
              <ReadOnlyField label="Serial no" value={selectedComplaint?.serialNo || 'N/A'} />
              <ReadOnlyField label="Phase" value={selectedComplaint?.phase || 'N/A'} />
              <FormInput
                label="Client contact no"
                required
                value={clientContactNo}
                onChange={(val) => {
                  const raw = val.replace(/\D/g, '')
                  let formatted = ''
                  for (let i = 0; i < raw.length; i++) {
                    const char = raw[i]
                    if (i === 0) {
                      if (/[6-9]/.test(char)) formatted += char
                    } else {
                      formatted += char
                    }
                  }
                  setClientContactNo(formatted)
                }}
                error={errors.clientContactNo}
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 items-start">
              <ToggleField label="Capacity right?" value={capacityRight} onChange={setCapacityRight} error={errors.capacityRight} />
              <ToggleField label="Serial no right?" value={serialNoRight} onChange={setSerialNoRight} error={errors.serialNoRight} />
              <FormInput label="EPC name" required value={epcName} onChange={setEpcName} error={errors.epcName} />
              <div>
                <FieldLabel label="EPC GST no" required />
                <Input
                  className="h-10 !rounded-lg !border-gray-300 !bg-[#F9FAFB] hover:!border-gray-400 focus:!border-[#5C6BC0] focus:!bg-white text-[13px]"
                  required
                  value={epcGstNo}
                  onChange={(e) => {
                    const val = e.target.value
                    const raw = val.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    let formatted = ''
                    for (let i = 0; i < raw.length; i++) {
                      const char = raw[i]
                      if (i < 2) {
                        if (/[0-9]/.test(char)) formatted += char
                      } else if (i < 7) {
                        if (/[A-Z]/.test(char)) formatted += char
                      } else if (i < 11) {
                        if (/[0-9]/.test(char)) formatted += char
                      } else if (i === 11) {
                        if (/[A-Z]/.test(char)) formatted += char
                      } else if (i === 12) {
                        if (/[1-9A-Z]/.test(char)) formatted += char
                      } else if (i === 13) {
                        if (char === 'Z') formatted += char
                      } else if (i === 14) {
                        if (/[A-Z0-9]/.test(char)) formatted += char
                      }
                    }
                    setEpcGstNo(formatted)
                    if (formatted.length === 15) {
                      autoVerifyGstIfReady(formatted)
                    }
                  }}
                  status={errors.epcGstNo ? 'error' : undefined}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  maxLength={15}
                  disabled={gstVerifyLoading}
                />
                {errors.epcGstNo && <span className="mt-1 block text-xs text-red-500">{errors.epcGstNo}</span>}
                {gstVerifyLoading && <span className="mt-1 block text-xs text-blue-500">Verifying GST...</span>}
              </div>
            </div>

            {/* Conditional inputs if toggles are false */}
            {(capacityRight === false || serialNoRight === false) && (
              <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {capacityRight === false ? <FormInput label="Correct Capacity" required value={correctCapacity} onChange={setCorrectCapacity} error={errors.correctCapacity} /> : <div />}
                {serialNoRight === false ? <FormInput label="Correct Serial No" required value={correctSerialNo} onChange={setCorrectSerialNo} error={errors.correctSerialNo} /> : <div />}
              </div>
            )}

            <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <div>
                <FieldLabel label="Pincode" required />
                <Select
                  showSearch
                  placeholder="Pincode"
                  className="w-full h-10 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#F9FAFB] hover:[&_.ant-select-selector]:!border-gray-400 [&_.ant-select-selector]:!border-gray-300 [&_.ant-select-selector]:!h-10 [&_.ant-select-selection-item]:!leading-[38px] text-[13px]"
                  value={pincodeId || undefined}
                  onChange={(val) => {
                    const pin = pincodes.find(p => p.id === val)
                    if (pin) {
                      setPincodeId(pin.id)
                      setPincode(String(pin.pinCode || pin.pin_name || ''))
                      setSelectedPin(pin)
                    }
                  }}
                  onInputKeyDown={(e) => {
                    const key = e.key
                    if (
                      !/^[0-9]$/.test(key) &&
                      key !== 'Backspace' &&
                      key !== 'Delete' &&
                      key !== 'ArrowLeft' &&
                      key !== 'ArrowRight' &&
                      key !== 'Tab' &&
                      key !== 'Enter'
                    ) {
                      e.preventDefault()
                    }
                  }}
                  onSearch={(val) => {
                    const digits = val.replace(/\D/g, '')
                    handlePincodeSearch(digits)
                  }}
                  onPopupScroll={handlePincodePopupScroll}
                  filterOption={false}
                  loading={fetchingPincodes}
                  status={errors.pincode ? 'error' : undefined}
                  options={pincodeOptions}
                />
                {fieldError('pincode')}
              </div>
              <ReadOnlyField label="City" value={city || ''} />
              <ReadOnlyField label="State" value={state || ''} />
              <div>
                <div className="block text-[12px] font-medium mb-1 h-[18px]"></div>
                <div className="h-10 flex items-center">
                  <Checkbox 
                    className="text-[13px] text-gray-700 font-medium"
                    checked={verifyGst} 
                    onChange={e => {
                      const checked = e.target.checked
                      setVerifyGst(checked)
                      if (checked && epcGstNo.length === 15) {
                        autoVerifyGstIfReady(epcGstNo, true)
                      }
                    }}
                  >
                    Verify GST?
                  </Checkbox>
                </div>
              </div>
            </div>

            <div>
              <FieldLabel label="Dispatch address" required />
              <TextArea
                rows={3}
                className="!border-gray-300 !rounded-lg !bg-[#F9FAFB] hover:!border-gray-400 focus:!border-[#5C6BC0] focus:!bg-white text-[13px]"
                value={dispatchAddress}
                onChange={(e) => setDispatchAddress(e.target.value)}
                status={errors.dispatchAddress ? 'error' : undefined}
              />
              {fieldError('dispatchAddress')}
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[40] border-t border-gray-200 bg-white px-6 py-4 max-sm:px-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="w-full flex justify-end">
          <Button
            buttonVariant="primary"
            isLoading={submitting}
            onClick={handleSubmit}
            disabled={!selectedComplaint || !!complaintError}
            className="!h-10 !rounded-lg !border-0 !bg-[#5C6BC0] !px-8 !font-semibold !text-white hover:!bg-[#4F5B93] disabled:!bg-[#9CA3AF] disabled:!cursor-not-allowed disabled:!opacity-70"
          >
            Submit Form
          </Button>
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="mb-2 block text-[12px] font-medium text-gray-500">
      {label}
      {required && <span className="ml-1 text-red-400">*</span>}
    </label>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel label={label} />
      <div className="flex h-10 items-center rounded-lg border border-gray-300 bg-[#F9FAFB] px-3 text-[13px] font-medium text-gray-700">
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
        maxLength={maxLength}
        className="h-10 !rounded-lg !border-gray-300 !bg-[#F9FAFB] hover:!border-gray-400 focus:!border-[#5C6BC0] focus:!bg-white text-[13px]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        status={error ? 'error' : undefined}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </div>
  )
}

function YesNoToggle({ value, onChange }: { value?: 'Yes' | 'No'; onChange: (v: 'Yes' | 'No') => void }) {
  return (
    <div className="flex w-full max-w-[200px] h-[42px] rounded-[10px] bg-[#F3F4F6] p-[4px] border border-gray-200">
      <button
        type="button"
        onClick={() => onChange('Yes')}
        className={`flex-1 flex items-center justify-center gap-2 rounded-[6px] text-[13px] font-medium transition-all duration-200 ${value === 'Yes' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        <CheckCircleOutlined className="text-[14px]" />
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange('No')}
        className={`flex-1 flex items-center justify-center gap-2 rounded-[6px] text-[13px] font-medium transition-all duration-200 ${value === 'No' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        <CloseCircleOutlined className="text-[14px]" />
        No
      </button>
    </div>
  )
}

function ToggleField({ label, value, onChange, error }: { label: string, value: boolean | null, onChange: (v: boolean) => void, error?: string }) {
  return (
    <div>
      <FieldLabel label={label} required />
      <YesNoToggle value={value === true ? 'Yes' : value === false ? 'No' : undefined} onChange={(v) => onChange(v === 'Yes')} />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </div>
  )
}

export default ReplacementPage
