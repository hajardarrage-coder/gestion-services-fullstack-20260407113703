import React, { useState } from 'react';
import axios from 'axios';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

const DemandeModal = ({ isOpen, onClose, onSuccess }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [type_donnees, setTypeDonnees] = useState('Etudiants');
  const [niveau_etude, setNiveauEtude] = useState('Licence');
  const [type_personnel, setTypePersonnel] = useState('Administratif');
  const [priorite, setPriorite] = useState('moyenne');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTitre('');
    setDescription('');
    setTypeDonnees('Etudiants');
    setNiveauEtude('Licence');
    setTypePersonnel('Administratif');
    setPriorite('moyenne');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        titre,
        type_donnees,
        description,
        priorite,
        niveau_etude: type_donnees === 'Etudiants' ? niveau_etude : null,
        type_personnel: type_donnees === 'Personnel' ? type_personnel : null,
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/demandes`, payload);

      setSuccess(response.data.message || 'Demande créée avec succès');
      resetForm();

      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">Nouvelle Demande</h3>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex gap-3 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium border border-green-100">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Titre de la demande</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-medium"
              placeholder="Ex: Statistiques des inscriptions 2026"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Type de données</label>
            <select
              value={type_donnees}
              onChange={(e) => setTypeDonnees(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-medium appearance-none"
              required
            >
              <option value="Etudiants">Etudiants</option>
              <option value="Personnel">Personnel</option>
            </select>
          </div>

          {type_donnees === 'Etudiants' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Niveau d'étude</label>
              <select
                value={niveau_etude}
                onChange={(e) => setNiveauEtude(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-medium appearance-none"
                required
              >
                <option value="Licence">Licence</option>
                <option value="Master">Master</option>
                <option value="Doctorat">Doctorat</option>
              </select>
            </div>
          )}

          {type_donnees === 'Personnel' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Type de personnel</label>
              <select
                value={type_personnel}
                onChange={(e) => setTypePersonnel(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-medium appearance-none"
                required
              >
                <option value="Administratif">Administratif</option>
                <option value="Professeur">Professeur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Priorité</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'faible', label: 'Faible' },
                { id: 'moyenne', label: 'Moyenne' },
                { id: 'haute', label: 'Haute' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriorite(p.id)}
                  className={`
                    py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2
                    ${priorite === p.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'}
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Description détaillée</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none transition-all font-medium resize-none"
              placeholder="Veuillez décrire votre demande ici..."
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemandeModal;
