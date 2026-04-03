'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { Server, GitBranch, Activity, Zap, Shield, Database, Cloud, Settings, Terminal, Package, Cpu, HardDrive, Wifi } from 'lucide-react'
import Link from 'next/link'

interface DevOpsMetrics {
  serverStatus: 'online' | 'offline' | 'maintenance'
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkTraffic: number
  uptime: number
  activeConnections: number
  lastDeployment: string
  gitBranch: string
  environment: 'development' | 'staging' | 'production'
}

interface Deployment {
  id: string
  version: string
  branch: string
  status: 'success' | 'failed' | 'pending'
  timestamp: string
  duration: number
  deployedBy: string
}

interface Service {
  name: string
  status: 'running' | 'stopped' | 'error'
  cpu: number
  memory: number
  uptime: string
  lastRestart: string
}

export default function DevOpsDashboard() {
  const { data: session } = useSession()
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const { data: devOpsMetrics, isLoading } = useQuery({
    queryKey: ['devops-metrics'],
    queryFn: async () => {
      // Mock DevOps metrics
      return {
        serverStatus: 'online',
        cpuUsage: 45.2,
        memoryUsage: 62.8,
        diskUsage: 78.4,
        networkTraffic: 125.6,
        uptime: 99.9,
        activeConnections: 342,
        lastDeployment: '2024-01-15T10:30:00Z',
        gitBranch: 'main',
        environment: 'production'
      } as DevOpsMetrics
    },
    enabled: !!session?.user,
  })

  const { data: deployments } = useQuery({
    queryKey: ['deployments'],
    queryFn: async () => {
      // Mock deployment history
      return [
        {
          id: '1',
          version: 'v2.1.0',
          branch: 'main',
          status: 'success',
          timestamp: '2024-01-15T10:30:00Z',
          duration: 180,
          deployedBy: 'admin@invoicemaster.com'
        },
        {
          id: '2',
          version: 'v2.0.9',
          branch: 'develop',
          status: 'success',
          timestamp: '2024-01-14T15:45:00Z',
          duration: 165,
          deployedBy: 'devops@invoicemaster.com'
        },
        {
          id: '3',
          version: 'v2.0.8',
          branch: 'hotfix/security',
          status: 'failed',
          timestamp: '2024-01-13T09:20:00Z',
          duration: 45,
          deployedBy: 'admin@invoicemaster.com'
        }
      ] as Deployment[]
    },
    enabled: !!session?.user,
  })

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      // Mock services
      return [
        {
          name: 'Web Server',
          status: 'running',
          cpu: 23.4,
          memory: 45.2,
          uptime: '15 days',
          lastRestart: '2024-01-01T00:00:00Z'
        },
        {
          name: 'Database',
          status: 'running',
          cpu: 67.8,
          memory: 89.2,
          uptime: '45 days',
          lastRestart: '2023-12-01T00:00:00Z'
        },
        {
          name: 'API Gateway',
          status: 'running',
          cpu: 12.3,
          memory: 34.5,
          uptime: '8 days',
          lastRestart: '2024-01-07T00:00:00Z'
        },
        {
          name: 'Background Worker',
          status: 'error',
          cpu: 0,
          memory: 0,
          uptime: '0 days',
          lastRestart: '2024-01-15T08:00:00Z'
        }
      ] as Service[]
    },
    enabled: !!session?.user,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'offline':
      case 'stopped':
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'maintenance':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DevOps Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your infrastructure, deployments, and services</p>
      </div>

      {/* Server Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(devOpsMetrics?.serverStatus || 'offline')}`}>
              {devOpsMetrics?.serverStatus?.toUpperCase() || 'OFFLINE'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Server Status</h3>
          <p className="text-sm text-gray-600 mt-1">Uptime: {formatUptime(devOpsMetrics?.uptime || 0)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{devOpsMetrics?.cpuUsage || 0}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">CPU Usage</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${devOpsMetrics?.cpuUsage || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{devOpsMetrics?.memoryUsage || 0}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Memory Usage</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${devOpsMetrics?.memoryUsage || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <HardDrive className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{devOpsMetrics?.diskUsage || 0}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Disk Usage</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${devOpsMetrics?.diskUsage || 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Services Status</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {services?.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">CPU</p>
                    <p className="font-medium text-gray-900">{service.cpu}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Memory</p>
                    <p className="font-medium text-gray-900">{service.memory}%</p>
                  </div>
                  <button
                    onClick={() => setSelectedService(service.name)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Deployment History</h2>
            <Link
              href="/admin/devops/deployments"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {deployments?.slice(0, 5).map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(deployment.status)}`}>
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{deployment.version}</h3>
                    <p className="text-sm text-gray-600">{deployment.branch} • {deployment.deployedBy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{deployment.duration}s</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">{new Date(deployment.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/admin/devops/deploy"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Deploy New Version
        </Link>
        <Link
          href="/admin/devops/logs"
          className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Terminal className="w-4 h-4" />
          View Logs
        </Link>
        <Link
          href="/admin/devops/monitoring"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Monitoring
        </Link>
      </div>
    </div>
  )
}
