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
  const isWarning = totalExpense > BUDGET_LIMIT * 0.75 && !isOverBudget
  const percentage = Math.min((totalExpense / BUDGET_LIMIT) * 100, 100)

  const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(value)

  return (
    <div className={`rounded-xl p-4 border transition-all duration-500 shadow-card ${
      isOverBudget
        ? 'bg-danger-50 border-danger-500/30 hover:shadow-card-hover'
        : isWarning
        ? 'bg-warning-50 border-warning-500/30 hover:shadow-card-hover'
        : 'bg-success-50 border-success-500/30 hover:shadow-card-hover'
    }`}>
    
    {/* Header dengan icon dan status */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2"> 
        <span className={`text-xl ${
            isOverBudget 
              ? '⚠️' 
              : isWarning 
              ? '⚡' 
              : '✅'
          }`}>
        </span>
        <span className={`text-sm font-semibold ${
            isOverBudget 
              ? 'text-danger-600' 
              : isWarning 
              ? 'text-warning-600' 
              : 'text-success-600'
          }`}>
            {isOverBudget 
              ? 'Budget Terlampaui!' 
              : isWarning 
              ? 'Budget Hampir Habis!' 
              : 'Budget Aman'}
        </span>
      </div>
      
      {/* Amount display */}
      <span className={`text-xs font-mono font-medium ${
        isOverBudget 
          ? 'text-danger-600' 
          : isWarning 
          ? 'text-warning-600' 
          : 'text-success-600'
      }`}>
        {formatIDR(totalExpense)} / {formatIDR(BUDGET_LIMIT)}
      </span>
    </div>
      
    {/* Progress bar dengan gradient */}
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-700 ${
            isOverBudget 
            ? 'bg-gradient-danger' 
            : isWarning 
            ? 'bg-gradient-warning' 
            : 'bg-gradient-success'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>

    {/* Description text */}
    <p className={`text-xs mt-2.5 font-medium ${
      isOverBudget 
        ? 'text-danger-600' 
        : isWarning 
        ? 'text-warning-600' 
        : 'text-success-600'
    }`}>
      {isOverBudget
        ? `🚨 Kamu melebihi budget ${formatIDR(totalExpense - BUDGET_LIMIT)}`
        : isWarning
        ? `⚠️ Hati-hati! Tinggal ${formatIDR(BUDGET_LIMIT - totalExpense)} lagi`
        : `💰 Sisa budget: ${formatIDR(BUDGET_LIMIT - totalExpense)}`
      }
    </p>

    {/* Optional: Percentage text */}
    <div className="mt-2 text-xs text-gray-500">
      <span className="font-semibold">{percentage.toFixed(1)}%</span> dari budget digunakan
    </div>
    
    </div>
  )
}