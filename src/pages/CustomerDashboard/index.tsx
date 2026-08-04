import { Card, Col, Row, Typography, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'

export default function CustomerDashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '50px' }}>
      <Typography.Title level={2}>Customer Dashboard</Typography.Title>
      
      <Row gutter={[16, 16]} style={{ marginTop: '30px' }}>
        <Col xs={24} md={8}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: '10px' }}>
             <Typography.Title level={4}>Register New Product</Typography.Title>
             <p>Scan QR code or enter serial number to register warranty</p>
             <Button type="primary" onClick={() => navigate('/register-product')}>
               Register Now
             </Button>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: '10px' }}>
             <Typography.Title level={4}>My Registered Products</Typography.Title>
             <p>View all products linked to your account</p>
             <Button onClick={() => navigate(ROUTES.MY_PRODUCTS)}>View Products</Button>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: '10px' }}>
             <Typography.Title level={4}>Warranty Status</Typography.Title>
             <p>Check active, expired, or pending warranties</p>
             <Button onClick={() => navigate(ROUTES.WARRANTY_STATUS)}>Check Status</Button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
