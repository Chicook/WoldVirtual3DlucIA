import React from 'react'
import { 
  Activity, 
  Code, 
  Database, 
  Server, 
  Users, 
  Bell, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe,
  Cpu,
  HardDrive,
  Network,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { buildService } from '@/services/buildService'
import { systemService } from '@/services/systemService'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { SystemStatus } from '@/components/dashboard/SystemStatus'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { BuildQueue } from '@/components/dashboard/BuildQueue'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export const DashboardPage: React.FC = () => {
  // Obtener datos del dashboard
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => buildService.getDashboardData(),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  })

  const { data: systemData, isLoading: isLoadingSystem } = useQuery({
    queryKey: ['system-status'],
    queryFn: () => systemService.getSystemStatus(),
    refetchInterval: 10000, // Actualizar cada 10 segundos
  })

  if (isLoadingDashboard || isLoadingSystem) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = [
    {
      title: 'Builds Totales',
      value: dashboardData?.totalBuilds || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Code,
      color: 'blue'
    },
    {
      title: 'Builds Activos',
      value: dashboardData?.activeBuilds || 0,
      change: '+5%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Progreso General',
      value: `${dashboardData?.overallProgress || 0}%`,
      change: '+8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Usuarios Activos',
      value: dashboardData?.activeUsers || 0,
      change: '+3%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'orange'
    }
  ]

  const systemMetrics = [
    {
      name: 'CPU',
      value: systemData?.cpu || 0,
      icon: Cpu,
      color: 'text-blue-500',
      unit: '%'
    },
    {
      name: 'Memoria',
      value: systemData?.memory || 0,
      icon: HardDrive,
      color: 'text-green-500',
      unit: '%'
    },
    {
      name: 'Red',
      value: systemData?.network || 0,
      icon: Network,
      color: 'text-purple-500',
      unit: 'MB/s'
    },
    {
      name: 'Almacenamiento',
      value: systemData?.storage || 0,
      icon: Database,
      color: 'text-orange-500',
      unit: '%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard de Administración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control total del sistema WoldVirtual 3D
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistema Operativo</span>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <DashboardCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progreso del proyecto */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Progreso del Proyecto
              </h3>
              <ProgressChart data={dashboardData?.moduleProgress || []} />
            </div>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="space-y-6">
          <SystemStatus metrics={systemMetrics} />
          <BuildQueue builds={dashboardData?.recentBuilds || []} />
        </div>
      </div>

      {/* Actividad reciente y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={dashboardData?.recentActivity || []} />
        
        {/* Alertas del sistema */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Alertas del Sistema
            </h3>
            <div className="space-y-3">
              {dashboardData?.alerts?.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {alert.title}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {alert.message}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.alerts || dashboardData.alerts.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>No hay alertas activas</p>
                  <p className="text-sm">El sistema está funcionando correctamente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Play className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Iniciar Build</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Pause className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Pausar Cola</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <RotateCcw className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Reiniciar</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Optimizar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 