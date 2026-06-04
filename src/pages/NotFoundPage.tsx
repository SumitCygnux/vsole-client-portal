import { Result } from 'antd'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/app'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="The page you are looking for does not exist."
      extra={
        <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to Dashboard
        </Button>
      }
    />
  )
}

export default NotFoundPage
