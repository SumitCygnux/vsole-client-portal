import {
  AppstoreOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  FolderOpenOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { TableColumnsType } from 'antd'

export type ProjectRow = {
  energy: string
  energyValue: number
  key: string
  name: string
  plant: string
  status: 'Active' | 'Completed' | 'Pending'
}

export const plantStatusData = [
  { color: '#16B981', label: 'Online', percent: '73%', value: 958 },
  { color: '#F97316', label: 'Maintenance', percent: '18%', value: 236 },
  { color: '#EF4444', label: 'Offline', percent: '9%', value: 118 },
]

export const valueTrendData = [
  { month: "Apr '25", value: 1240 },
  { month: "May '25", value: 1842 },
  { month: "Jun '25", value: 1360 },
  { month: "Jul '25", value: 1450 },
  { month: "Aug '25", value: 1680 },
  { month: "Sep '25", value: 1580 },
]

export const siteLeaders = [
  { name: 'Ahmedabad Solar Park', score: '92%' },
  { name: 'Surat Industrial Plant', score: '88%' },
  { name: 'Vadodara Client Site', score: '83%' },
  { name: 'Rajkot Rooftop Cluster', score: '78%' },
  { name: 'Gandhinagar Campus', score: '72%' },
]

export const statCards = [
  {
    accent: '#5B6EF5',
    bg: '#EEF2FF',
    icon: <AppstoreOutlined />,
    label: 'Total Projects',
    meta: '+4 this month',
    sparkline: [14, 15, 15, 16, 16, 18],
    value: '18',
  },
  {
    accent: '#F59E0B',
    bg: '#FFFBEB',
    icon: <ThunderboltOutlined />,
    label: 'Installed Capacity',
    meta: 'Across 12 plants',
    sparkline: [5.8, 6.2, 6.6, 6.9, 7.1, 7.4],
    value: '7.4 MW',
  },
  {
    accent: '#22C55E',
    bg: '#ECFDF3',
    icon: <CheckCircleOutlined />,
    label: 'Monthly Generation',
    meta: '18% above target',
    sparkline: [62, 74, 88, 96, 112, 126],
    value: '126 MWh',
  },
  {
    accent: '#06B6D4',
    bg: '#ECFEFF',
    icon: <FileDoneOutlined />,
    label: 'Completed Tickets',
    meta: 'Service SLA healthy',
    sparkline: [18, 24, 28, 31, 36, 42],
    value: '42',
  },
]

export const projectRows: ProjectRow[] = [
  {
    energy: '42.8 MWh',
    energyValue: 86,
    key: '1',
    name: 'Rooftop Phase 1',
    plant: 'Ahmedabad Solar Park',
    status: 'Active',
  },
  {
    energy: '31.4 MWh',
    energyValue: 63,
    key: '2',
    name: 'Factory Net Metering',
    plant: 'Surat Industrial Plant',
    status: 'Completed',
  },
  {
    energy: '18.9 MWh',
    energyValue: 38,
    key: '3',
    name: 'Warehouse Retrofit',
    plant: 'Vadodara Client Site',
    status: 'Pending',
  },
]

export const hourlyEnergyData = [
  { hour: '1', energy: 0 },
  { hour: '2', energy: 0 },
  { hour: '3', energy: 0 },
  { hour: '4', energy: 0 },
  { hour: '5', energy: 54 },
  { hour: '6', energy: 24 },
  { hour: '7', energy: 62 },
  { hour: '8', energy: 31 },
  { hour: '9', energy: 36 },
  { hour: '10', energy: 43 },
  { hour: '11', energy: 62 },
  { hour: '12', energy: 51 },
  { hour: '13', energy: 36 },
  { hour: '14', energy: 41 },
  { hour: '15', energy: 32 },
  { hour: '16', energy: 27 },
  { hour: '17', energy: 59 },
  { hour: '18', energy: 55 },
  { hour: '19', energy: 63 },
  { hour: '20', energy: 24 },
  { hour: '21', energy: 0 },
  { hour: '22', energy: 0 },
  { hour: '23', energy: 0 },
  { hour: '24', energy: 0 },
]

export const dashboardKpis = [
  { accent: '#14B8A6', label: 'Daily generation', value: '32.6kWh' },
  { accent: '#06B6D4', label: 'Total power (kWh)', value: '58.6kWh' },
  { accent: '#22C55E', label: 'Monthly income', value: '$50' },
  { accent: '#5B6EF5', label: 'Total Income', value: '$320' },
]

export const plantCards = [
  {
    currentPower: '626.0W',
    dailyPeak: '3.5',
    name: 'Plant 1',
    todayIncome: '$73.3',
    totalYield: '58.0kWh',
    yieldToday: '32.6kWh',
  },
  {
    currentPower: '626.0W',
    dailyPeak: '3.5',
    name: 'Plant 2',
    todayIncome: '$73.3',
    totalYield: '58.0kWh',
    yieldToday: '32.6kWh',
  },
]

export const overviewStats = [
  { change: '+4 active sites', label: 'Solar Projects', value: '18' },
  { change: '+41% from last month', label: 'Total Generation', value: '12,562 kWh' },
  { change: '12 plants online', label: 'Installed Capacity', value: '7.4 MW' },
  { change: '+42 completed', label: 'Service Tickets', value: '42' },
]

export const generationChartData = [
  { day: '01 July', value: 180 },
  { day: '02 July', value: 320 },
  { day: '03 July', value: 330 },
  { day: '04 July', value: 780 },
  { day: '05 July', value: 95 },
  { day: '06 July', value: 740 },
  { day: '07 July', value: 780 },
  { day: '08 July', value: 820 },
  { day: '09 July', value: 42 },
  { day: '10 July', value: 910 },
  { day: '11 July', value: 560 },
  { day: '12 July', value: 210 },
]

export const billingTrendData = [
  { day: '01', value: 34 },
  { day: '02', value: 10 },
  { day: '03', value: 28 },
  { day: '04', value: 20 },
  { day: '05', value: 76 },
  { day: '06', value: 25 },
  { day: '07', value: 48 },
  { day: '08', value: 38 },
  { day: '09', value: 82 },
]

export type SolarActivityStatus = 'Canceled' | 'Completed' | 'In Progress' | 'Pending'

export type ActivityTab = 'All projects' | 'Cancelled' | 'Completed' | 'In Progress' | 'Pending Review'

export const activityTabs: ActivityTab[] = ['All projects', 'Completed', 'In Progress', 'Pending Review', 'Cancelled']

export const rowsPerPage = 4

export const tabStatusMap: Record<ActivityTab, SolarActivityStatus | null> = {
  'All projects': null,
  Cancelled: 'Canceled',
  Completed: 'Completed',
  'In Progress': 'In Progress',
  'Pending Review': 'Pending',
}

export const statusClass: Record<SolarActivityStatus, string> = {
  Canceled: 'bg-[#FEE2E2] text-[#EF4444]',
  Completed: 'bg-[#DCFCE7] text-[#16A34A]',
  'In Progress': 'bg-[#E0F2FE] text-[#0284C7]',
  Pending: 'bg-[#FEF3C7] text-[#D97706]',
}

export const overviewCardStyles = [
  {
    accent: 'from-[#5B6EF5] to-[#7C8CFF]',
    bg: 'bg-[#EEF2FF]',
    border: 'border-t-[#5B6EF5]',
    glow: 'shadow-[#5B6EF5]/10',
    icon: <AppstoreOutlined />,
    text: 'text-[#5B6EF5]',
  },
  {
    accent: 'from-[#22C55E] to-[#65D88D]',
    bg: 'bg-[#ECFDF3]',
    border: 'border-t-[#22C55E]',
    glow: 'shadow-[#22C55E]/10',
    icon: <ThunderboltOutlined />,
    text: 'text-[#16A34A]',
  },
  {
    accent: 'from-[#F59E0B] to-[#FBBF24]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-t-[#F59E0B]',
    glow: 'shadow-[#F59E0B]/10',
    icon: <CheckCircleOutlined />,
    text: 'text-[#D97706]',
  },
  {
    accent: 'from-[#06B6D4] to-[#67E8F9]',
    bg: 'bg-[#ECFEFF]',
    border: 'border-t-[#06B6D4]',
    glow: 'shadow-[#06B6D4]/10',
    icon: <FileDoneOutlined />,
    text: 'text-[#0891B2]',
  },
]

export type SolarActivityRow = {
  city: string
  date: string
  energy: string
  project: string
  site: string
  status: SolarActivityStatus
}

export const solarActivityRows: SolarActivityRow[] = [
  { city: 'Ahmedabad', date: '07/29/2025', energy: '46.2 MWh', project: 'Rooftop Phase 2', site: 'Ahmedabad Solar Park', status: 'Completed' },
  { city: 'Surat', date: '07/27/2025', energy: '33.8 MWh', project: 'Factory Net Metering', site: 'Surat Industrial Plant', status: 'Pending' },
  { city: 'Vadodara', date: '07/24/2025', energy: '22.4 MWh', project: 'Warehouse Retrofit', site: 'Vadodara Client Site', status: 'In Progress' },
  { city: 'Rajkot', date: '07/22/2025', energy: '9.6 MWh', project: 'Panel Cleaning Visit', site: 'Rajkot Rooftop Cluster', status: 'Canceled' },
  { city: 'Gandhinagar', date: '07/19/2025', energy: '28.5 MWh', project: 'Campus Battery Sync', site: 'Gandhinagar Campus', status: 'Completed' },
  { city: 'Bhavnagar', date: '07/16/2025', energy: '17.3 MWh', project: 'Inverter Health Check', site: 'Bhavnagar Coastal Plant', status: 'In Progress' },
  { city: 'Anand', date: '07/13/2025', energy: '21.7 MWh', project: 'Smart Meter Upgrade', site: 'Anand Dairy Solar Site', status: 'Pending' },
  { city: 'Bharuch', date: '07/10/2025', energy: '39.1 MWh', project: 'Industrial Roof Audit', site: 'Bharuch Chemical Park', status: 'Completed' },
  { city: 'Jamnagar', date: '07/07/2025', energy: '24.6 MWh', project: 'Array Tilt Calibration', site: 'Jamnagar Refinery Solar', status: 'In Progress' },
  { city: 'Ahmedabad', date: '07/05/2025', energy: '42.8 MWh', project: 'Rooftop Phase 1', site: 'Ahmedabad Solar Park', status: 'Completed' },
  { city: 'Mehsana', date: '07/01/2025', energy: '14.9 MWh', project: 'String Fault Review', site: 'Mehsana Utility Site', status: 'Canceled' },
  { city: 'Surat', date: '06/26/2025', energy: '31.4 MWh', project: 'Transformer Service', site: 'Surat Industrial Plant', status: 'Completed' },
  { city: 'Vadodara', date: '06/18/2025', energy: '18.9 MWh', project: 'Warehouse Retrofit', site: 'Vadodara Client Site', status: 'Pending' },
  { city: 'Rajkot', date: '06/09/2025', energy: '12.2 MWh', project: 'Combiner Box Repair', site: 'Rajkot Rooftop Cluster', status: 'In Progress' },
  { city: 'Morbi', date: '05/21/2025', energy: '16.4 MWh', project: 'Ceramic Plant Survey', site: 'Morbi Industrial Solar', status: 'Completed' },
]

export const projectColumns: TableColumnsType<ProjectRow> = [
  {
    dataIndex: 'name',
    render: (name: ProjectRow['name']) => (
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EEF2FF] text-[#5B6EF5]">
          <FolderOpenOutlined />
        </span>
        <div>
          <span className="block font-medium text-[#0F172A]">{name}</span>
          <span className="mt-0.5 block text-xs text-[#94A3B8]">Client project</span>
        </div>
      </div>
    ),
    title: 'Project',
  },
  {
    dataIndex: 'plant',
    render: (plant: ProjectRow['plant']) => (
      <span className="font-medium text-[#334155]">{plant}</span>
    ),
    title: 'Solar Plant',
  },
  {
    dataIndex: 'energy',
    render: (energy: ProjectRow['energy'], row) => (
      <div className="grid min-w-[150px] gap-2">
        <span className="font-semibold text-[#0F172A]">{energy}</span>
        <span className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F7]">
          <span
            className="block h-full rounded-full bg-[#5B6EF5]"
            style={{ width: `${row.energyValue}%` }}
          />
        </span>
      </div>
    ),
    title: 'Energy',
  },
  {
    dataIndex: 'status',
    render: (status: ProjectRow['status']) => {
      const statusClass =
        status === 'Pending'
          ? 'bg-[#FFF7E6] text-[#D97706]'
          : 'bg-[#ECFDF3] text-[#16A34A]'

      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {status}
        </span>
      )
    },
    title: 'Status',
  },
]
