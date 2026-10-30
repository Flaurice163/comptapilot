import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, BookOpen, FileText, Library,
  Scale, TrendingUp, BarChart3, Landmark, Settings,
  LogOut, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/entreprise', icon: Building2, label: 'Entreprise' },
  { to: '/plan-comptable', icon: BookOpen, label: 'Plan comptable' },
  { to: '/journal', icon: FileText, label: 'Journal' },
  { to: '/grand-livre', icon: Library, label: 'Grand livre' },
  { to: '/balance', icon: Scale, label: 'Balance' },
  { to: '/compte-de-resultat', icon: TrendingUp, label: 'Compte de résultat' },
  { to: '/bilan', icon: Landmark, label: 'Bilan' },
  { to: '/analyse', icon: BarChart3, label: 'Analyse' },
]

const bottomItems = [
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const logout = useStore((s) => s.logout)
  const user = useStore((s) => s.user)
  const company = useStore((s) => s.company)
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await logout()
    if (!result.success) {
      window.alert(result.error ?? 'Impossible de fermer la session.')
      return
    }
    navigate('/login')
    if (result.warning) window.alert(result.warning)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">ComptaPilot</p>
            <p className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
              {company?.name ?? 'Mon entreprise'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-sidebar-foreground/60 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-sidebar-accent text-white'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-indigo-300' : 'text-sidebar-foreground/50 group-hover:text-indigo-300')} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-white'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white',
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0 text-sidebar-foreground/50" />
            {item.label}
          </NavLink>
        ))}

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {user?.full_name?.charAt(0) ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground/50 hover:text-red-400 transition-colors p-1"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar flex-col h-screen fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 z-50 w-64 h-full bg-sidebar transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
