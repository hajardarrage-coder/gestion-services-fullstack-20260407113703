import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Book, Clock, CheckCircle2, FileText, GraduationCap } from 'lucide-react';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setStudent(user);
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/student/my-demandes`);
        setDemandes(response.data);
      } catch (err) {
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Espace Étudiant</h1>
          <p className="text-slate-500 text-sm mt-1">Suivi académique et administratif</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
           <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded flex items-center justify-center font-bold text-xs uppercase">
             {student?.name?.[0] || 'S'}
           </div>
           <div className="hidden sm:block">
             <p className="font-bold text-slate-900 text-xs leading-none">{student?.name}</p>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{student?.filiere}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-minimal">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Moyenne</p>
          <p className="text-2xl font-bold text-slate-900">14.50</p>
        </div>
        <div className="card-minimal border-l-4 border-blue-500">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Crédits</p>
          <p className="text-2xl font-bold text-slate-900">30/30</p>
        </div>
        <div className="card-minimal border-l-4 border-amber-500">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Demandes</p>
          <p className="text-2xl font-bold text-slate-900">{demandes.length}</p>
        </div>
        <div className="card-minimal border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Semestre</p>
          <p className="text-2xl font-bold text-slate-900">S2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-minimal space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Informations Personnelles
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CNE</p>
              <p className="font-bold text-slate-900 text-sm tracking-tight">{student?.cne || '---'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CIN</p>
              <p className="font-bold text-slate-900 text-sm tracking-tight">{student?.cin || '---'}</p>
            </div>
            <div className="col-span-2 pt-4 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filière</p>
               <p className="font-bold text-slate-900 uppercase text-xs">{student?.filiere}</p>
            </div>
          </div>
        </div>

        <div className="card-minimal space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Dernières Requêtes
            </h3>
            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline font-inter">Voir tout</button>
          </div>
          <div className="space-y-2">
            {demandes.map(d => (
              <div key={d.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between group hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                <div>
                  <p className="font-bold text-slate-900 text-xs uppercase tracking-tight">{d.titre}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{d.date}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                  d.statut === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {d.statut}
                </span>
              </div>
            ))}
          </div>
          <button className="btn-minimal w-full">
            <FileText size={16} />
            Nouvelle Requête
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
