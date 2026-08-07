import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { get } from '@/helpers/api_helper'
import { message, Spin, Button } from 'antd'
import { ArrowLeftOutlined, EnvironmentFilled, MailFilled, FacebookFilled, TwitterOutlined, InstagramOutlined, LinkedinFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import html2pdf from 'html2pdf.js'

interface Props {
  id?: string;
  autoDownload?: boolean;
  onDownloaded?: () => void;
  onBlobGenerated?: (blob: Blob) => void;
  isEmbedded?: boolean;
}

const WarrantyCardPrint = ({ id: propId, autoDownload, onDownloaded, onBlobGenerated, isEmbedded }: Props) => {
  const params = useParams<{ id: string }>()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const isAutoDownload = autoDownload || queryParams.get('autoDownload') === 'true'

  const id = propId || params.id
  const navigate = useNavigate()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)
  const isGenerating = useRef(false)
  const onDownloadedRef = useRef(onDownloaded)
  const onBlobGeneratedRef = useRef(onBlobGenerated)

  useEffect(() => {
    onDownloadedRef.current = onDownloaded
  }, [onDownloaded])

  useEffect(() => {
    onBlobGeneratedRef.current = onBlobGenerated
  }, [onBlobGenerated])

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const res = await get(`/customer-product/warranty/${id}`)
        if (res.status && res.data) {
          setRequest(res.data)
        } else {
          message.error(res.message || 'Failed to fetch request details')
          if (isAutoDownload && onDownloadedRef.current) onDownloadedRef.current();
        }
      } catch (error: any) {
        console.error('Error fetching request details:', error)
        message.error(error?.response?.data?.message || 'Could not load replacement request details.')
        if (isAutoDownload && onDownloadedRef.current) onDownloadedRef.current();
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchRequestDetails()
  }, [id]) // Removed autoDownload and onDownloaded from dependencies

  useEffect(() => {
    if ((isAutoDownload || onBlobGeneratedRef.current) && request && !loading && printRef.current && !isGenerating.current) {
      isGenerating.current = true;
      setTimeout(() => {
        const element = printRef.current;
        const opt: any = {
          margin: 0,
          filename: `Warranty_Card_${request.serial_number || 'download'}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 4, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
        };

        if (onBlobGeneratedRef.current) {
          html2pdf().set(opt).from(element).output('blob').then((pdfBlob: Blob) => {
            isGenerating.current = false;
            if (onBlobGeneratedRef.current) onBlobGeneratedRef.current(pdfBlob);
          }).catch(() => {
            // fallback for older html2pdf versions
            html2pdf().set(opt).from(element).outputPdf('blob').then((pdfBlob: Blob) => {
              isGenerating.current = false;
              if (onBlobGeneratedRef.current) onBlobGeneratedRef.current(pdfBlob);
            });
          });
        } else {
          html2pdf().set(opt).from(element).save().then(() => {
            isGenerating.current = false;
            if (onDownloadedRef.current) onDownloadedRef.current();
          });
        }
      }, 500); // small delay to ensure images load
    }
  }, [isAutoDownload, request, loading])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!request) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Request not found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const productName = request.model || request.product_name || 'N/A'
  const warrantyDate = request.warranty_start_date ? dayjs(request.warranty_start_date).format('DD-MM-YYYY') : dayjs(request.created_at).format('DD-MM-YYYY')
  const warrantyEndDate = request.warranty_end_date ? dayjs(request.warranty_end_date).format('DD-MM-YYYY') : 'N/A'
  const clientName = request.customer_name || 'N/A'
  const address = [request.address_line_1, request.address_line_2, request.city, request.state, request.pincode].filter(val => val && val !== '-' && val !== 'null').join(', ') || 'N/A'
  const serialNumber = request.serial_number || ''

  return (
    <div style={{ backgroundColor: isEmbedded ? 'transparent' : '#f0f2f5', minHeight: isEmbedded ? 'auto' : '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-area, .printable-area * {
              visibility: visible;
            }
            .printable-area {
              position: relative !important;
              left: 0;
              top: 0;
              width: 100%;
              background-color: white !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .no-print-padding {
              padding: 0 !important;
              display: block !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
          }
          
          .warranty-content p {
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.5;
            color: #333;
          }
          .warranty-content ul {
            margin-top: 4px;
            margin-bottom: 12px;
            padding-left: 20px;
          }
          .warranty-content li {
            font-size: 13px;
            margin-bottom: 4px;
            color: #333;
          }
          .warranty-content h4 {
            margin-top: 16px;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #000;
          }
        `}
      </style>

      {!isEmbedded && (
        <div className="no-print" style={{ padding: '16px 24px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1)
              } else {
                window.close()
              }
            }}>Back</Button>
            <h3 style={{ margin: 0 }}>Warranty Card Preview</h3>
          </div>
          <Button 
            type="primary" 
            onClick={() => {
              if (printRef.current && !isGenerating.current) {
                isGenerating.current = true;
                const opt: any = {
                  margin: 0,
                  filename: `Warranty_Card_${request?.serial_number || 'download'}.pdf`,
                  image: { type: 'jpeg', quality: 1 },
                  html2canvas: { scale: 4, useCORS: true, letterRendering: true },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
                };
                html2pdf().set(opt).from(printRef.current).save().then(() => {
                  isGenerating.current = false;
                });
              }
            }}
          >
            Download PDF
          </Button>
        </div>
      )}

      <div style={{ flex: 1, padding: isEmbedded ? '0' : '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: isEmbedded ? 'transparent' : '#f0f2f5' }} className="no-print-padding">
        <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', width: '210mm', height: '891mm', overflow: 'hidden', backgroundColor: 'white' }}>
          <div
            className="printable-area"
            style={{
              width: '210mm',
              height: '297mm',
              backgroundColor: 'white',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Cover Page */}
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src="/warranty-cover.png"
                alt="Warranty Cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div style="text-align: center; padding: 20px;"><p>Please place the cover image as "warranty-cover.png" in the public folder.</p></div>';
                }}
              />
            </div>
          </div>

          <div
            className="printable-area"
            style={{
              width: '210mm',
              height: '297mm',
              overflow: 'hidden',
              backgroundColor: 'white',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Main Content Page */}
            <div className="warranty-content" style={{ fontFamily: 'Arial, sans-serif', padding: '40px 50px', minHeight: '297mm', position: 'relative' }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '20px' }}>
                Thank you for purchasing our product & welcome to the family of VSOLE SOLAR ENERGY PVT. LTD.
              </p>

              <h4 style={{ marginTop: 0 }}>Warranty Terms:</h4>
              <ul>
                <li>Applicable for Manufacturing Defect/workmanship under normal condition from date of supply.</li>
                <li>The company may repair or replace faulty components at its discretion free of cost.</li>
                <li>In case of old, totally damaged unit the Inverter should be send to factory for repair.</li>
                <li>The Warranty covers the cost of repairs or replacement parts. The Goods must be returned to the Company for inspection.</li>
              </ul>

              <h4>1. Warranty Limitations</h4>
              <ul>
                <li>The Warranty is not transferable and applies to brand new Goods only.</li>
                <li>Defective parts replaced under Warranty become the property of the Company.</li>
                <li>The Warranty is valid only for Goods purchased either directly from the Company or from an authorized reseller/Distributor of the company</li>
              </ul>

              <h4>2. Warranty Extension</h4>
              <ul>
                <li>Can be given upto <strong>10 years by extended warranty</strong> with the additional cost.</li>
                <li style={{ listStyle: 'none', marginLeft: '-20px', marginTop: '4px' }}>Contact: <strong>info@vsolesolar.com</strong></li>
              </ul>

              <h4>3. Warning</h4>
              <p>
                We strongly recommend to use SPD's, LA's, AC Cables as given in manual with proper Lugs Crimping. Also to use SPD's/Fuses compulsory in maximum voltage fluctuation area. If you are not using ACDB/DCDB then it is compulsory to use MCB's/DC fuse respectively in unstable grid condition.
              </p>

              <h4>4. Warranty Claims Procedure</h4>
              <p>To make a warranty claim the following information needs to be provided:</p>
              <ul>
                <li>Completed Inspection Form (can be downloaded from www.vsolesolar.com with Sr.No., Date of purchase, Invoice copy etc. to be mailed.</li>
                <li>Copy of the installation report and Warranty certificate</li>
              </ul>

              <p style={{ marginTop: '16px', marginBottom: '30px' }}>
                The company engineer / authorized reseller will liaise with the Company regarding repair or replacement. The cost of repair or replacement will be borne by the Company provided the Warranty has been validated as per above terms and the Warranty period has not expired. Where repairs or replacements are not reasonably possible, the Company will endeavor to mitigate the loss in another way.
              </p>

              <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: 'bold', width: '100px', fontSize: '14px', paddingBottom: '5px' }}>Model No :</span>
                  <span style={{ fontSize: '14px', borderBottom: '1px solid #000', flex: 1, paddingBottom: '5px', marginRight: '20px' }}>
                    {productName}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', marginRight: '10px', paddingBottom: '5px' }}>Date :</span>
                  <span style={{ fontSize: '14px', borderBottom: '1px solid #000', width: '85px', paddingBottom: '5px', marginRight: '20px', textAlign: 'center' }}>
                    {warrantyDate}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', marginRight: '10px', paddingBottom: '5px' }}>Warranty Expiry :</span>
                  <span style={{ fontSize: '14px', borderBottom: '1px solid #000', width: '85px', paddingBottom: '5px', textAlign: 'center' }}>
                    {warrantyEndDate}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: 'bold', width: '100px', fontSize: '14px', paddingBottom: '5px' }}>Client Name :</span>
                  <span style={{ fontSize: '14px', borderBottom: '1px solid #000', flex: 1, paddingBottom: '5px' }}>
                    {clientName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: 'bold', width: '100px', fontSize: '14px', paddingBottom: '5px' }}>Address :</span>
                  <span style={{ fontSize: '14px', borderBottom: '1px solid #000', flex: 1, paddingBottom: '5px', minHeight: '20px' }}>
                    {address}
                  </span>
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: '40px', left: '50px', right: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ width: '100px', height: '100px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                      src="/logo.png"
                      alt="VSOLE Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', zIndex: 2 }}
                      onLoad={(e) => {
                        const span = e.currentTarget.nextElementSibling as HTMLElement;
                        if (span) span.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const span = e.currentTarget.nextElementSibling as HTMLElement;
                        if (span) span.style.display = 'flex';
                      }}
                    />
                    <span style={{ fontSize: '10px', textAlign: 'center', color: '#183365', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #183365', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="logo-alt-text">
                      LOGO HERE
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', color: '#183365', fontWeight: 'bold', fontSize: '12px' }}>
                  www.vsolesolar.com | Toll Free: 1800 120 9697
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <div style={{ height: '8px', backgroundColor: '#e89c31', width: '100%' }}></div>
                <div style={{ height: '24px', backgroundColor: '#183365', width: '100%' }}></div>
              </div>

            </div>
          </div>

          {/* Third Page - Specifications & Exclusions */}
          <div
            className="printable-area"
            style={{
              width: '210mm',
              height: '297mm',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Top Half - White Background */}
            <div style={{ padding: '40px 50px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Left Side - Table */}
                <div style={{ width: '50%' }}>
                  <div style={{ border: '2px solid black', borderRadius: '6px', overflow: 'hidden', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#d9dadaff', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '2px solid black' }}>
                      <img src="/logo-black.png" alt="VSOLE SOLAR" style={{ height: '48px', mixBlendMode: 'multiply' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML += '<h2 style="margin:0;">VSOLE SOLAR</h2>' }} />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '11.5px', fontFamily: 'Arial, sans-serif', backgroundColor: '#d9dadaff', color: 'black' }}>
                      <tbody>
                        <tr>
                          <td colSpan={2} style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle', fontWeight: 'bold' }}>Product : Grid Tie Inverter/ 1Phs/ V3</td>
                        </tr>
                        <tr>
                          <td rowSpan={2} style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle', fontWeight: 'bold', width: '45%' }}>Model No.</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle', fontWeight: 'bold' }}>1.0 KW</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>VS-101S</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Max. DC Power</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>1.1 kW</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Max. PV Current</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>20 A X 1</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>PV Short Circuit Current</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>30 A X 1</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Total String</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>1</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Max. DC Voltage</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>550V</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>MPPT Range</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>70-550V</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Max. Output Power</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>1.0 kW</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Max. Output Current</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>4.83 A</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Vac/Fac</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>230 Vac/50 Hz</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Power Factor</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>+/-(0.8%)</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Ambient Temp.</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>-25°C~+65°C</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>IP Standard</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>IP 65</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Standard</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>IEC60068/IEC61683<br />IEC62116/IEC61727</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>Mfg. Month/Year</td>
                          <td style={{ border: '1px solid black', padding: '6px 4px', verticalAlign: 'middle' }}>-</td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ border: '1px solid black', padding: '10px 4px 6px 4px', textAlign: 'center', fontWeight: 'bold' }}>TOLL FREE - 1800 120 9697</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side - Serial and Warranty Badge */}
                <div style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ backgroundColor: '#d9dadaff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '28px', marginBottom: '180px', width: '100%', maxWidth: '260px', height: '60px', color: 'black', borderRadius: '6px' }}>
                    {serialNumber}
                  </div>

                  <div style={{ marginRight: '60px', position: 'relative', width: '200x', height: '200px', minWidth: '150px', minHeight: '150px', flexShrink: 0 }}>
                    {/* The circular text image around the logo */}
                    <img src="/warranty-badge.png" alt="10 Years Warranty" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div style="width:220px; height:220px; border-radius:50%; border:2px solid #183365; display:flex; justify-content:center; align-items:center; flex-direction:column; color:#183365; text-align:center;"><div style="font-weight:bold; font-size:32px;">10*</div><div style="font-size:16px;">YEARS<br/>WARRANTY</div></div>';
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Half - Blue Background with Exclusions */}
            <div style={{ backgroundColor: '#3c5a84', color: 'white', padding: '40px 50px', fontFamily: 'Arial, sans-serif' }}>
              <h4 style={{ color: '#eab308', marginTop: 0, marginBottom: '15px', fontSize: '15px' }}>The Warranty does not cover.</h4>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '12px', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Damage/loss to Goods caused by misuse, Improper handling, unauthorized modification, accidental or willful damage</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Damage/loss of goods due to not connecting external protections like SPD, MCB MCCB, RCB, AC/DC Earthling, Lighting arrester, High string voltage, exceeding the VOC limits at DC side (Except installation done by company)</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Warranty does not include if AC voltage goes above 300V</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- External protection accessories to installation not supplied by the Company</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Claims by third parties other than the Customer</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Consequential damages including but not limited to loss of revenue</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Service may be delayed due to natural calamities and pandemic situations due to act of god such as Earth quake, droughts, flood, drains, cyclone, strikes, heavy rain, lockdown etc.</li>
                <li style={{ marginBottom: '8px', paddingLeft: '12px', textIndent: '-12px' }}>- Company will not be responsible for any generation losses held due to permissible delay in service.</li>
              </ul>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'white' }}>VSOLE SOLAR ENERGY PVT. LTD.</h3>
                  <div style={{ fontSize: '11px', display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <EnvironmentFilled style={{ color: '#eab308', marginRight: '8px', fontSize: '14px', marginTop: '2px' }} />
                    <span style={{ lineHeight: '1.5' }}>2, Anthem business park-1, Near<br />Nayara Petrol Pump, Simada - Canal Road,<br />Kosmada, Surat- 395006, Gujarat, India</span>
                  </div>
                  <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
                    <MailFilled style={{ color: '#eab308', marginRight: '8px', fontSize: '14px' }} />
                    <span>info@vsolesolar.com</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: 'white' }}>www.vsolesolar.com</h3>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'white' }}>Toll Free: 1800 120 9697</h4>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', color: '#eab308', fontSize: '14px', marginTop: '5px' }}>
                    <FacebookFilled /> <TwitterOutlined /> <InstagramOutlined /> <LinkedinFilled />
                    <span style={{ color: 'white', fontSize: '12px', marginLeft: '4px', fontWeight: 'bold' }}>/vsolesolar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default WarrantyCardPrint
