'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface SystemMetrics {
  serverStatus: 'online' | 'offline' | 'maintenance'
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkTraffic: number
  uptime: number
  activeConnections: number
  lastBackup: string
  databaseStatus: 'healthy' | 'warning' | 'error'
  apiResponseTime: number
}

interface AppHealth {
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
  lastCheck: string
  uptime: string
}

export default function DevOpsMonitor() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { data: systemMetrics, isLoading, refetch } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Mock system metrics for the invoice app
      return {
        serverStatus: 'online',
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        networkTraffic: Math.random() * 1000,
        uptime: 99.9,
        activeConnections: Math.floor(Math.random() * 100),
        lastBackup: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        databaseStatus: Math.random() > 0.1 ? 'healthy' : 'warning',
        apiResponseTime: Math.random() * 500 + 50,
      } as SystemMetrics
    },
    refetchInterval: autoRefresh ? 5000 : false,
  })

  const { data: appHealth } = useQuery({
    queryKey: ['app-health'],
    queryFn: async () => {
      // Mock app health check
      const issues = []
      const cpuHigh = systemMetrics?.cpuUsage > 80
      const memHigh = systemMetrics?.memoryUsage > 85
      const diskHigh = systemMetrics?.diskUsage > 90

      if (cpuHigh) issues.push('High CPU usage detected')
      if (memHigh) issues.push('High memory usage detected')
      if (diskHigh) issues.push('Low disk space')
      if (systemMetrics?.databaseStatus === 'warning') issues.push('Database performance degraded')

      return {
        status: issues.length === 0 ? 'healthy' : issues.length > 2 ? 'critical' : 'warning',
        issues,
        lastCheck: new Date().toISOString(),
        uptime: '15 days, 8 hours, 32 minutes'
      } as AppHealth
    },
    refetchInterval: autoRefresh ? 10000 : false,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'offline':
      case 'critical':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'maintenance':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'offline':
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'maintenance':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border cursor-pointer transition-all ${getStatusColor(appHealth?.status || 'healthy')}`}>
          {getStatusIcon(appHealth?.status || 'healthy')}
          <span className="text-sm font-medium">
            {appHealth?.status === 'healthy' ? 'System Healthy' : `${appHealth?.issues.length} Issues`}
          </span>
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-2 text-xs opacity-75 hover:opacity-100"
          >
            Details →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-screen overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {getStatusIcon(appHealth?.status || 'healthy')}
            <h3 className="font-semibold text-gray-900">System Monitor</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-1 text-xs rounded ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
            >
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
            <button
              onClick={() => refetch()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* App Health */}
              <div className={`p-3 rounded-lg border ${getStatusColor(appHealth?.status || 'healthy')}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Application Health</span>
                  {getStatusIcon(appHealth?.status || 'healthy')}
                </div>
                <div className="text-sm text-gray-600">
                  <p>Uptime: {appHealth?.uptime}</p>
                  <p>Last Check: {new Date(appHealth?.lastCheck || '').toLocaleTimeString()}</p>
                </div>
                {appHealth?.issues && appHealth.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Issues:</p>
                    <ul className="text-xs text-gray-600 mt-1">
                      {appHealth.issues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* System Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{systemMetrics?.cpuUsage.toFixed(1)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full" 
                      style={{ width: `${systemMetrics?.cpuUsage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{systemMetrics?.memoryUsage.toFixed(1)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-purple-600 h-1 rounded-full" 
                      style={{ width: `${systemMetrics?.memoryUsage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{systemMetrics?.networkTraffic.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">KB/s</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">API</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{systemMetrics?.apiResponseTime.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">ms</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Active Connections:</span>
                  <span className="font-medium text-gray-900">{systemMetrics?.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(systemMetrics?.lastBackup || '').toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Server Status:</span>
                  <span className="font-medium text-gray-900">{systemMetrics?.serverStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
