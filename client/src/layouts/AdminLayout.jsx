import { Outlet, NavLink } from 'react-router-dom';
import { Building2, Users, Settings, BarChart3 } from 'lucide-react';

export default function AdminLayout() {
  const navItems = [
    { path: '/admin', label: 'Formation Orders', icon: Building2, exact: true },
    // Future admin sections:
    // { path: '/admin/users', label: 'Users', icon: Users },
    // { path: '/admin/settings', label: 'Settings', icon: Settings },
    // { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/50 border-r border-gray-700 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-sm text-gray-400">Manage your business</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Stats Section */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Pending</span>
              <span className="text-yellow-400 font-semibold">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">This Month</span>
              <span className="text-green-400 font-semibold">—</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
