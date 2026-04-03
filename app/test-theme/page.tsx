'use client'

import { useTheme } from '../contexts/ThemeContext'

export default function TestThemePage() {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-8`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Theme Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Theme Status</h2>
            <div className="space-y-2">
              <p><strong>Theme:</strong> {theme}</p>
              <p><strong>Resolved Theme:</strong> {resolvedTheme}</p>
              <p><strong>Document Class:</strong> {document.documentElement.className}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Theme Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={toggleTheme}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Toggle Theme ({theme === 'dark' ? '☀️ Light' : '🌙 Dark'})
              </button>
              
              <button
                onClick={() => {
                  if (theme !== 'light') toggleTheme()
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Set Light Mode
              </button>
              
              <button
                onClick={() => {
                  if (theme !== 'dark') toggleTheme()
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Set Dark Mode
              </button>
              
              <button
                onClick={() => {
                  if (theme !== 'system') toggleTheme()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Set System Mode
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Color Test</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                  ORANGE
                </div>
                <p className="mt-2 text-sm">Primary Color</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-gray-700 font-bold">
                  GRAY
                </div>
                <p className="mt-2 text-sm">Old Color</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
