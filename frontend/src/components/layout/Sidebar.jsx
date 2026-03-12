import React from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  Layers,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import logo from '../../assets/university_logo.png';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { title: 'Tableau de Bord', icon: LayoutDashboard, path: `/${user?.role}/dashboard` },
    { title: 'Utilisateurs', icon: Users, path: '/admin/users' },
    { title: 'Services', icon: Layers, path: '/admin/services' },
    { title: 'Administration', icon: ShieldCheck, path: '/admin/settings' },
    { title: 'Parametres', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/logout`);
    } catch (error) {
      // Clear local auth state even if the backend session is already gone.
    } finally {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-50 border-r border-slate-200 flex flex-col font-inter">
      <div className="p-8 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <img src={logo} alt="FLSH" className="h-8 object-contain" />
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">FLSH</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 bg-white">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Deconnexion
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
