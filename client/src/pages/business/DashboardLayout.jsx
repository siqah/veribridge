import { useState } from 'react';
import { Building2, FileText, Mail, Key, X, Menu, ChevronRight } from 'lucide-react';

const DashboardLayout = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navItems = [
    {
      id: 'company-formation',
      title: 'Company Formation',
      icon: Building2,
      description: 'UK Ltd / US LLC setup'
    },
    {
      id: 'invoicing',
      title: 'Invoicing',
      icon: FileText,
      description: 'Professional invoices'
    },
    {
      id: 'mailbox',
      title: 'Digital Mailbox',
      icon: Mail,
      description: 'Virtual address'
    },
    {
      id: 'api',
      title: 'API Keys',
      icon: Key,
      description: 'Developer access'
    }
  ];
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h2 className="text-lg font-bold text-white">Business Dashboard</h2>
          <p className="text-xs text-gray-500">Freelancer Operating System</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-72 lg:w-64 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r flex-shrink-0
        `} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          {/* Sidebar header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Business Tools
            </h3>
          </div>
          
          {/* Nav items */}
          <nav className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 60px)' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all
                    ${isActive 
                      ? 'bg-blue-500/20 border border-blue-500/40' 
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isActive ? 'bg-blue-500' : 'bg-gray-700'}
                  `}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate block ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {item.title}
                    </span>
                    <span className="text-xs text-gray-500 truncate block">
                      {item.description}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-600'}`} />
                </button>
              );
            })}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
