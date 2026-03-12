import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Layout, BookOpen, Plus, Trash2, Edit3, Shield, Search, Eye, Download } from 'lucide-react';
import DemandeDetailsModal from '../../components/demandes/DemandeDetailsModal';
import { downloadProtectedFile } from '../../utils/downloadFile';

const statusLabels = {
  envoye_admin: 'EnvoyÃ© admin',
  envoye_service: 'EnvoyÃ© service',
  reponse_service: 'RÃ©ponse service',
  processed: 'Traité',
  valide_admin: 'ValidÃ© admin',
};

const statusClasses = {
  envoye_admin: 'bg-amber-50 text-amber-600 border-amber-100',
  envoye_service: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  reponse_service: 'bg-blue-50 text-blue-600 border-blue-100',
  processed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  valide_admin: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({ total_users: 0, total_services: 0, total_demandes: 0 });
  const [services, setServices] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [targetDemande, setTargetDemande] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddFiliereModal, setShowAddFiliereModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('service');
  const [userPassword, setUserPassword] = useState('');
  const [filiereName, setFiliereName] = useState('');
  const [filiereCode, setFiliereCode] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? 'users' : activeTab === 'services' ? 'services' : activeTab === 'filieres' ? 'filieres' : 'demandes';
      const [dataRes, statsRes, servicesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/${endpoint}`),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`),
        axios.get(`${import.meta.env.VITE_API_URL}/services`),
      ]);
      setItems(dataRes.data);
      setStats(statsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const resetForms = () => {
    setEditingItem(null);
    setNewServiceName('');
    setNewServiceDesc('');
    setUserName('');
    setUserEmail('');
    setUserRole('service');
    setUserPassword('');
    setFiliereName('');
    setFiliereCode('');
  };

  const resetWorkflowModals = () => {
    setShowAssignModal(false);
    setSelectedServiceId('');
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`ÃŠtes-vous sÃ»r de vouloir supprimer ${item.name || item.nom_filiere || item.titre || 'cet Ã©lÃ©ment'} ?`)) return;
    try {
      const endpoint = activeTab === 'users' ? 'users' : activeTab === 'services' ? 'services' : 'filieres';
      await axios.delete(`${import.meta.env.VITE_API_URL}/${endpoint}/${item.id}`);
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleAssign = async () => {
    if (!selectedServiceId || !targetDemande) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/demandes/assign`, {
        demande_id: targetDemande.id,
        service_id: Number(selectedServiceId),
      });
      resetWorkflowModals();
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'assignation: " + (err.response?.data?.message || err.message));
    }
  };

  const handleProcessFile = async (demandeId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/admin/process-file/${demandeId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du traitement automatique du fichier');
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      await downloadProtectedFile(url, filename);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Erreur lors du telechargement du fichier');
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    setActionLoading(true);
    try {
      if (editingItem) {
        await axios.put(`${import.meta.env.VITE_API_URL}/services/${editingItem.id}`, { name: newServiceName, description: newServiceDesc });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/services`, { name: newServiceName, description: newServiceDesc });
      }
      resetForms();
      setShowAddServiceModal(false);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'opÃ©ration");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!userName.trim() || !userEmail.trim()) return;
    setActionLoading(true);
    try {
      const data = { name: userName, email: userEmail, role: userRole };
      if (!editingItem) data.password = userPassword || 'password123';

      if (editingItem) {
        await axios.put(`${import.meta.env.VITE_API_URL}/users/${editingItem.id}`, data);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/users`, data);
      }
      resetForms();
      setShowAddUserModal(false);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'opÃ©ration");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFiliere = async () => {
    if (!filiereName.trim() || !filiereCode.trim()) return;
    setActionLoading(true);
    try {
      if (editingItem) {
        await axios.put(`${import.meta.env.VITE_API_URL}/filieres/${editingItem.id}`, { nom_filiere: filiereName, code_filiere: filiereCode });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/filieres`, { nom_filiere: filiereName, code_filiere: filiereCode });
      }
      resetForms();
      setShowAddFiliereModal(false);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'opÃ©ration");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Console d'Administration</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion centrale du portail universitaire</p>
        </div>
        {activeTab !== 'demandes' && (
          <button
            onClick={() => {
              resetForms();
              if (activeTab === 'users') setShowAddUserModal(true);
              else if (activeTab === 'services') setShowAddServiceModal(true);
              else if (activeTab === 'filieres') setShowAddFiliereModal(true);
            }}
            className="btn-minimal"
          >
            <Plus size={18} />
            Ajouter {activeTab === 'users' ? 'Utilisateur' : activeTab === 'services' ? 'Service' : 'FiliÃ¨re'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-minimal flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Utilisateurs</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total_users || 0}</p>
          </div>
        </div>

        <div className="card-minimal flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Layout size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total_services || 0}</p>
          </div>
        </div>

        <div className="card-minimal flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demandes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total_demandes || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        {[
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'services', label: 'Services', icon: Layout },
          { id: 'filieres', label: 'FiliÃ¨res', icon: BookOpen },
          { id: 'demandes', label: 'Demandes', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2
              ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}
            `}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-minimal p-0! overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filtrer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none text-xs font-medium w-64 focus:border-slate-900 transition-all font-inter"
            />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loading ? '...' : `${filteredItems.length} Ã‰lÃ©ments`}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-8">
                <th className="px-8 py-2">Informations</th>
                {activeTab === 'users' && <th className="px-8 py-2">RÃ´le</th>}
                {activeTab === 'filieres' && <th className="px-8 py-2">Code</th>}
                {activeTab === 'demandes' && <th className="px-8 py-2">Statut</th>}
                <th className="px-8 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="bg-white/80 border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <td className="px-8 py-6 rounded-l-[32px]">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary-50 text-primary-600'}`}>
                        {activeTab === 'users' ? <Users size={22} /> : activeTab === 'services' ? <Layout size={22} /> : activeTab === 'filieres' ? <BookOpen size={22} /> : <Shield size={22} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tight">{item.name || item.nom_service || item.nom_filiere || item.titre}</p>
                        {activeTab === 'services' && <p className="text-[10px] font-black text-primary-600 bg-primary-50 w-fit px-2 rounded">ID: {item.id}</p>}
                        {activeTab === 'demandes' && <p className="text-xs text-slate-400 font-bold">{item.service?.name || item.type_donnees}</p>}
                        {activeTab !== 'demandes' && (item.email || item.description) && <p className="text-xs text-slate-400 font-bold">{item.email || item.description}</p>}
                      </div>
                    </div>
                  </td>

                  {activeTab === 'users' && (
                    <td className="px-8 py-6">
                      <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                        <Shield size={12} />
                        {item.role}
                      </span>
                    </td>
                  )}

                  {activeTab === 'filieres' && (
                    <td className="px-8 py-6">
                      <span className="font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                        {item.code_filiere || item.code}
                      </span>
                    </td>
                  )}

                  {activeTab === 'demandes' && (
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${statusClasses[item.statut] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {statusLabels[item.statut] || item.statut}
                      </span>
                    </td>
                  )}

                  <td className="px-8 py-6 rounded-r-[32px] text-right">
                    <div className="flex items-center justify-end gap-2">
                      {activeTab === 'demandes' ? (
                        <>
                          {item.final_dataset_url && (
                            <button
                              type="button"
                              onClick={() => handleDownload(item.final_dataset_url, item.final_dataset_name)}
                              className="p-3 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                              title="Telecharger fichier traite"
                            >
                              <Download size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setTargetDemande(item);
                              setShowDetailsModal(true);
                            }}
                            className="p-3 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                            title="Voir les dÃ©tails"
                          >
                            <Eye size={18} />
                          </button>
                          {item.statut === 'envoye_admin' && (
                            <button
                              onClick={() => {
                                setTargetDemande(item);
                                setSelectedServiceId(item.service_id || '');
                                setShowAssignModal(true);
                              }}
                              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                            >
                              Assigner
                            </button>
                          )}
                          {item.statut === 'reponse_service' && (
                            <button
                              onClick={() => handleProcessFile(item.id)}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                            >
                              Traiter le fichier
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              if (activeTab === 'users') {
                                setUserName(item.name);
                                setUserEmail(item.email);
                                setUserRole(item.role);
                                setShowAddUserModal(true);
                              } else if (activeTab === 'services') {
                                setNewServiceName(item.name);
                                setNewServiceDesc(item.description);
                                setShowAddServiceModal(true);
                              } else if (activeTab === 'filieres') {
                                setFiliereName(item.nom_filiere || item.nom || '');
                                setFiliereCode(item.code_filiere || item.code || '');
                                setShowAddFiliereModal(true);
                              }
                            }}
                            className="p-3 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={resetWorkflowModals}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/40">
            <div className="p-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Assigner la demande</h3>
              <p className="text-slate-500 font-medium mb-8">Choisissez le service qui traitera cette demande.</p>
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cible</p>
                  <p className="font-bold text-slate-900">{targetDemande?.titre}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">Service</label>
                  <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full p-4 bg-slate-100 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-semibold transition-all">
                    <option value="">Choisir...</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-6">
                  <button onClick={resetWorkflowModals} className="flex-1 px-8 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-[10px] font-black uppercase tracking-widest">Annuler</button>
                  <button onClick={handleAssign} disabled={!selectedServiceId} className="flex-2 px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Confirmer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DemandeDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} demande={targetDemande} />

      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddServiceModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10">
            <h3 className="text-2xl font-black mb-2">{editingItem ? 'Modifier' : 'Nouveau'} Service</h3>
            <div className="space-y-4 mt-6">
              <input type="text" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Nom du service" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" />
              <textarea value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)} placeholder="Description" rows={3} className="w-full p-4 bg-slate-50 rounded-2xl outline-none" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAddServiceModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase">Annuler</button>
                <button onClick={handleAddService} disabled={actionLoading || !newServiceName} className="flex-2 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase">{actionLoading ? '...' : (editingItem ? 'Mettre Ã  jour' : 'CrÃ©er')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddUserModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10">
            <h3 className="text-2xl font-black mb-2">{editingItem ? 'Modifier' : 'Nouveau'} Utilisateur</h3>
            <div className="space-y-4 mt-6">
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Nom complet" className="w-full p-4 bg-slate-50 rounded-2xl" />
              <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl" />
              {!editingItem && <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Mot de passe" className="w-full p-4 bg-slate-50 rounded-2xl" />}
              <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl">
                <option value="admin">Administrateur</option>
                <option value="president">PrÃ©sident</option>
                <option value="service">Service</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAddUserModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase">Annuler</button>
                <button onClick={handleAddUser} disabled={actionLoading || !userName || !userEmail} className="flex-2 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase">{actionLoading ? '...' : 'Valider'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddFiliereModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddFiliereModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10">
            <h3 className="text-2xl font-black mb-2">{editingItem ? 'Modifier' : 'Nouvelle'} FiliÃ¨re</h3>
            <div className="space-y-4 mt-6">
              <input type="text" value={filiereName} onChange={(e) => setFiliereName(e.target.value)} placeholder="Nom de la filiÃ¨re" className="w-full p-4 bg-slate-50 rounded-2xl" />
              <input type="text" value={filiereCode} onChange={(e) => setFiliereCode(e.target.value)} placeholder="Code filiÃ¨re" className="w-full p-4 bg-slate-50 rounded-2xl" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAddFiliereModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase">Annuler</button>
                <button onClick={handleAddFiliere} disabled={actionLoading || !filiereName || !filiereCode} className="flex-2 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase">{actionLoading ? '...' : 'Valider'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

