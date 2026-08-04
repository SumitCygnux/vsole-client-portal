import { Form, Input, Button, DatePicker, message, Card, Typography, Descriptions, Checkbox, Divider, Upload } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../../helpers/api_helper'
import { GET_PRODUCT_BY_SN, REGISTER_WARRANTY } from '../../helpers/url_helper'
import { SearchOutlined, CheckCircleOutlined, SettingOutlined, SafetyCertificateOutlined, CloudUploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export default function RegisterProduct() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [productDetails, setProductDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)
  const invoiceFile = Form.useWatch('invoiceFile', form)

  const handleFetchProduct = async () => {
    const sn = form.getFieldValue('serialNumber')
    if (!sn) return message.error('Enter serial number first')

    setLoading(true)
    try {
      const data = await get(`${GET_PRODUCT_BY_SN}/${sn}`)
      if (data.status) {
        setProductDetails(data.data)
        message.success('Product details fetched')
      } else {
        message.error(data.message || 'Product not found')
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const onFinish = async (values: any) => {
    if (!productDetails) return message.error('Fetch product details first')
    const customerId = localStorage.getItem('customerId')
    if (!customerId) return message.error('Not logged in')

    setRegistering(true)
    try {
      const formData = new FormData();
      formData.append('customer_id', customerId);
      formData.append('serial_number', productDetails.serial_number);
      formData.append('product_id', productDetails.id);
      formData.append('purchase_date', values.purchaseDate.format('YYYY-MM-DD'));
      formData.append('dealer_name', values.dealerName);
      formData.append('seller_phone_number', values.sellerPhone);

      if (values.invoiceFile && values.invoiceFile.fileList && values.invoiceFile.fileList.length > 0) {
        formData.append('invoice_file', values.invoiceFile.fileList[0].originFileObj);
      }

      const data = await post(REGISTER_WARRANTY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data.status) {
        message.success('Warranty Registered Successfully!')
        navigate('/customer-dashboard')
      } else {
        message.error(data.message)
      }
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div style={{
      height: '100%',
      minHeight: 'calc(100vh - 150px)',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '30px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: `'Inter', sans-serif`,
      borderRadius: '8px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '650px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: 'none',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '15px' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>Register Warranty</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>Activate protection for your solar product</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <Form.Item
              label={<Text strong>Serial Number</Text>}
              name="serialNumber"
              rules={[{ required: true, message: 'Please enter serial number' }]}
              normalize={(value) => (value || '').replace(/\s/g, '')}
              style={{ flex: 1, margin: 0 }}
            >
              <Input
                size="large"
                placeholder="Enter 10-digit serial number"
                style={{ borderRadius: '8px' }}
                prefix={<SettingOutlined style={{ color: '#bfbfbf' }} />}
                maxLength={10}
              />
            </Form.Item>
            <Button
              size="large"
              type="primary"
              onClick={handleFetchProduct}
              loading={loading}
              style={{ marginTop: '30px', borderRadius: '8px', padding: '0 25px' }}
              icon={<SearchOutlined />}
            >
              Verify
            </Button>
          </div>

          {productDetails && (
            <div style={{
              marginTop: '25px',
              marginBottom: '25px',
              padding: '20px',
              background: 'linear-gradient(to right, #ffffff, #f9fbfd)',
              borderRadius: '12px',
              border: '1px solid #e6ebf1',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}>
              <Title level={5} style={{ marginTop: 0, color: '#1890ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleOutlined /> Verified Product Details
              </Title>
              <Divider style={{ margin: '12px 0' }} />
              <Descriptions size="small" column={2} layout="vertical">
                {productDetails.product_name && (
                  <Descriptions.Item label={<Text type="secondary">Product Name</Text>}>
                    <Text strong>{productDetails.product_name}</Text>
                  </Descriptions.Item>
                )}
                {productDetails.product_type && (
                  <Descriptions.Item label={<Text type="secondary">Product Type</Text>}>
                    <Text strong>{productDetails.product_type}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={<Text type="secondary">Warranty Period</Text>}>
                  <Text strong style={{ color: '#52c41a' }}>{productDetails.warranty_months} Months</Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <Divider dashed />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
            <Form.Item label={<Text strong>Purchase Date</Text>} name="purchaseDate" rules={[{ required: true, message: 'Select date' }]} style={{ minWidth: 0 }}>
              <DatePicker size="large" style={{ width: '100%', borderRadius: '8px' }} />
            </Form.Item>

            <Form.Item
              label={<Text strong>Invoice Upload</Text>}
              name="invoiceFile"
              valuePropName="file"
              rules={[{ required: true, message: 'Please upload the invoice' }]}
              style={{ minWidth: 0 }}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ width: '100%' }}
                itemRender={(_originNode, file, _fileList, actions) => (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 14px',
                    height: '40px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    width: '100%',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <PaperClipOutlined style={{ color: '#3b82f6', fontSize: '16px', flexShrink: 0 }} />
                      <Text ellipsis style={{ margin: 0, fontWeight: 500, color: '#334155', flex: 1, minWidth: 0 }} title={file.name}>
                        {file.name}
                      </Text>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={actions.remove}
                      size="small"
                      style={{ flexShrink: 0 }}
                    />
                  </div>
                )}
              >
                {(!invoiceFile || !invoiceFile.fileList || invoiceFile.fileList.length === 0) && (
                  <Button
                    icon={<CloudUploadOutlined style={{ fontSize: '18px' }} />}
                    size="large"
                    style={{
                      borderRadius: '8px',
                      width: '100%',
                      minWidth: '200px',
                      border: '1px dashed #3b82f6',
                      color: '#3b82f6',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.3s'
                    }}
                  >
                    Click to Upload Invoice
                  </Button>
                )}
              </Upload>
            </Form.Item>
          </div>

          <Form.Item label={<Text strong>Dealer / Shop Name</Text>} name="dealerName" rules={[{ required: true, message: 'Please enter dealer name' }]}>
            <Input size="large" placeholder="E.g. Sunrise Solar Solutions" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item label={<Text strong>Seller Phone Number</Text>} name="sellerPhone" rules={[{ required: true, message: 'Please enter phone number' }]}>
            <Input size="large" placeholder="+91 XXXXX XXXXX" style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item
            name="acceptTerms"
            valuePropName="checked"
            rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions')) }]}
            style={{ marginTop: '30px' }}
          >
            <Checkbox>
              <Text>I accept the <a href="#" style={{ color: '#1890ff' }}>Warranty Terms and Conditions</a> of VSOLE.</Text>
            </Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={registering}
            style={{
              height: '50px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(24, 144, 255, 0.4)'
            }}
          >
            Activate Warranty Now
          </Button>
        </Form>
      </Card>
    </div>
  )
}
