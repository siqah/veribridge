import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Mail, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const navItems = [
    { 
      path: '/admin', 
      label: 'Formation Orders', 
      icon: Building2, 
      exact: true,
      description: 'Manage company formations'
    },
    { 
      path: '/admin/mail', 
      label: 'Mail Management', 
      icon: Mail,
      description: 'Upload customer mail'
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="w-72 border-r p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Panel</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>VeriBridge Management</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'border border-transparent hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? 'text-blue-400' : ''}`} style={!isActive ? { color: 'var(--text-secondary)' } : {}}>
                        {item.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1" />
                    )}
                  </>
                )}
              </NavLink>
);
          })}
        </nav>

        {/* Admin User Info */}
        <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="p-3 rounded-lg mb-3" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.email?.[0].toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  Admin User
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:bg-red-500/10 hover:border-red-500/30"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
