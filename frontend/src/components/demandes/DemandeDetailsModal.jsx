import React from 'react';
import { X, Clock, AlertCircle, MessageSquare, Info, Download } from 'lucide-react';
import { downloadProtectedFile } from '../../utils/downloadFile';

const statusStyles = {
  envoye_admin: 'bg-amber-100 text-amber-700 border-amber-200',
  envoye_service: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  reponse_service: 'bg-blue-100 text-blue-700 border-blue-200',
  valide_admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  processed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusLabels = {
  envoye_admin: 'Envoye admin',
  envoye_service: 'Envoye service',
  reponse_service: 'Reponse service',
  valide_admin: 'Valide admin',
  processed: 'Traite',
};

const downloadButtonClass = 'inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all';

const DemandeDetailsModal = ({ isOpen, onClose, demande }) => {
  if (!isOpen || !demande) return null;

  const handleDownload = async (url, filename) => {
    try {
      await downloadProtectedFile(url, filename);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Erreur lors du telechargement du fichier');
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/40">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Details de la Demande</h3>
            <p className="text-slate-400 text-sm font-bold mt-1">Reference: #D-{demande.id}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-slate-400 border border-transparent hover:border-slate-100">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusStyles[demande.statut] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              Statut: {statusLabels[demande.statut] || demande.statut}
            </span>
            <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-900">
              Priorite: {demande.priorite || 'Moyenne'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-primary-500" />
                  Titre
                </label>
                <p className="text-lg font-black text-slate-900 leading-tight uppercase">{demande.titre}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-primary-500" />
                  Type de donnees
                </label>
                <p className="font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl w-fit">{demande.type_donnees}</p>
              </div>

              {demande.niveau_etude && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau d'etude</label>
                  <p className="font-bold text-slate-700">{demande.niveau_etude}</p>
                </div>
              )}

              {demande.type_personnel && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type de personnel</label>
                  <p className="font-bold text-slate-700">{demande.type_personnel}</p>
                </div>
              )}

              {demande.service?.name && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service assigne</label>
                  <p className="font-bold text-slate-700">{demande.service.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-primary-500" />
                  Date de creation
                </label>
                <p className="font-bold text-slate-700">{new Date(demande.created_at).toLocaleString('fr-FR')}</p>
              </div>

              {demande.service_file_url && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fichier service</label>
                  <button type="button" onClick={() => handleDownload(demande.service_file_url, demande.service_file_name)} className={downloadButtonClass}>
                    <Download size={14} />
                    {demande.service_file_name || 'Telecharger'}
                  </button>
                </div>
              )}

              {demande.final_dataset_url && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dataset final</label>
                  <button type="button" onClick={() => handleDownload(demande.final_dataset_url, demande.final_dataset_name)} className={downloadButtonClass}>
                    <Download size={14} />
                    {demande.final_dataset_name || 'Telecharger'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} className="text-primary-500" />
              Description
            </label>
            <p className="text-slate-600 font-medium leading-relaxed">{demande.description}</p>
          </div>

          {demande.commentaire && (
            <div className="space-y-3 bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-1 rounded-full border border-white/10 w-fit">
                Commentaire service / admin
              </span>
              <p className="relative z-10 text-lg font-medium leading-relaxed italic">"{demande.commentaire}"</p>
            </div>
          )}

          {!demande.service_file_url && demande.statut !== 'envoye_admin' && (
            <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 flex items-center gap-5">
              <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-amber-900 font-black tracking-tight uppercase text-sm">En cours de traitement</p>
                <p className="text-amber-700/70 text-xs font-bold">Le service a recu votre demande et prepare le retour.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandeDetailsModal;
