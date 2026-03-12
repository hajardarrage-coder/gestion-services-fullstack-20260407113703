import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import DemandeTable from '../../components/demandes/DemandeTable';
import DemandeModal from '../../components/demandes/DemandeModal';
import DemandeDetailsModal from '../../components/demandes/DemandeDetailsModal';

const PresidentDashboard = () => {
  const [demandes, setDemandes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const demandesRes = await axios.get(`${import.meta.env.VITE_API_URL}/demandes`);
      setDemandes(demandesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (demande) => {
    setSelectedDemande(demande);
    setShowDetailsModal(true);
  };

  const demandeStats = {
    envoye_admin: demandes.filter((d) => d.statut === 'envoye_admin').length,
    envoye_service: demandes.filter((d) => d.statut === 'envoye_service').length,
    reponse_service: demandes.filter((d) => d.statut === 'reponse_service').length,
    processed: demandes.filter((d) => d.statut === 'processed' || d.statut === 'valide_admin').length,
  };

  return (
    <div className="space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Flux de Demandes</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion des requêtes présidentielles</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-minimal">
          <Plus size={18} />
          Nouvelle Demande
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-minimal">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total</p>
          <p className="text-2xl font-bold text-slate-900">{demandes.length}</p>
        </div>
        <div className="card-minimal border-l-4 border-amber-500">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Envoyées Admin</p>
          <p className="text-2xl font-bold text-slate-900">{demandeStats.envoye_admin}</p>
        </div>
        <div className="card-minimal border-l-4 border-blue-500">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Retour Service</p>
          <p className="text-2xl font-bold text-slate-900">{demandeStats.reponse_service}</p>
        </div>
        <div className="card-minimal border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Fichiers traités</p>
          <p className="text-2xl font-bold text-slate-900">{demandeStats.processed}</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] px-8 py-10 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            Archives de Demandes
            <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">
              {loading ? '...' : `${demandes.length} Total`}
            </span>
          </h3>
          <button onClick={fetchData} className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-4 py-2 rounded-xl">
            Actualiser
          </button>
        </div>
        <div className="overflow-hidden">
          <DemandeTable demandes={demandes} showActions={true} onAction={handleAction} />
        </div>
      </div>

      <DemandeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />

      <DemandeDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        demande={selectedDemande}
      />
    </div>
  );
};

export default PresidentDashboard;
