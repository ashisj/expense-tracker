'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, isToday, isThisMonth } from 'date-fns'
import { TrendingUp, Calendar, DollarSign, Target } from 'lucide-react'

export default function Summary({ expenses }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const todayTotal = expenses
    .filter(expense => isToday(new Date(expense.date)))
    .reduce((sum, expense) => sum + expense.amount, 0)

  const monthTotal = expenses
    .filter(expense => isThisMonth(new Date(expense.date)))
    .reduce((sum, expense) => sum + expense.amount, 0)

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const avgDaily = monthTotal / new Date().getDate()

  const summaryCards = [
    {
      title: "Today's Total",
      value: todayTotal,
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'This Month',
      value: monthTotal,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      change: '-5%'
    },
    {
      title: 'Average Daily',
      value: avgDaily,
      icon: Target,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      change: '+8%'
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: DollarSign,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      change: '+23%'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="glass rounded-xl p-4 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 ${card.color} opacity-10 rounded-full -mr-8 -mt-8`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-medium text-green-600">
                  {card.change}
                </span>
              </div>
              
              <h3 className="text-xs font-medium text-gray-600 mb-1">
                {card.title}
              </h3>
              
              <p className="text-lg font-bold text-gray-800">
                ₹{card.value.toFixed(2)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
