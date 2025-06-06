'use client'

import { format, parseISO } from 'date-fns'
import { Calendar, Tag, IndianRupee } from 'lucide-react'

export default function ExpenseList({ expenses }) {
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
    return groups
  }, {})

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => 
    new Date(b) - new Date(a)
  )

  if (expenses.length === 0) {
    return (
      <div className="card text-center">
        <div className="py-8">
          <IndianRupee className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No expenses yet
          </h3>
          <p className="text-gray-500">
            Tap the + button to add your first expense
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-24">
      {sortedDates.map(date => {
        const dayExpenses = groupedExpenses[date]
        const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)

        return (
          <div key={date} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">
                  {format(parseISO(date), 'MMM dd, yyyy')}
                </h3>
              </div>
              <span className="text-sm font-medium text-red-600">
                ₹{dayTotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3">
              {dayExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {expense.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-red-600">
                      ₹{expense.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}