'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after 30 seconds
      setTimeout(() => {
        if (!localStorage.getItem('installPromptDismissed')) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', 'true')
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 glass rounded-xl p-4 shadow-lg animate-in slide-in-from-top duration-500">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex-shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">
            Install Expense Tracker
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Get quick access and offline functionality by installing this app on your device.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}