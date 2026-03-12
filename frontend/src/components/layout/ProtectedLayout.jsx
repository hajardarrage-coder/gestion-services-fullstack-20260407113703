import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const ProtectedLayout = ({ children, allowedRoles, language }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const getTitle = () => {
    switch(user?.role) {
      case 'admin': return 'Administration Centrale';
      case 'president': return 'Tableau de Bord Président';
      case 'service': return 'Espace Service';
      case 'student': return 'Espace Étudiant';
      default: return 'Portail FLSH';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Navbar title={getTitle()} />
        <main className="flex-1 p-6 md:p-8 xl:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
