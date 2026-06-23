'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { Transaction } from '@/lib/supabase'

interface Props {
  transactions: Transaction[]
}

interface ChartDataItem {
  name: string
  value: number
  percentage: number
  formattedValue: string
}

export default function SpendingChart({ transactions }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount & resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Same calculation as before
  const categoryMap = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const totalAmount = Object.values(categoryMap).reduce((sum, val) => sum + val, 0)

  const chartData: ChartDataItem[] = Object.entries(categoryMap)
    .map(([name, value]) => {
      const percentage = totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0
      return {
        name,
        value,
        percentage,
        formattedValue: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(value),
      }
    })
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        Belum ada data transaksi
      </div>
    )
  }

  const topCategories = chartData.slice(0, 3)
  const restCategories = chartData.slice(3)
  const displayedCategories = showAllCategories ? chartData : topCategories

  // ===== RENDER LOGIC =====
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-600 mb-4">Distribusi Pengeluaran</h3>

      {isMobile ? (
        // MOBILE: Stack vertically
        <MobileLayout
          chartData={chartData}
          displayedCategories={displayedCategories}
          restCategories={restCategories}
          activeCategory={activeCategory}
          showAllCategories={showAllCategories}
          onToggleShowAll={() => setShowAllCategories(!showAllCategories)}
          onSetActiveCategory={setActiveCategory}
        />
      ) : (
        // DESKTOP/TABLET: Flex side-by-side
        <DesktopLayout
          chartData={chartData}
          displayedCategories={displayedCategories}
          restCategories={restCategories}
          activeCategory={activeCategory}
          showAllCategories={showAllCategories}
          onToggleShowAll={() => setShowAllCategories(!showAllCategories)}
          onSetActiveCategory={setActiveCategory}
        />
      )}
    </div>
  )
}

// ===== MOBILE LAYOUT =====
function MobileLayout({
  chartData,
  displayedCategories,
  restCategories,
  activeCategory,
  showAllCategories,
  onToggleShowAll,
  onSetActiveCategory,
}: {
  chartData: ChartDataItem[]
  displayedCategories: ChartDataItem[]
  restCategories: ChartDataItem[]
  activeCategory: string | null
  showAllCategories: boolean
  onToggleShowAll: () => void
  onSetActiveCategory: (cat: string | null) => void
}) {
  const COLORS = ['#1D9E75', '#378ADD', '#D85A30', '#BA7517', '#7F77DD', '#D4537E', '#639922']

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Full-width chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: COLORS[chartData.indexOf(item) % COLORS.length],
              }))}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => onSetActiveCategory(chartData[index].name)}
              onMouseLeave={() => onSetActiveCategory(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeCategory === null || activeCategory === entry.name ? 1 : 0.4}
                  style={{ transition: 'opacity 0.2s' }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(value)
              }
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal scroll legend */}
      <div className="flex flex-col gap-2 w-full">
        {displayedCategories.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer w-full"
            onMouseEnter={() => onSetActiveCategory(item.name)}
            onMouseLeave={() => onSetActiveCategory(null)}
            style={{
              backgroundColor:
                activeCategory === null || activeCategory === item.name
                  ? '#f9fafb'
                  : '#f3f4f6',
            }}
          >
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[chartData.indexOf(item) % COLORS.length] }}
            />

            {/* Category name + values (flex row untuk align horizontally) */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-600">{item.formattedValue}</p>
                <p className="text-xs font-semibold text-gray-800">{item.percentage}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more/less button */}
      {restCategories.length > 0 && (
        <button
          onClick={onToggleShowAll}
          className="w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 hover:border-blue-300 rounded-lg transition-colors"
        >
          {showAllCategories ? '▲ Sembunyikan' : `▼ Lihat ${restCategories.length} lagi`}
        </button>
      )}
    </div>
  )
}

// ===== DESKTOP LAYOUT =====
function DesktopLayout({
  chartData,
  displayedCategories,
  restCategories,
  activeCategory,
  showAllCategories,
  onToggleShowAll,
  onSetActiveCategory,
}: {
  chartData: ChartDataItem[]
  displayedCategories: ChartDataItem[]
  restCategories: ChartDataItem[]
  activeCategory: string | null
  showAllCategories: boolean
  onToggleShowAll: () => void
  onSetActiveCategory: (cat: string | null) => void
}) {
  const COLORS = ['#1D9E75', '#378ADD', '#D85A30', '#BA7517', '#7F77DD', '#D4537E', '#639922']

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Chart */}
      <div className="flex-1 flex justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            {/* Same as mobile */}
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: COLORS[chartData.indexOf(item) % COLORS.length],
              }))}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => onSetActiveCategory(chartData[index].name)}
              onMouseLeave={() => onSetActiveCategory(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeCategory === null || activeCategory === entry.name ? 1 : 0.4}
                  style={{ transition: 'opacity 0.2s' }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(value)
              }
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 lg:flex-0 lg:w-64">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {displayedCategories.map((item, index) => (
            <div
              key={item.name}
              className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
              onMouseEnter={() => onSetActiveCategory(item.name)}
              onMouseLeave={() => onSetActiveCategory(null)}
              style={{
                backgroundColor:
                  activeCategory === null || activeCategory === item.name
                    ? '#f9fafb'
                    : '#f3f4f6',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[chartData.indexOf(item) % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">{item.name}</span>
              </div>
              <div className="ml-5">
                <p className="text-xs text-gray-600">{item.formattedValue}</p>
                <p className="text-xs font-semibold text-gray-800">{item.percentage}%</p>
              </div>
            </div>
          ))}

          {/* Show more/less button */}
          {restCategories.length > 0 && (
            <button
              onClick={onToggleShowAll}
              className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium text-center mt-2"
            >
              {showAllCategories ? '▲ Sembunyikan' : `▼ Lihat ${restCategories.length} lagi`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}