import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { appTheme } from './utils/theme'

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
