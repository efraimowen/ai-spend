// components/BudgetAlert.tsx
'use client'
import { Transaction } from '@/lib/supabase'

const BUDGET_LIMIT = 5_000_000 // Rp 5 juta Budget limit untuk testing

interface Props {
  transactions: Transaction[]
}

export default function BudgetAlert({ transactions }: Props) {
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const isOverBudget = totalExpense > BUDGET_LIMIT
  const percentage = Math.min((totalExpense / BUDGET_LIMIT) * 100, 100)

  const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

  return (
    <div className={`rounded-xl p-4 border transition-all duration-500 ${
      isOverBudget
        ? 'bg-red-50 border-red-300'
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
          {isOverBudget ? '⚠️ Budget Terlampaui!' : '✅ Budget Aman'}
        </span>
        <span className={`text-xs ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
          {formatIDR(totalExpense)} / {formatIDR(BUDGET_LIMIT)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            isOverBudget ? 'bg-red-500' : percentage > 75 ? 'bg-amber-400' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className={`text-xs mt-2 ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
        {isOverBudget
          ? `Kamu melebihi budget ${formatIDR(totalExpense - BUDGET_LIMIT)}`
          : `Sisa budget: ${formatIDR(BUDGET_LIMIT - totalExpense)}`
        }
      </p>
    </div>
  )
}