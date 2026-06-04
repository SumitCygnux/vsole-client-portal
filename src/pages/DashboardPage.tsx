import { MoreOutlined } from '@ant-design/icons'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  activityTabs,
  billingTrendData,
  generationChartData,
  overviewCardStyles,
  overviewStats,
  rowsPerPage,
  solarActivityRows,
  statusClass,
  tabStatusMap,
  type ActivityTab,
} from '@/data/dashboardData'

const parseActivityDate = (date: string) => new Date(date).getTime()

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('All projects')
  const [last30Only, setLast30Only] = useState(false)
  const [page, setPage] = useState(1)

  const latestActivityDate = useMemo(
    () => Math.max(...solarActivityRows.map((row) => parseActivityDate(row.date))),
    [],
  )

  const filteredActivityRows = useMemo(() => {
    const selectedStatus = tabStatusMap[activeTab]
    const last30Start = latestActivityDate - 30 * 24 * 60 * 60 * 1000

    return solarActivityRows.filter((row) => {
      const matchesStatus = selectedStatus ? row.status === selectedStatus : true
      const matchesDate = last30Only ? parseActivityDate(row.date) >= last30Start : true

      return matchesStatus && matchesDate
    })
  }, [activeTab, last30Only, latestActivityDate])

  const visibleActivityRows = filteredActivityRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  )

  const resetActivityFilters = () => {
    setActiveTab('All projects')
    setLast30Only(false)
    setPage(1)
  }

  const updateActivityTab = (tab: ActivityTab) => {
    setActiveTab(tab)
    setPage(1)
  }

  const toggleLast30 = () => {
    setLast30Only((value) => !value)
    setPage(1)
  }

  return (
    <div className="grid gap-5">
      <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
        {overviewStats.map((stat, index) => {
          const style = overviewCardStyles[index]

          return (
            <Card
              key={stat.label}
              className={`group overflow-hidden rounded-[22px] border border-[#E5E7EB] border-t-[4px] ${style.border} bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.08)] ${style.glow} [&_.ant-card-body]:!p-0`}
            >
              <div className="relative min-h-[140px] p-5">
                <span
                  className={`absolute right-0 top-0 h-24 w-28 rounded-bl-full bg-gradient-to-br ${style.accent} opacity-10 transition group-hover:opacity-20`}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#6B7280]">
                      {stat.label}
                    </span>

                    <strong className="mt-3 block text-[30px] font-bold leading-none text-[#1F2937]">
                      {stat.value}
                    </strong>

                    <span
                      className={`mt-4 inline-flex rounded-full ${style.bg} px-3 py-1 text-xs font-bold ${style.text}`}
                    >
                      {stat.change}
                    </span>
                  </div>

                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-2xl ${style.bg} text-lg ${style.text}`}
                  >
                    {style.icon}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-full bg-[#F1F5F9]">
                  <span className={`block h-full w-2/3 rounded-r-full bg-gradient-to-r ${style.accent}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </section>

      <section className="grid grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] gap-5 max-xl:grid-cols-1">
        <Card className="overflow-hidden rounded-[22px] border border-[#E5E7EB] shadow-sm [&_.ant-card-body]:!p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
                Monthly Generation
              </span>
              <strong className="mt-1 block text-3xl font-bold text-[#1F2937]">
                1,525 kWh
              </strong>
              <span className="text-xs font-bold text-[#22C55E]">
                +12% from last month
              </span>
            </div>

            <Button
              buttonVariant="secondary"
              className="!h-auto !rounded-xl !border-[#E5E7EB] !bg-[#F8FAFC] !px-3 !py-2 !text-xs !font-bold !text-[#1F2937]"
              htmlType="button"
            >
              Last 30 days
            </Button>
          </div>

          <ResponsiveContainer height={280} width="100%">
            <BarChart data={generationChartData} margin={{ bottom: 0, left: -8, right: 8, top: 10 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#5B6EF5" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="overflow-hidden rounded-[22px] border border-[#E5E7EB] shadow-sm [&_.ant-card-body]:!p-5">
          <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#6B7280]">
            Billing Credit
          </span>

          <strong className="mt-1 block text-3xl font-bold text-[#1F2937]">
            $20,462.89
          </strong>

          <span className="text-xs font-bold text-[#22C55E]">
            +20% from last month
          </span>

          <div className="mt-5">
            <ResponsiveContainer height={265} width="100%">
              <AreaChart data={billingTrendData} margin={{ bottom: 0, left: -22, right: 4, top: 10 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#5B6EF5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B6EF5" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip />
                <Area
                  activeDot={{ fill: '#5B6EF5', r: 4, stroke: '#FFFFFF', strokeWidth: 2 }}
                  dataKey="value"
                  fill="url(#revenueGradient)"
                  stroke="#5B6EF5"
                  strokeWidth={3}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card
        className="overflow-hidden rounded-[22px] border border-[#E5E7EB] shadow-sm [&_.ant-card-body]:!p-5"
        title={
          <div>
            <span className="block text-base font-bold text-[#1F2937]">
              Recent Solar Activity
            </span>
            <span className="mt-1 block text-xs font-normal text-[#6B7280]">
              Projects, plant sites, energy, and service status
            </span>
          </div>
        }
        extra={
          <div className="flex items-center gap-2">
            <Button
              buttonVariant="secondary"
              className="!h-auto !rounded-xl !border-[#E5E7EB] !bg-white !px-3 !py-2 !text-xs !font-bold !text-[#1F2937] hover:!border-[#5B6EF5] hover:!text-[#5B6EF5]"
              htmlType="button"
              onClick={resetActivityFilters}
            >
              View all
            </Button>

            <Button
              buttonVariant="secondary"
              className={`!h-auto !rounded-xl !border !px-3 !py-2 !text-xs !font-bold ${
                last30Only
                  ? '!border-[#5B6EF5] !bg-[#EEF2FF] !text-[#5B6EF5]'
                  : '!border-[#E5E7EB] !bg-white !text-[#1F2937] hover:!border-[#5B6EF5] hover:!text-[#5B6EF5]'
              }`}
              htmlType="button"
              onClick={toggleLast30}
            >
              Last 30 days
            </Button>
          </div>
        }
      >
        <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] text-xs font-bold text-[#6B7280]">
          {activityTabs.map((tab) => (
            <Button
              key={tab}
              buttonVariant="ghost"
              className={`!h-auto !rounded-none !px-0 !pb-3 !pt-0 transition hover:!bg-transparent hover:!text-[#1F2937] ${
                activeTab === tab
                  ? '!border-x-0 !border-b-2 !border-t-0 !border-b-[#5B6EF5] !text-[#5B6EF5]'
                  : '!border-0 !text-[#6B7280]'
              }`}
              htmlType="button"
              onClick={() => updateActivityTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs text-[#6B7280]">
                <th className="rounded-l-xl bg-[#F1F5F9] px-4 py-3 font-bold">Project</th>
                <th className="bg-[#F1F5F9] px-4 py-3 font-bold">Date</th>
                <th className="bg-[#F1F5F9] px-4 py-3 font-bold">Energy</th>
                <th className="bg-[#F1F5F9] px-4 py-3 font-bold">Solar Site</th>
                <th className="bg-[#F1F5F9] px-4 py-3 font-bold">City</th>
                <th className="bg-[#F1F5F9] px-4 py-3 font-bold">Status</th>
                <th className="rounded-r-xl bg-[#F1F5F9] px-4 py-3 font-bold" />
              </tr>
            </thead>

            <tbody>
              {visibleActivityRows.map((row) => (
                <tr
                  key={`${row.project}-${row.date}`}
                  className="bg-white shadow-[0_1px_0_rgba(15,23,42,0.06)] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                >
                  <td className="rounded-l-xl px-4 py-3 font-bold text-[#1F2937]">
                    {row.project}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{row.date}</td>
                  <td className="px-4 py-3 font-bold text-[#1F2937]">{row.energy}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{row.site}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{row.city}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="rounded-r-xl px-4 py-3 text-right text-[#6B7280]">
                    <MoreOutlined />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
