import React from 'react';
import { AlertCircle, Eye, Download } from 'lucide-react';
import { downloadProtectedFile } from '../../utils/downloadFile';

const DemandeTable = ({ demandes, onAction, showActions = false }) => {
  const handleDownload = async (event, url, filename) => {
    event.preventDefault();

    try {
      await downloadProtectedFile(url, filename);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Erreur lors du telechargement du fichier');
    }
  };

  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'envoye_admin':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'envoye_service':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'reponse_service':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'valide_admin':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (statut) => {
    const labels = {
      envoye_admin: 'Envoye admin',
      envoye_service: 'Envoye service',
      reponse_service: 'Reponse service',
      valide_admin: 'Valide admin',
      processed: 'Traite',
    };

    return labels[statut] || statut.replace('_', ' ').charAt(0).toUpperCase() + statut.replace('_', ' ').slice(1);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            <th className="px-6 py-3">Ref</th>
            <th className="px-6 py-3">Titre & Description</th>
            <th className="px-6 py-3">Service</th>
            <th className="px-6 py-3">Statut</th>
            <th className="px-6 py-3">Date</th>
            {showActions && <th className="px-6 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {demandes.map((demande) => (
            <tr key={demande.id} className="bg-white border-y border-slate-100 hover:border-primary-200 transition-all card-hover group shadow-sm rounded-2xl">
              <td className="px-6 py-5 rounded-l-2xl font-bold text-slate-400">#D-{demande.id}</td>
              <td className="px-6 py-5">
                <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{demande.titre}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{demande.description}</p>
              </td>
              <td className="px-6 py-5">
                <span className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  {demande.service?.name || demande.type_donnees || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(demande.statut)}`}>
                  {getStatusLabel(demande.statut)}
                </span>
              </td>
              <td className="px-6 py-5 text-slate-500 text-sm font-medium">
                {new Date(demande.created_at || Date.now()).toLocaleDateString('fr-FR')}
              </td>
              {showActions && (
                <td className="px-6 py-5 text-right rounded-r-2xl">
                  <div className="flex items-center justify-end gap-2">
                    {demande.final_dataset_url && (
                      <button
                        type="button"
                        onClick={(event) => handleDownload(event, demande.final_dataset_url, demande.final_dataset_name)}
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Telecharger fichier traite"
                      >
                        <Download size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => onAction && onAction(demande)}
                      className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                      title="Voir les details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {demandes.length === 0 && (
            <tr>
              <td colSpan={showActions ? 6 : 5} className="py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-slate-400 font-medium italic">Aucune demande trouvee</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DemandeTable;
