import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { RefreshCcw, SearchX } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import InlineSearchFilterBar from '../../components/layout/InlineSearchFilterBar';

const TYPE_LOCAL_OPTIONS = [
  'Salle de cours',
  'Salle de TD',
  'Salle de TP',
  'Amphitheatre',
  'Laboratoire',
  'Bureau prof',
  'Bureau admin',
  'Bibliotheque',
  'Salle de conference',
  'Administration',
];

const EMPTY_FORM = {
  designation: '',
  type_local: '',
  nombre: '',
  capacite_unitaire: '',
  capacite_globale: '',
};

const BuildingsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [valueOptions, setValueOptions] = useState({});
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/batiments/filters`);
      setFilterOptions(res.data?.filter_options || []);
      setValueOptions(res.data?.value_options || {});
    } catch (error) {
      setFilterOptions([]);
      setValueOptions({});
    }
  };

  const fetchBuildings = async (page = pagination.current_page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/batiments/search`, {
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
  }, []);

  useEffect(() => {
    fetchBuildings(1);
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

  const buildFormDataFromItem = (item = {}) => ({
    designation: item.designation || '',
    type_local: item.type_local || '',
    nombre: item.nombre ?? '',
    capacite_unitaire: item.capacite_unitaire ?? '',
    capacite_globale: item.capacite_globale ?? '',
  });

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
      await axios.delete(`${import.meta.env.VITE_API_URL}/batiments/${confirming.id}`);
      pushNotice('success', 'Batiment supprime.');
      fetchBuildings();
    } catch (error) {
      pushNotice('error', 'Suppression impossible.');
    } finally {
      setConfirming(null);
    }
  };

  const handleDeleteVisible = async () => {
    if (loading || items.length === 0) return;

    const confirmed = window.confirm(
      `Supprimer les ${items.length} batiment(s) affiches dans les resultats ?`
    );
    if (!confirmed) return;

    try {
      const results = await Promise.allSettled(
        items.map((item) => axios.delete(`${import.meta.env.VITE_API_URL}/batiments/${item.id}`))
      );
      const deleted = results.filter((result) => result.status === 'fulfilled').length;
      const failed = results.length - deleted;

      if (failed === 0) {
        pushNotice('success', `${deleted} batiment(s) supprime(s).`);
      } else {
        pushNotice('error', `${deleted} supprime(s), ${failed} echec(s).`);
      }
      fetchBuildings(1);
    } catch (error) {
      pushNotice('error', 'Suppression impossible.');
    }
  };

  const computeCapaciteGlobale = (nombre, capacite) => {
    const n = Number(nombre);
    const c = Number(capacite);
    if (!Number.isFinite(n) || !Number.isFinite(c)) return '';
    return String(n * c);
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'nombre' || key === 'capacite_unitaire') {
        next.capacite_globale = computeCapaciteGlobale(
          key === 'nombre' ? value : prev.nombre,
          key === 'capacite_unitaire' ? value : prev.capacite_unitaire
        );
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...formData };
    try {
      if (editing?.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/batiments/${editing.id}`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/batiments`, payload);
      }
      closeForm();
      fetchBuildings();
    } catch (error) {
      window.alert(error.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const columns = useMemo(
    () => [
      { key: 'designation', label: 'Designation' },
      { key: 'type_local', label: 'Type local' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'capacite_unitaire', label: 'Capacite unitaire' },
      { key: 'capacite_globale', label: 'Capacite globale' },
    ],
    []
  );
  const columnKeys = useMemo(() => columns.map((c) => c.key), [columns]);
  const allowedFilterKeys = useMemo(() => new Set(['type_local']), []);
  const visibleFilterOptions = useMemo(
    () => (filterOptions || []).filter((opt) => allowedFilterKeys.has(opt.key)),
    [filterOptions, allowedFilterKeys]
  );
  const visibleValueOptions = useMemo(() => {
    const mergedTypeOptions = Array.from(
      new Set([...(TYPE_LOCAL_OPTIONS || []), ...(valueOptions?.type_local || [])])
    )
      .map((value) => String(value || '').trim())
      .filter((value) => value !== '')
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

    return { type_local: mergedTypeOptions };
  }, [valueOptions]);

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
      XLSX.utils.book_append_sheet(workbook, sheet, 'Batiments');
      XLSX.writeFile(workbook, 'batiments-export.xlsx');
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
      const colWidth = Math.max(60, pageWidth / columns.length);
      let y = margin + 24;

      doc.setFontSize(11);
      doc.text('Export batiments', margin, margin + 8);
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

      doc.save('batiments-export.pdf');
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

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight font-display">Batiments</h1>
          <p className="text-slate-500 text-sm mt-2">Gestion complete des batiments.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchBuildings(pagination.current_page)}
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
                      {String(item[col.key] ?? '').trim() !== '' ? item[col.key] : '-'}
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
              onClick={() => fetchBuildings(Math.max(1, (pagination.current_page || 1) - 1))}
              disabled={(pagination.current_page || 1) <= 1}
              className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
            >
              Precedent
            </button>
            <button
              type="button"
              onClick={() => fetchBuildings(Math.min(pagination.last_page || 1, (pagination.current_page || 1) + 1))}
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
          <div className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {editing ? 'Modifier batiment' : 'Nouveau batiment'}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  Designation
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => handleFieldChange('designation', e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  Type local
                  <select
                    value={formData.type_local}
                    onChange={(e) => handleFieldChange('type_local', e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                  >
                    <option value="">--</option>
                    {TYPE_LOCAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  Nombre
                  <input
                    type="number"
                    min="0"
                    value={formData.nombre}
                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  Capacite unitaire
                  <input
                    type="number"
                    min="0"
                    value={formData.capacite_unitaire}
                    onChange={(e) => handleFieldChange('capacite_unitaire', e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600">
                  Capacite globale (auto)
                  <input
                    type="number"
                    min="0"
                    value={formData.capacite_globale}
                    readOnly
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700"
                  />
                </label>
              </div>

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
              Supprimer le batiment {confirming.designation || confirming.nom || confirming.id} ?
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

export default BuildingsPage;
