import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Inbox, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { downloadProtectedFile } from '../../utils/downloadFile';

const ServiceDashboard = () => {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [targetDemande, setTargetDemande] = useState(null);
  const [commentaire, setCommentaire] = useState('');
  const [responseFile, setResponseFile] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchDemandes = async () => {
    if (!user?.service_id) {
      setDemandes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const demandesRes = await axios.get(`${import.meta.env.VITE_API_URL}/services/${user.service_id}/demandes`);
      setDemandes(demandesRes.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'actualisation des demandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, [user]);

  const closeModal = () => {
    setShowResponseModal(false);
    setTargetDemande(null);
    setCommentaire('');
    setResponseFile(null);
  };

  const handleUpdateStatus = async () => {
    if (!targetDemande || !responseFile) return;

    const formData = new FormData();
    formData.append('commentaire', commentaire);
    formData.append('fichier_reponse', responseFile);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/demandes/${targetDemande.id}/respond`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      closeModal();
      fetchDemandes();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la soumission de la reponse");
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      await downloadProtectedFile(url, filename);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Erreur lors du telechargement du fichier');
    }
  };

  const statsCount = {
    envoye_service: demandes.filter((d) => d.statut === 'envoye_service').length,
    reponse_service: demandes.filter((d) => d.statut === 'reponse_service').length,
    valide_admin: demandes.filter((d) => d.statut === 'valide_admin').length,
  };

  return (
    <div className="space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Espace Interventions</h1>
          <p className="text-slate-500 text-sm mt-1">Traitement des demandes actives</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDemandes} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-minimal">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recues</p>
          <p className="text-2xl font-bold text-slate-900">{demandes.length}</p>
        </div>
        <div className="card-minimal border-l-4 border-amber-500">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">A traiter</p>
          <p className="text-2xl font-bold text-slate-900">{statsCount.envoye_service}</p>
        </div>
        <div className="card-minimal border-l-4 border-blue-500">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Repondues</p>
          <p className="text-2xl font-bold text-slate-900">{statsCount.reponse_service}</p>
        </div>
        <div className="card-minimal border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Validees</p>
          <p className="text-2xl font-bold text-slate-900">{statsCount.valide_admin}</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] px-8 py-10 border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            Flux de Travail
            <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">
              {loading ? '...' : `${demandes.length} Demandes`}
            </span>
          </h3>
          <button onClick={fetchDemandes} className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-4 py-2 rounded-xl">
            Actualiser
          </button>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-6">
                <th className="px-8 py-2">Demande Recue</th>
                <th className="px-8 py-2 text-center">Etat de Traitement</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id} className="bg-white border border-slate-50 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <td className="px-8 py-6 rounded-l-[28px] border-l border-y border-slate-50">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all border border-slate-100">
                        <Inbox size={28} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg tracking-tight uppercase leading-none mb-1">{demande.titre}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recu le {new Date(demande.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 rounded-r-[28px] text-center border-r border-y border-slate-50">
                    <div className="flex items-center justify-center gap-2">
                      {demande.statut === 'envoye_service' ? (
                        <button
                          onClick={() => {
                            setTargetDemande(demande);
                            setShowResponseModal(true);
                          }}
                          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-slate-200"
                        >
                          Soumettre Fichier
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            {demande.statut === 'reponse_service' ? 'Reponse envoyee' : 'Valide admin'}
                          </span>
                          {demande.service_file_url && (
                            <button
                              type="button"
                              onClick={() => handleDownload(demande.service_file_url, demande.service_file_name)}
                              className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700"
                            >
                              Telecharger le fichier
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/40">
            <div className="p-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Repondre a la demande</h3>
              <p className="text-slate-500 font-medium mb-8">Transmettez le fichier demande au format PDF, Excel, image ou CSV.</p>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cible</p>
                  <p className="font-bold text-slate-900 uppercase">{targetDemande?.titre}</p>
                  <p className="text-sm text-slate-500 mt-2">{targetDemande?.description}</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">Commentaire</label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-slate-100 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-semibold transition-all resize-none"
                    placeholder="Ajoutez un commentaire pour l'administration..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">Fichier de reponse</label>
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp"
                    onChange={(e) => setResponseFile(e.target.files?.[0] || null)}
                    className="w-full p-4 bg-slate-100 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-semibold transition-all"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-inter"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!responseFile}
                    className="flex-2 px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 font-inter"
                  >
                    Confirmer Reponse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDashboard;
