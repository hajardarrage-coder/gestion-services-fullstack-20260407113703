import React from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import logo from '../../assets/university_logo.png';

const Navbar = ({ title }) => {
  return (
    <nav className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-30 font-inter">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
          <Bell size={18} />
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">Session Active</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
