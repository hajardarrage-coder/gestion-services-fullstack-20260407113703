import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { RefreshCcw, SearchX } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import InlineSearchFilterBar from '../../components/layout/InlineSearchFilterBar';
import EnseignantSearch from '../../components/EnseignantSearch';

const EMPTY_FORM = {
  code_etablissement: '',
  code_annee: '',
  ppr: '',
  nom: '',
  prenom: '',
  genre: '',
  date_naissance: '',
  lieu_naissance: '',
  nationalite: '',
  type_personnel: '',
  code_grade: '',
  date_recrutement: '',
  date_affectation_mesrsfc: '',
  date_affectation_enseignement: '',
  code_departement: '',
  filiere_prof: '',
  fonction_exercee: '',
  service_affectation: '',
  situation_administrative: '',
  nombre_diplomes: '',
  diplome: '',
  specialite: '',
  universite_diplomante: '',
  autres_diplomes: '',
  situation_handicap: '',
};

const PersonnelPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [valueOptions, setValueOptions] = useState({});
  const [selectOptions, setSelectOptions] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [modeCode, setModeCode] = useState(false);
  const importInputRef = useRef(null);
  const codeCacheRef = useRef(new Map());
  const noticeTimerRef = useRef(null);
  const [notice, setNotice] = useState(null);
  const exportMenuRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const fetchFilters = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/personnel/filters`);
      setFilterOptions(res.data?.filter_options || []);
      setValueOptions(res.data?.value_options || {});
    } catch (error) {
      setFilterOptions([]);
      setValueOptions({});
    }
  };

  const fetchValues = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/personnel/values`);
      setSelectOptions(res.data?.values || {});
    } catch (error) {
      setSelectOptions({});
    }
  };

  const fetchPersonnel = async (page = pagination.current_page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/personnel/search`, {
        params: {
          search,
          filters,
          page,
          per_page: pagination.per_page,
        },
      });
      setItems(res.data?.data || []);
      setPagination(res.data?.meta || pagination);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchValues();
  }, []);

  useEffect(() => {
    fetchPersonnel(1);
  }, [search, filters]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };
    if (!isExportOpen) return undefined;
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isExportOpen]);

  const buildFormDataFromItem = (item = {}) => {
    const normalizeGenreValue = (value) => {
      const normalized = String(value || '').trim().toLowerCase();
      if (!normalized) return '';
      if (normalized === 'homme' || normalized === 'masculin') return 'Homme';
      if (normalized === 'femme' || normalized === 'feminin' || normalized === 'féminin') return 'Femme';
      return '';
    };

    const next = { ...EMPTY_FORM };
    Object.keys(EMPTY_FORM).forEach((key) => {
      if (key === 'situation_handicap') {
        const raw = item?.[key];
        if (raw === true || raw === 1 || raw === '1' || raw === 'true') {
          next[key] = 'true';
        } else if (raw === false || raw === 0 || raw === '0' || raw === 'false') {
          next[key] = 'false';
        } else {
          next[key] = '';
        }
      } else if (key === 'genre') {
        next[key] = normalizeGenreValue(item?.[key]);
      } else {
        next[key] = item?.[key] ?? '';
      }
    });
    return next;
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData(buildFormDataFromItem(item));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(EMPTY_FORM);
  };

  const clearForm = () => {
    if (editing) {
      setFormData(buildFormDataFromItem(editing));
      return;
    }
    setFormData(EMPTY_FORM);
  };

  const handleDelete = async () => {
    if (!confirming) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/personnel/${confirming.id}`);
      pushNotice('success', 'Personnel supprime.');
      fetchPersonnel();
    } catch (error) {
      pushNotice('error', 'Suppression impossible.');
    } finally {
      setConfirming(null);
    }
  };

  const handleDeleteVisible = async () => {
    if (loading || items.length === 0) return;

    const confirmed = window.confirm(
      `Supprimer les ${items.length} personnel(s) affiches dans les resultats ?`
    );
    if (!confirmed) return;

    try {
      const results = await Promise.allSettled(
        items.map((item) => axios.delete(`${import.meta.env.VITE_API_URL}/personnel/${item.id}`))
      );
      const deleted = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.length - deleted;

      if (failed === 0) {
        pushNotice('success', `${deleted} personnel(s) supprime(s).`);
      } else {
        pushNotice('error', `${deleted} supprime(s), ${failed} echec(s).`);
      }
      fetchPersonnel(1);
    } catch (error) {
      pushNotice('error', 'Suppression impossible.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...formData };
    try {
      if (editing?.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/personnel/${editing.id}`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/personnel`, payload);
      }
      closeForm();
      fetchPersonnel();
    } catch (error) {
      window.alert(error.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const columns = useMemo(
    () => [
      { key: 'code_etablissement', label: 'Code etablissement' },
      { key: 'code_annee', label: 'Code annee' },
      { key: 'ppr', label: 'PPR' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prenom' },
      { key: 'genre', label: 'Genre' },
      { key: 'date_naissance', label: 'Date naissance' },
      { key: 'lieu_naissance', label: 'Lieu naissance' },
      { key: 'nationalite', label: 'Nationalite' },
      { key: 'type_personnel', label: 'Type personnel' },
      { key: 'code_grade', label: 'Code grade' },
      { key: 'date_recrutement', label: 'Date recrutement' },
      { key: 'date_affectation_mesrsfc', label: 'Affectation MESRSFC' },
      { key: 'date_affectation_enseignement', label: 'Affectation enseignement' },
      { key: 'code_departement', label: 'Code departement' },
      { key: 'filiere_prof', label: 'Filiere de prof' },
      { key: 'fonction_exercee', label: 'Fonction exercee' },
      { key: 'service_affectation', label: 'Service affectation' },
      { key: 'situation_administrative', label: 'Situation administrative' },
      { key: 'nombre_diplomes', label: 'Nombre diplomes' },
      { key: 'diplome', label: 'Diplome' },
      { key: 'specialite', label: 'Specialite' },
      { key: 'universite_diplomante', label: 'Universite diplomante' },
      { key: 'autres_diplomes', label: 'Autres diplomes' },
      { key: 'situation_handicap', label: 'Situation handicap' },
    ],
    []
  );
  const columnKeys = useMemo(() => columns.map((c) => c.key), [columns]);

  const pushNotice = (type, message) => {
    setNotice({ type, message });
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 3200);
  };

  const hashValue = (value) => {
    let hash = 2166136261;
    const input = String(value);
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const makeCode = (value, salt = '') => {
    const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const CODE_ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const base = `${salt}::${String(value)}`;
    let seed = hashValue(base);
    const pick = (alphabet, length) => {
      let out = '';
      for (let i = 0; i < length; i += 1) {
        seed = (seed * 1103515245 + 12345) >>> 0;
        out += alphabet[seed % alphabet.length];
      }
      return out;
    };
    const partA = pick(CODE_LETTERS, 2);
    const partB = pick('0123456789', 2);
    const partC = pick(CODE_ALNUM, 4);
    return `${partA}${partB}-${partC}`;
  };

  const displayItems = useMemo(() => {
    if (!modeCode) return items;
    return items.map((item) => {
      const next = { ...item };
      columnKeys.forEach((key) => {
        const rawValue = String(item?.[key] ?? '').trim();
        if (!rawValue) {
          next[key] = '';
          return;
        }
        const cacheKey = `${key}::${rawValue}`;
        if (!codeCacheRef.current.has(cacheKey)) {
          codeCacheRef.current.set(cacheKey, makeCode(rawValue, key));
        }
        next[key] = codeCacheRef.current.get(cacheKey);
      });
      return next;
    });
  }, [columnKeys, items, modeCode]);

  const buildExportRows = (rows) =>
    rows.map((row) => {
      const next = {};
      columns.forEach((col) => {
        const value = row?.[col.key];
        next[col.label] = String(value ?? '').trim() !== '' ? value : '-';
      });
      return next;
    });

  const handleExportExcel = () => {
    try {
      const rows = buildExportRows(displayItems);
      const sheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Personnel');
      XLSX.writeFile(workbook, 'personnel-export.xlsx');
      pushNotice('success', 'Export Excel genere.');
    } catch (error) {
      pushNotice('error', 'Export Excel impossible.');
    }
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const margin = 24;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const rowHeight = 16;
      const colWidth = Math.max(40, pageWidth / columns.length);
      let y = margin + 24;

      doc.setFontSize(11);
      doc.text('Export personnel', margin, margin + 8);
      doc.setFontSize(8);

      const drawRow = (cells) => {
        let x = margin;
        cells.forEach((cell) => {
          const value = String(cell ?? '').slice(0, 18);
          doc.text(value, x + 2, y);
          x += colWidth;
        });
        y += rowHeight;
      };

      drawRow(columns.map((col) => col.label));
      displayItems.forEach((row) => {
        if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin + 8;
        }
        drawRow(columns.map((col) => row?.[col.key] ?? '-'));
      });

      doc.save('personnel-export.pdf');
      pushNotice('success', 'Export PDF genere.');
    } catch (error) {
      pushNotice('error', 'Export PDF impossible.');
    }
  };

  const normalizeImportKey = (key) => String(key || '').trim().toLowerCase().replace(/\s+/g, '_');

  const validateImportedRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ok: false, message: 'Fichier vide ou invalide.' };
    }
    const normalized = rows.map((row) => {
      const next = {};
      Object.entries(row || {}).forEach(([key, value]) => {
        const normalizedKey = normalizeImportKey(key);
        if (columnKeys.includes(normalizedKey)) {
          next[normalizedKey] = value ?? '';
        }
      });
      return next;
    });
    return { ok: true, rows: normalized };
  };

  const mergeImportedRows = (rows) => {
    const existing = new Map(items.map((item) => [String(item.id), item]));
    const merged = [...items];
    rows.forEach((row, index) => {
      const incomingId = row.id ? String(row.id) : null;
      if (incomingId && existing.has(incomingId)) {
        const current = existing.get(incomingId);
        const updated = { ...current, ...row };
        const idx = merged.findIndex((item) => String(item.id) === incomingId);
        if (idx >= 0) merged[idx] = updated;
      } else {
        merged.push({ id: `import-${Date.now()}-${index}`, ...EMPTY_FORM, ...row });
      }
    });
    setItems(merged);
    setPagination((prev) => ({ ...prev, total: merged.length }));
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let rows = [];
      if (ext === 'json') {
        const text = await file.text();
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : parsed?.data || [];
      } else if (ext === 'csv') {
        const text = await file.text();
        const workbook = XLSX.read(text, { type: 'string' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else if (ext === 'xlsx') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else {
        pushNotice('error', 'Format non supporte.');
        return;
      }

      const validation = validateImportedRows(rows);
      if (!validation.ok) {
        pushNotice('error', validation.message);
        return;
      }

      mergeImportedRows(validation.rows);
      pushNotice('success', `Import termine: ${validation.rows.length} lignes.`);
    } catch (error) {
      pushNotice('error', 'Import impossible.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const typePersonnel = String(formData.type_personnel || '').toLowerCase();
  const showTeacherFields = typePersonnel === 'enseignant';
  const showAdminFields = typePersonnel === 'administratif';

  const genreOptions = selectOptions.genre || ['Femme', 'Homme'];
  const typeOptions = selectOptions.type_personnel || ['Enseignant', 'Administratif'];

  const allowedFilterKeys = useMemo(() => new Set(['type_personnel']), []);
  const visibleFilterOptions = useMemo(
    () => (filterOptions || []).filter((opt) => allowedFilterKeys.has(opt.key)),
    [filterOptions, allowedFilterKeys]
  );
  const visibleValueOptions = useMemo(() => {
    const next = {};
    if (valueOptions?.type_personnel) {
      next.type_personnel = valueOptions.type_personnel;
    } else {
      next.type_personnel = ['Enseignant', 'Administratif'];
    }
    return next;
  }, [valueOptions]);

  const selectedTypePersonnel = useMemo(() => {
    const normalizeValue = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const typeFilters = (filters || [])
      .filter((filter) => String(filter?.field || filter?.key || '').toLowerCase() === 'type_personnel')
      .map((filter) => normalizeValue(filter?.value));

    if (typeFilters.length === 0) return '';
    return typeFilters[typeFilters.length - 1];
  }, [filters]);

  const showEnseignantTable = selectedTypePersonnel === 'enseignant';

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight font-display">Personnel</h1>
          <p className="text-slate-500 text-sm mt-2">Gestion complete du personnel universitaire.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchPersonnel(pagination.current_page)}
            className="h-10 w-10 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
          >
            <RefreshCcw size={16} className="mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => setModeCode((prev) => !prev)}
            className={`h-10 rounded-full border px-5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors ${
              modeCode
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mode Code
          </button>
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              className="h-10 rounded-full border border-slate-200 bg-white px-5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:bg-slate-100 shadow"
            >
              Export
            </button>
            {isExportOpen && (
              <div className="absolute right-0 z-[9999] mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsExportOpen(false);
                    handleExportPdf();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExportOpen(false);
                    handleExportExcel();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.csv,.json"
            className="hidden"
            onChange={(event) => handleImportFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="h-10 rounded-full border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:bg-slate-100 shadow"
          >
            Import
          </button>
        </div>
      </div>

      <div className="card-minimal p-6">
        <InlineSearchFilterBar
          search={search}
          setSearch={setSearch}
          filters={filters}
          setFilters={setFilters}
          filterOptions={visibleFilterOptions}
          valueOptions={visibleValueOptions}
          placeholder="Search..."
        />
      </div>

      {showEnseignantTable ? (
        <EnseignantSearch />
      ) : (
        <div className="card-minimal p-4 text-xs font-semibold text-slate-500">
          Choisissez <span className="text-slate-700">Type personnel: enseignant</span> pour voir le tableau des
          enseignants.
        </div>
      )}

      <div className="card-minimal p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-slate-900 font-display">Resultats</h2>
                <button
                  type="button"
                  onClick={handleDeleteVisible}
                  disabled={loading || items.length === 0}
                  className="rounded-lg border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
              <p className="text-xs text-slate-500">Toutes les colonnes requises sont visibles.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
              {pagination.total || 0} Resultats
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3">{col.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-sm text-slate-400">
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading && displayItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    {columns.map((col) => (
                      <td key={`${item.id}-${col.key}`} className="px-4 py-3">
                        {String(item[col.key] ?? '').trim() !== '' ? String(item[col.key]) : '-'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(item)}
                          className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <SearchX size={20} />
                        </span>
                        <span>Aucun resultat.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/40">
            <span className="text-[11px] font-semibold text-slate-500">
              {`Page ${pagination.current_page || 1}/${pagination.last_page || 1}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchPersonnel(Math.max(1, (pagination.current_page || 1) - 1))}
                disabled={(pagination.current_page || 1) <= 1}
                className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
              >
                Precedent
              </button>
              <button
                type="button"
                onClick={() => fetchPersonnel(Math.min(pagination.last_page || 1, (pagination.current_page || 1) + 1))}
                disabled={(pagination.current_page || 1) >= (pagination.last_page || 1)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeForm}></div>
          <div className="relative bg-white w-full max-w-6xl rounded-[32px] shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {editing ? 'Modifier personnel' : 'Nouveau personnel'}
                  </h3>
                  <p className="text-sm text-slate-500">Tous les champs requis sont disponibles.</p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Fermer
                </button>
              </div>

              <section className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Informations personnelles</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { key: 'code_etablissement', label: 'Code etablissement' },
                    { key: 'code_annee', label: 'Code annee' },
                    { key: 'ppr', label: 'PPR' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'prenom', label: 'Prenom' },
                    { key: 'genre', label: 'Genre', type: 'select', options: genreOptions },
                    { key: 'date_naissance', label: 'Date naissance', type: 'date' },
                    { key: 'lieu_naissance', label: 'Lieu naissance' },
                    { key: 'nationalite', label: 'Nationalite' },
                  ].map((field) => (
                    <label key={field.key} className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                      {field.label}
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        >
                          <option value="">--</option>
                          {field.options.map((opt) => (
                            <option key={`${field.key}-${opt}`} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={formData[field.key]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Informations professionnelles</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { key: 'type_personnel', label: 'Type personnel', type: 'select', options: typeOptions },
                    { key: 'code_grade', label: 'Code grade' },
                    { key: 'date_recrutement', label: 'Date recrutement', type: 'date' },
                    { key: 'date_affectation_mesrsfc', label: 'Affectation MESRSFC', type: 'date' },
                    { key: 'situation_administrative', label: 'Situation administrative' },
                  ].map((field) => (
                    <label key={field.key} className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                      {field.label}
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        >
                          <option value="">--</option>
                          {field.options.map((opt) => (
                            <option key={`${field.key}-${opt}`} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={formData[field.key]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      )}
                    </label>
                  ))}

                  {showTeacherFields && (
                    <>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                        Code departement
                        <input
                          type="text"
                          value={formData.code_departement}
                          onChange={(e) => setFormData((prev) => ({ ...prev, code_departement: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                        Date affectation enseignement
                        <input
                          type="date"
                          value={formData.date_affectation_enseignement}
                          onChange={(e) => setFormData((prev) => ({ ...prev, date_affectation_enseignement: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                        Filiere de prof
                        <input
                          type="text"
                          value={formData.filiere_prof}
                          onChange={(e) => setFormData((prev) => ({ ...prev, filiere_prof: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      </label>
                    </>
                  )}

                  {showAdminFields && (
                    <>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                        Fonction exercee
                        <input
                          type="text"
                          value={formData.fonction_exercee}
                          onChange={(e) => setFormData((prev) => ({ ...prev, fonction_exercee: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                        Service affectation
                        <input
                          type="text"
                          value={formData.service_affectation}
                          onChange={(e) => setFormData((prev) => ({ ...prev, service_affectation: e.target.value }))}
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                        />
                      </label>
                    </>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Diplomes</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { key: 'nombre_diplomes', label: 'Nombre diplomes' },
                    { key: 'diplome', label: 'Diplome' },
                    { key: 'specialite', label: 'Specialite' },
                    { key: 'universite_diplomante', label: 'Universite diplomante' },
                    { key: 'autres_diplomes', label: 'Autres diplomes' },
                  ].map((field) => (
                    <label key={field.key} className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                      {field.label}
                      <input
                        type="text"
                        value={formData[field.key]}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">Handicap</h4>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  Situation handicap
                  <select
                    value={formData.situation_handicap}
                    onChange={(e) => setFormData((prev) => ({ ...prev, situation_handicap: e.target.value }))}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                  >
                    <option value="">--</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </label>
              </section>

              <div className="flex flex-wrap justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-xl border border-amber-200 px-5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  {editing ? 'Mettre a jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed top-24 right-6 z-[9999] animate-fade-in">
          <div
            className={`toast ${
              notice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {notice.message}
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirming(null)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirmer la suppression</h3>
            <p className="mt-2 text-sm text-slate-600">
              Supprimer {confirming.nom} {confirming.prenom} ?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-rose-400/30"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelPage;
