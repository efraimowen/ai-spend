// components/SpendingChart.tsx
'use client'
import {
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Transaction } from '@/lib/supabase'

const COLORS = ['#1D9E75', '#378ADD', '#D85A30', '#BA7517', '#7F77DD', '#D4537E', '#639922']

interface Props {
  transactions: Transaction[]
}

export default function SpendingChart({ transactions }: Props) {
  // Hitung total per kategori
  const categoryMap = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
    label: new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0
    }).format(value)
  }))

  const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        Belum ada data transaksi
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Distribusi Pengeluaran</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData.map((item, index) => ({
                ...item,
                fill: COLORS[index % COLORS.length]
              }))}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            />
              {/* {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie> */}
            {/* <Tooltip formatter={(value: number) => formatIDR(value)} /> */}
            <Tooltip formatter={(value) => [formatIDR(Number(value)), '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">Per Kategori</h3>
        <ResponsiveContainer width="100%" height={240}>
            <BarChart 
            data={chartData.map((item, index) => ({
                ...item,
                fill: COLORS[index % COLORS.length]
            }))}
             margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            {/* <Tooltip formatter={(value: number) => formatIDR(value)} /> */}
            <Tooltip formatter={(value) => [formatIDR(Number(value)), '']} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}