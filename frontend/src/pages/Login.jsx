import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserCircle, Loader2, ShieldCheck, Layout } from 'lucide-react';
import axios from 'axios';
import logo from '../assets/university_logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const SERVICE_LOAD_ERROR = 'Impossible de charger les services';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'service') {
      setSelectedServiceId('');
      setError('');
      return;
    }

    if (services.length > 0) {
      return;
    }

    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/services`);
        setServices(Array.isArray(response.data) ? response.data : []);
        setError((prev) => (prev === SERVICE_LOAD_ERROR ? '' : prev));
      } catch (err) {
        console.error('Erreur lors du chargement des services:', err);
        setError(SERVICE_LOAD_ERROR);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, [role, services.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (role === 'service' && !selectedServiceId) {
      setError('Choisir un service');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email,
        password,
        role,
      };

      if (role === 'service') {
        payload.service_id = Number(selectedServiceId);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, payload);
      const { user, token } = response.data;

      login(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrateur', icon: ShieldCheck },
    { id: 'president', label: 'President', icon: UserCircle },
    { id: 'service', label: 'Service', icon: Layout },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-inter">
      <div className="max-w-[400px] w-full">
        <div className="card-minimal">
          <div className="text-center mb-8">
            <img src={logo} alt="USMBA Logo" className="h-16 mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">La faculte Des lettres et des sciences Humaines</h2>
            <p className="text-slate-400 text-sm mt-1">Authentification centralisee</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input-minimal pl-10"
                  placeholder="admin@gmail.com / president@gmail.com / service@gmail.com"
                  required
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-minimal pl-10"
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={() => alert('Fonctionnalite de reinitialisation via email en cours de deploiement.')}
                  className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider"
                >
                  Mot de passe oublie ?
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Profil utilisateur</label>
              <div className="grid grid-cols-1 gap-2">
                {roles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`
                      px-3 py-3 rounded-lg border transition-all flex items-center gap-3
                      ${role === item.id
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-primary-600 hover:text-primary-600'}
                    `}
                  >
                    <item.icon size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {role === 'service' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Selectionner un service</label>
                <div className="relative">
                  <Layout size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedServiceId}
                    onChange={(event) => setSelectedServiceId(event.target.value)}
                    className="input-minimal pl-10 appearance-none bg-white cursor-pointer"
                    disabled={servicesLoading}
                    required
                  >
                    <option value="">{servicesLoading ? 'Chargement...' : 'Choisir un service'}</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-minimal w-full mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              Faculte des lettres et des sciences humaines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
