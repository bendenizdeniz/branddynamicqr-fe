import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, Coffee, User, Building2, Landmark, Store, Library,MessageSquareMore,LayoutTemplate,ShieldCheck,Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // LocalStorage hatalarını önlemek için güvenli okuma
  const getUser = () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : { email: 'Misafir', role: 'USER' };
    } catch {
      return { email: 'Misafir', role: 'USER' };
    }
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 text-xl font-bold border-b border-slate-800">
          <Coffee className="text-blue-400" />
          <span>Brand QR</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
            <div className="pt-4 pb-2 px-3">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yönetim</p>
  </div>
          <Link 
            to="/" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/owner-management" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/owner-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Building2 size={20} />
            <span>Şirket Yönetimi</span>
          </Link>

           <Link 
            to="/brand-management" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/brand-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Landmark size={20} />
            <span>Marka Yönetimi</span>
          </Link>

           <Link 
            to="/subvendor-management" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/subvendor-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Store size={20} />
            <span>Şube Yönetimi</span>
          </Link>

           <Link 
            to="/category-management" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/category-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Library size={20} />
            <span>Kategori Yönetimi</span>
          </Link>
          
          <Link 
            to="/product-management" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/product-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Package size={20} />
            <span>Ürün Yönetimi</span>
          </Link>
  <div className="pt-4 pb-2 px-3">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sistem & Destek</p>
  </div>
  {/* Kullanıcı Yönetimi - Users (Grup simgesi) */}
  <Link to="/user-management" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/user-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    <Users size={20} />
    <span>Kullanıcı Yönetimi</span>
  </Link>

  {/* Rol/İzin Yönetimi - ShieldCheck (Güvenlik ve Onay simgesi) */}
  <Link to="/role-management" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/role-management' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    <ShieldCheck size={20} />
    <span>Rol / İzin Yönetimi</span>
  </Link>

  {/* Menü Şablonu Yönetimi - LayoutTemplate (Tasarım ve Şablon simgesi) */}
  <Link to="/menu-template" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/menu-template' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    <LayoutTemplate size={20} />
    <span>Menü Şablonu Yönetimi</span>
  </Link>

  {/* Geri Bildirimler - MessageSquareMore (Konuşma ve etkileşim simgesi) */}
  <Link to="/feedbacks" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === '/feedbacks' ? 'bg-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    <MessageSquareMore size={20} />
    <span>Geri Bildirimler</span>
  </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-4 px-2">
            <User size={18} className="text-slate-400" />
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full p-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm font-semibold"
          >
            <LogOut size={18} /> {/* Kullanım burada, hata gitmiş olmalı */}
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;