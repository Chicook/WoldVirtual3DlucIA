import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Bell, 
  Activity, 
  Database, 
  Server, 
  Code, 
  BarChart3, 
  GitBranch,
  Zap,
  Shield,
  Monitor,
  Terminal,
  Globe,
  Cpu,
  HardDrive,
  Network,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Moon,
  Sun,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vista general del sistema'
  },
  {
    name: 'Builds',
    href: '/builds',
    icon: Code,
    description: 'Gestión de builds del proyecto'
  },
  {
    name: 'Progreso',
    href: '/progress',
    icon: BarChart3,
    description: 'Seguimiento del progreso'
  },
  {
    name: 'Cola',
    href: '/queue',
    icon: GitBranch,
    description: 'Gestión de cola de trabajos'
  },
  {
    name: 'Notificaciones',
    href: '/notifications',
    icon: Bell,
    description: 'Sistema de notificaciones'
  },
  {
    name: 'Sistema',
    href: '/system',
    icon: Server,
    description: 'Monitoreo del sistema'
  },
  {
    name: 'Usuarios',
    href: '/users',
    icon: Users,
    description: 'Gestión de usuarios'
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    description: 'Configuración del sistema'
  }
]

const systemStatus = [
  { name: 'CPU', value: 45, icon: Cpu, color: 'text-blue-500' },
  { name: 'Memoria', value: 78, icon: HardDrive, color: 'text-green-500' },
  { name: 'Red', value: 23, icon: Network, color: 'text-purple-500' },
  { name: 'Builds Activos', value: 3, icon: Activity, color: 'text-orange-500' }
]

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo y título */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              WoldVirtual
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Panel Admin
            </p>
          </div>
        </div>
        
        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación principal */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                isActive
                  ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}
              title={item.description}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isActive
                  ? "text-primary-500"
                  : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
              )} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* Estado del sistema */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Estado del Sistema
        </h3>
        <div className="space-y-2">
          {systemStatus.map((status) => (
            <div key={status.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <status.icon className={cn("w-4 h-4", status.color)} />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {status.name}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {status.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 