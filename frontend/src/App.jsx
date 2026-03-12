import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import PresidentDashboard from './pages/president/PresidentDashboard';
import ServiceDashboard from './pages/service/ServiceDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ProtectedLayout from './components/layout/ProtectedLayout';
import axios from 'axios';

// Backend API Global Configuration
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login language={language} changeLanguage={changeLanguage} />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedLayout allowedRoles={['admin']} language={language}>
            <AdminDashboard />
          </ProtectedLayout>
        }
      />
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route
        path="/president/dashboard"
        element={
          <ProtectedLayout allowedRoles={['president']} language={language}>
            <PresidentDashboard />
          </ProtectedLayout>
        }
      />
      <Route path="/president/*" element={<Navigate to="/president/dashboard" replace />} />

      <Route
        path="/service/dashboard"
        element={
          <ProtectedLayout allowedRoles={['service']} language={language}>
            <ServiceDashboard />
          </ProtectedLayout>
        }
      />
      <Route path="/service/*" element={<Navigate to="/service/dashboard" replace />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedLayout allowedRoles={['student']} language={language}>
            <StudentDashboard />
          </ProtectedLayout>
        }
      />
      <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
