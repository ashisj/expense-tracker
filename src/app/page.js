'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Plus, 
  Smartphone, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import InstallPrompt from './components/InstallPrompt'

export default function Home() {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [sheetConfig, setSheetConfig] = useState({
    sheetId: '',
    apiUrl: ''
  })

  useEffect(() => {
    loadExpenses()
    
    // Check for install action from shortcut
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'add') {
      setShowForm(true)
    }
  }, [])

  const loadExpenses = async () => {
    try {
      const stored = localStorage.getItem('expenses')
      if (stored) {
        setExpenses(JSON.parse(stored))
      }
      
      const config = localStorage.getItem('sheetConfig')
      if (config) {
        setSheetConfig(JSON.parse(config))
        setConnectionStatus('connected')
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
    }
  }

  const addExpense = async (expense) => {
    try {
      setIsLoading(true)
      const newExpense = {
        ...expense,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }

      const updatedExpenses = [newExpense, ...expenses]
      setExpenses(updatedExpenses)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses))

      // Sync to Google Sheets if connected
      if (connectionStatus === 'connected' && sheetConfig.apiUrl) {
        await syncToGoogleSheets(newExpense)
      }

      setShowForm(false)
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncToGoogleSheets = async (expense) => {
    try {
      const response = await fetch(sheetConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense)
      })

      if (!response.ok) {
        throw new Error('Failed to sync to Google Sheets')
      }
    } catch (error) {
      console.error('Sync error:', error)
      // Store for later sync
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]')
      pendingSync.push(expense)
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync))
    }
  }

  const refreshFromSheets = async () => {
    if (connectionStatus !== 'connected' || !sheetConfig.apiUrl) return

    try {
      setIsLoading(true)
      const response = await fetch(sheetConfig.apiUrl)
      const data = await response.json()
      
      setExpenses(data)
      localStorage.setItem('expenses', JSON.stringify(data))
    } catch (error) {
      console.error('Error refreshing from sheets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen ios-safe-top ios-safe-bottom">
      <InstallPrompt />
      
      {/* Header */}
      <header className="glass sticky top-0 z-50 p-4 m-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Expense Tracker</h1>
              <p className="text-sm text-gray-600">
                {connectionStatus === 'connected' ? '🟢 Synced' : '🔴 Offline'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={refreshFromSheets}
              disabled={isLoading || connectionStatus !== 'connected'}
              className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="p-2 bg-green-500 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <Summary expenses={expenses} />

      {/* Quick Add Button - Mobile First */}
      {!showForm && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowForm(true)}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ExpenseForm
              onSubmit={addExpense}
              onCancel={() => setShowForm(false)}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Expense List */}
      <ExpenseList expenses={expenses} />

      {/* Settings/Config (Initially hidden, can be toggled) */}
      <div className="card mt-8">
        <div className="text-center text-gray-600">
          <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Install this app on your phone for the best experience!
          </p>
        </div>
      </div>
    </div>
  )
}