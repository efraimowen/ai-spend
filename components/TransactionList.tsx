// components/TransactionList.tsx
'use client'
import { Transaction } from '@/lib/supabase'

interface Props {
  transactions: Transaction[]
  onDelete?: (id: string) => void
}

const categoryEmoji: Record<string, string> = {
  Food: '🍜', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Other: '📦'
}

export default function TransactionList({ transactions, onDelete }: Props) {
  const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

  return (
    <div className="space-y-2">
      {transactions.length === 0 && (
        <p className="text-center text-gray-400 py-8">Belum ada transaksi. Coba ketik di chat!</p>
      )}
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-xl">{categoryEmoji[t.category] || '💰'}</span>
            <div>
              <p className="text-sm font-medium text-gray-800">{t.description}</p>
              <p className="text-xs text-gray-400">{t.category} · {t.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
              {t.type === 'expense' ? '-' : '+'}{formatIDR(t.amount)}
            </span>
            {onDelete && t.id && (
              <button
                onClick={() => onDelete(t.id!)}
                className="text-gray-300 hover:text-red-400 text-xs transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}