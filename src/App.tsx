// --- Main Application Entry Point ---
// This file contains the entire frontend logic, including routing (via state),
// view components, and API integration.

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCheck, 
  Building2, 
  TrendingUp, 
  Clock, 
  RefreshCw,
  ChevronRight,
  Plus,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  DollarSign,
  History,
  Upload,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Profile, Opportunity, Position, Candidate, Staff, Client, Project, WorkHour, VersionInfo, OpportunityHoursSummary, EconomicSummary, WorkHoursSummary } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-600 hover:bg-slate-100"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className, title }: { children: React.ReactNode, className?: string, title?: string, key?: any }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {title && (
      <div className="px-6 py-4 border-bottom border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// --- Views ---

// --- Opportunities Module ---
// Manages sales leads, RFPs, and pre-sales efforts.
const OpportunitiesView = ({ profileId }: { profileId: string }) => {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'dashboard' | 'listado'>('dashboard');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState<number | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [hoursSummary, setHoursSummary] = useState<OpportunityHoursSummary[]>([]);
  const [editSection, setEditSection] = useState<'requirements' | 'technical' | 'economic' | 'hours'>('requirements');

  const fetchData = async () => {
    setLoading(true);
    const [oppsRes, summaryRes] = await Promise.all([
      fetch(`/api/opportunities/${profileId}`),
      fetch(`/api/opportunities-hours-summary/${profileId}`)
    ]);
    const oppsData = await oppsRes.json();
    const summaryData = await summaryRes.json();
    setOpps(oppsData);
    setHoursSummary(summaryData);
    setLoading(false);
  };

  const fetchOppDetails = async (id: number) => {
    const res = await fetch(`/api/opportunity/${id}`);
    const data = await res.json();
    setSelectedOpp(data);
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  useEffect(() => {
    if (selectedOppId) {
      fetchOppDetails(selectedOppId);
    } else {
      setSelectedOpp(null);
    }
  }, [selectedOppId]);

  const handleCreateOpp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, profile_id: profileId })
    });
    setShowNewModal(false);
    fetchData();
  };

  const handleUpdateOpp = async (updates: Partial<Opportunity>) => {
    if (!selectedOppId) return;
    await fetch(`/api/opportunities/${selectedOppId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchOppDetails(selectedOppId);
    fetchData();
  };

  const handleAddProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOppId) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/opportunity-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, opportunity_id: selectedOppId })
    });
    fetchOppDetails(selectedOppId);
    fetchData();
    e.currentTarget.reset();
  };

  const handleAddTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOppId) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/opportunity-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, opportunity_id: selectedOppId })
    });
    fetchOppDetails(selectedOppId);
    fetchData();
    e.currentTarget.reset();
  };

  const handleAddHours = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOppId) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/opportunity-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, opportunity_id: selectedOppId })
    });
    fetchOppDetails(selectedOppId);
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'RFP' | 'ADDITIONAL' | 'TECHNICAL_OFFER') => {
    if (!selectedOppId || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
    const uploadResult = await uploadRes.json();
    
    await fetch('/api/opportunity-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunity_id: selectedOppId,
        type,
        file_name: uploadResult.file_name,
        file_path: uploadResult.file_path,
        mime_type: uploadResult.mime_type
      })
    });
    fetchOppDetails(selectedOppId);
  };

  const renderDashboard = () => {
    const stats = [
      { label: 'En Licitación', value: opps.filter(o => o.status === 'En licitacion').length, color: 'text-blue-600' },
      { label: 'Ganadas', value: opps.filter(o => o.status === 'Ganada').length, color: 'text-emerald-600' },
      { label: 'Perdidas', value: opps.filter(o => o.status === 'Perdida').length, color: 'text-rose-600' },
      { label: 'Going Review', value: opps.filter(o => o.status === 'Going Review').length, color: 'text-amber-600' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <Card key={s.label}>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <p className={cn("text-3xl font-bold mt-1", s.color)}>{s.value}</p>
            </Card>
          ))}
        </div>
        
        <Card title="Evolución de Oportunidades">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Horas Totales por Persona y Oportunidad">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Oportunidad (Cliente)</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Persona</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Total Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hoursSummary.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-medium">{item.client_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.staff_name}</td>
                    <td className="px-4 py-3 text-sm text-indigo-600 font-bold text-right">{item.total_hours}h</td>
                  </tr>
                ))}
                {hoursSummary.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic text-sm">No hay registros de horas aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderListado = () => (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button onClick={() => setShowNewModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Nueva Oportunidad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opps.map(opp => (
          <Card key={opp.id} title={opp.client_name}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estado:</span>
                <span className={cn("font-bold px-2 py-0.5 rounded-full text-[10px] uppercase", 
                  opp.status === 'Ganada' ? "bg-emerald-100 text-emerald-700" :
                  opp.status === 'Perdida' ? "bg-rose-100 text-rose-700" :
                  "bg-blue-100 text-blue-700"
                )}>{opp.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">RFP:</span>
                <span className="font-medium">{opp.rfp_date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sector:</span>
                <span className="font-medium">{opp.sector}</span>
              </div>
              <div className="pt-4 flex gap-2">
                <button 
                  onClick={() => setSelectedOppId(opp.id)}
                  className="flex-1 text-xs bg-indigo-50 text-indigo-700 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} /> Gestionar
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEditView = () => {
    if (!selectedOpp) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedOppId(null)} className="text-slate-400 hover:text-slate-600">
            <Plus className="rotate-45" size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Gestionar: {selectedOpp.client_name}</h2>
          <div className="ml-auto flex gap-2">
            {['requirements', 'technical', 'economic', 'hours'].map((s: any) => (
              <button 
                key={s}
                onClick={() => setEditSection(s)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  editSection === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {s === 'requirements' && 'Requerimientos'}
                {s === 'technical' && 'Oferta Técnica'}
                {s === 'economic' && 'Económico'}
                {s === 'hours' && 'Horas'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {editSection === 'requirements' && (
              <div className="space-y-6">
                <Card title="Documentos de Requerimientos">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 transition-colors cursor-pointer relative">
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Subir RFP Oficial</span>
                        <input type="file" onChange={(e) => handleFileUpload(e, 'RFP')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 transition-colors cursor-pointer relative">
                        <Upload size={24} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Añadir Documentos Adicionales</span>
                        <input type="file" multiple onChange={(e) => handleFileUpload(e, 'ADDITIONAL')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedOpp.documents?.filter(d => d.type !== 'TECHNICAL_OFFER').map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-indigo-500" />
                            <div>
                              <p className="text-sm font-bold text-slate-800">{doc.file_name}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">{doc.type}</p>
                            </div>
                          </div>
                          <a href={`/${doc.file_path}`} download className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Download size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                <Card title="Descripción / Notas (Markdown)">
                  <textarea 
                    className="w-full p-4 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows={6}
                    defaultValue={selectedOpp.description}
                    onBlur={(e) => handleUpdateOpp({ description: e.target.value })}
                    placeholder="Escribe aquí notas o descripción de la oportunidad..."
                  />
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedOpp.description || '*Sin descripción*'}</ReactMarkdown>
                  </div>
                </Card>
              </div>
            )}

            {editSection === 'technical' && (
              <div className="space-y-6">
                <Card title="Oferta Técnica (Trabajo)">
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-indigo-400 transition-colors cursor-pointer relative">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">Subir Borrador de Oferta</p>
                        <p className="text-xs text-slate-400">Word o PowerPoint para previsualización</p>
                      </div>
                      <input type="file" onChange={(e) => handleFileUpload(e, 'TECHNICAL_OFFER')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      {selectedOpp.documents?.filter(d => d.type === 'TECHNICAL_OFFER').map(doc => (
                        <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-indigo-600" />
                              <span className="font-bold text-slate-800">{doc.file_name}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Eye size={18} /></button>
                              <a href={`/${doc.file_path}`} download className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download size={18} /></a>
                            </div>
                          </div>
                          <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 italic text-sm">
                            Previsualización de {doc.file_name.split('.').pop()?.toUpperCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {editSection === 'economic' && (
              <div className="space-y-6">
                <Card title="Gestión de Perfiles">
                  <form onSubmit={handleAddProfile} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Perfil</label>
                      <input name="profile_title" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" placeholder="Ej: Analista" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">CSR</label>
                      <input name="csr" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" placeholder="Ej: CSR-3" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Cant.</label>
                      <input name="quantity" type="number" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Coste</label>
                      <div className="flex gap-2">
                        <input name="cost" type="number" step="0.01" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
                        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Perfil</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">CSR</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Cant.</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Coste</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOpp.profiles?.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm font-medium">{item.profile_title}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{item.csr}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 font-bold text-right">{item.cost.toLocaleString()}€</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card title="Gestión de Herramientas">
                  <form onSubmit={handleAddTool} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Herramienta</label>
                      <input name="tool_name" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" placeholder="Ej: Laptop" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Coste</label>
                      <div className="flex gap-2">
                        <input name="cost" type="number" step="0.01" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
                        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Herramienta</th>
                          <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Coste</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOpp.tools?.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm font-medium">{item.tool_name}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 font-bold text-right">{item.cost.toLocaleString()}€</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {editSection === 'hours' && (
              <div className="space-y-6">
                <Card title="Horas Dedicadas">
                  <form onSubmit={handleAddHours} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Responsable</label>
                      <input name="staff_name" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Horas</label>
                      <input name="hours" type="number" step="0.5" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha</label>
                      <div className="flex gap-2">
                        <input name="date" type="date" required className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm" />
                        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="space-y-2">
                    {selectedOpp.hours?.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                            {log.staff_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{log.staff_name}</p>
                            <p className="text-[10px] text-slate-400">{log.date}</p>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-indigo-600">{log.hours}h</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card title="Detalles Generales">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estado</label>
                  <select 
                    value={selectedOpp.status}
                    onChange={(e) => handleUpdateOpp({ status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                  >
                    <option>Going Review</option>
                    <option>En licitacion</option>
                    <option>Entregada</option>
                    <option>Ganada</option>
                    <option>Perdida</option>
                    <option>Desestimada</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sector</label>
                  <input 
                    defaultValue={selectedOpp.sector}
                    onBlur={(e) => handleUpdateOpp({ sector: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Responsable</label>
                  <input 
                    defaultValue={selectedOpp.owner}
                    onBlur={(e) => handleUpdateOpp({ owner: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Fecha RFP</label>
                  <input 
                    type="date"
                    defaultValue={selectedOpp.rfp_date}
                    onBlur={(e) => handleUpdateOpp({ rfp_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" 
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (selectedOppId) return renderEditView();

  return (
    <div className="space-y-8">
      <div className="flex border-b border-slate-200">
        {(['dashboard', 'listado'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all border-b-2 capitalize",
              subTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {subTab === 'dashboard' ? renderDashboard() : renderListado()}

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Nueva Oportunidad">
        <form onSubmit={handleCreateOpp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Cliente</label>
              <input name="client_name" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Fecha RFP</label>
              <input type="date" name="rfp_date" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Fecha Preguntas</label>
              <input type="date" name="questions_date" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Sector</label>
              <input name="sector" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Responsable</label>
              <input name="owner" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
              <select name="status" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option>Going Review</option>
                <option>En licitacion</option>
                <option>Entregada</option>
                <option>Ganada</option>
                <option>Perdida</option>
                <option>Desestimada</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Descripción / Notas (Markdown)</label>
              <textarea name="description" rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="Soporta Markdown..." />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Crear Oportunidad
          </button>
        </form>
      </Modal>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Plus className="rotate-45" size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// --- Recruiting Module ---
// Manages job positions and candidate pipelines.
const RecruitingView = ({ profileId }: { profileId: string }) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'posiciones' | 'staffing' | 'becarios'>('dashboard');
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showPosModal, setShowPosModal] = useState(false);
  const [showCandModal, setShowCandModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [posRes, candRes] = await Promise.all([
      fetch(`/api/positions/${profileId}`),
      fetch(`/api/candidates-by-profile/${profileId}`)
    ]);
    const posData = await posRes.json();
    const candData = await candRes.json();
    setPositions(posData);
    setCandidates(candData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const handleSavePosition = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...data, 
        profile_id: profileId,
        ciber_ongoing: formData.get('ciber_ongoing') === 'on'
      })
    });
    setShowPosModal(false);
    fetchData();
  };

  const handleSaveCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Handle CV upload if present
    let cv_path = '';
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const uploadData = new FormData();
      uploadData.append('file', fileInput.files[0]);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const uploadResult = await uploadRes.json();
      cv_path = uploadResult.file_path;
    }

    await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...data, 
        cv_path,
        type: subTab === 'staffing' ? 'STAFF' : 'BECA',
        status: 'Pendiente de entrevista'
      })
    });
    setShowCandModal(false);
    fetchData();
  };

  const handleUpdateCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch(`/api/candidates/${selectedCandidate.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setSelectedCandidate(null);
    fetchData();
  };

  const renderDashboard = () => {
    const staffingCount = candidates.filter(c => c.type === 'STAFF').length;
    const becaCount = candidates.filter(c => c.type === 'BECA').length;
    
    const statusData = [
      { name: 'Pendiente', value: candidates.filter(c => c.status === 'Pendiente de entrevista').length },
      { name: 'Paso a People', value: candidates.filter(c => c.status === 'Paso a People').length },
      { name: 'Carta Oferta', value: candidates.filter(c => c.status === 'Pendiente de carta oferta').length },
      { name: 'Standby', value: candidates.filter(c => c.status === 'Standby').length },
      { name: 'NotPass', value: candidates.filter(c => c.status === 'NotPass').length },
    ].filter(d => d.value > 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-l-4 border-indigo-500">
            <p className="text-slate-500 text-sm font-medium">Posiciones Abiertas</p>
            <p className="text-3xl font-bold text-slate-800">{positions.length}</p>
          </Card>
          <Card className="bg-white border-l-4 border-emerald-500">
            <p className="text-slate-500 text-sm font-medium">Candidatos Staffing</p>
            <p className="text-3xl font-bold text-slate-800">{staffingCount}</p>
          </Card>
          <Card className="bg-white border-l-4 border-amber-500">
            <p className="text-slate-500 text-sm font-medium">Candidatos Becarios</p>
            <p className="text-3xl font-bold text-slate-800">{becaCount}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Estado de Candidaturas">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#64748b', '#ef4444'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#64748b', '#ef4444'][i % 5] }}></div>
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <Card title="Posiciones por Categoría">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positions.slice(0, 5).map(p => ({ name: p.title, count: candidates.filter(c => c.position_id === p.id).length }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderPositions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Posiciones Abiertas</h3>
        <button 
          onClick={() => setShowPosModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Nueva Posición
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positions.map(pos => (
          <Card key={pos.id} title={pos.title} className="hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Everjob:</span>
                <span className="font-mono font-medium">{pos.everjob_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rango:</span>
                <span className="font-medium">{pos.salary_range || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Candidatos:</span>
                <span className="font-medium">{candidates.filter(c => c.position_id === pos.id).length}</span>
              </div>
              {pos.description && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 prose prose-xs max-w-none">
                  <ReactMarkdown>{pos.description}</ReactMarkdown>
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 gap-2">
                {['required_education', 'fundamental_knowledge', 'languages'].map(field => (
                  (pos as any)[field] && (
                    <div key={field} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{field.replace('_', ' ')}</p>
                      <div className="p-2 bg-slate-50 rounded border border-slate-100 prose prose-xs max-w-none">
                        <ReactMarkdown>{(pos as any)[field]}</ReactMarkdown>
                      </div>
                    </div>
                  )
                ))}
              </div>
              {pos.ciber_ongoing && (
                <div className="mt-2 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block font-semibold uppercase">Ciber Ongoing</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCandidateList = (type: 'STAFF' | 'BECA') => {
    const filtered = candidates.filter(c => c.type === type);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">{type === 'STAFF' ? 'Staffing' : 'Becarios'}</h3>
          <button 
            onClick={() => setShowCandModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> Nuevo Perfil
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Posición</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exp.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{c.position_title}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{c.years_experience} años</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider",
                      c.status === 'NotPass' ? "bg-red-100 text-red-700" : 
                      c.status === 'Pendiente de carta oferta' ? "bg-emerald-100 text-emerald-700" :
                      "bg-indigo-100 text-indigo-700"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedCandidate(c)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                    >
                      Editar Perfil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex border-b border-slate-200">
        {(['dashboard', 'posiciones', 'staffing', 'becarios'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all border-b-2 capitalize",
              subTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'dashboard' && renderDashboard()}
      {subTab === 'posiciones' && renderPositions()}
      {subTab === 'staffing' && renderCandidateList('STAFF')}
      {subTab === 'becarios' && renderCandidateList('BECA')}

      {/* Position Modal */}
      <Modal isOpen={showPosModal} onClose={() => setShowPosModal(false)} title="Nueva Posición">
        <form onSubmit={handleSavePosition} className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Sección General</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la posición</label>
                <input name="title" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Código Everjob</label>
                <input name="everjob_code" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Entrevistadores</label>
                <input name="interviewers" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Separados por comas" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Categorías a cubrir</label>
                <input name="categories" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" name="ciber_ongoing" id="ciber_ongoing" className="w-4 h-4 text-indigo-600" />
                <label htmlFor="ciber_ongoing" className="text-sm font-medium text-slate-700">Listado de Peticiones de Ciber Ongoing</label>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Descripción de la posición (Markdown)</label>
                <textarea name="description" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="Soporta Markdown..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Sección de Detalle</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Rango Salarial</label>
                <input name="salary_range" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Idiomas</label>
                <input name="languages" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Formación Requerida</label>
                <textarea name="required_education" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Formación Técnica Complementaria</label>
                <textarea name="complementary_training" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Conocimientos Fundamentales</label>
                <textarea name="fundamental_knowledge" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Conocimientos Valorables</label>
                <textarea name="valuable_knowledge" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Crear Posición
          </button>
        </form>
      </Modal>

      {/* Candidate Modal */}
      <Modal isOpen={showCandModal} onClose={() => setShowCandModal(false)} title="Nuevo Perfil">
        <form onSubmit={handleSaveCandidate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la persona</label>
              <input name="name" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Posición</label>
              <select name="position_id" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="">Seleccionar...</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Años de experiencia</label>
              <input type="number" name="years_experience" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Banda Salarial</label>
              <input name="salary_band" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Subir CV</label>
              <input type="file" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Crear Perfil
          </button>
        </form>
      </Modal>

      {/* Extended Edit Modal */}
      <Modal isOpen={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} title={`Editar Perfil: ${selectedCandidate?.name}`}>
        <form onSubmit={handleUpdateCandidate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Estado de la candidatura</label>
              <select name="status" defaultValue={selectedCandidate?.status} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option>Pendiente de entrevista</option>
                <option>Paso a People</option>
                <option>Pendiente de carta oferta</option>
                <option>Standby</option>
                <option>NotPass</option>
                <option>No presentado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Fecha de incorporación</label>
              <input type="date" name="incorporation_date" defaultValue={selectedCandidate?.incorporation_date} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ciudad de residencia</label>
              <input name="city" defaultValue={selectedCandidate?.city} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            {['education', 'certifications', 'knowledge', 'languages', 'notes'].map(field => (
              <div key={field} className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase capitalize">{field === 'notes' ? 'Notas Adicionales' : field}</label>
                <textarea 
                  name={field} 
                  defaultValue={(selectedCandidate as any)?.[field]} 
                  rows={field === 'notes' ? 4 : 2} 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" 
                />
                <div className="mt-1 p-2 bg-slate-50 rounded-lg border border-slate-100 prose prose-xs max-w-none">
                  <ReactMarkdown>{(selectedCandidate as any)?.[field] || `*Sin ${field}*`}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
            Guardar Cambios
          </button>
        </form>
      </Modal>
    </div>
  );
};

// --- Staffing Module ---
// Manages internal employee records, CVs, annual reviews, and vacations.
const StaffingView = ({ profileId }: { profileId: string }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [subTab, setSubTab] = useState<'dashboard' | 'integrantes'>('dashboard');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editSection, setEditSection] = useState<'general' | 'annual' | 'vacations'>('general');

  const fetchData = async () => {
    const res = await fetch(`/api/staff/${profileId}`);
    const data = await res.json();
    setStaff(data);
  };

  const fetchStaffDetails = async (id: number) => {
    const res = await fetch(`/api/staff-details/${id}`);
    const data = await res.json();
    setSelectedStaff(data);
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  useEffect(() => {
    if (selectedStaffId) {
      fetchStaffDetails(selectedStaffId);
    } else {
      setSelectedStaff(null);
    }
  }, [selectedStaffId]);

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('profile_id', profileId);
    await fetch('/api/staff', {
      method: 'POST',
      body: formData
    });
    setShowNewModal(false);
    fetchData();
  };

  const handleAddAnnual = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/staff-annual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, staff_id: selectedStaffId })
    });
    fetchStaffDetails(selectedStaffId);
  };

  const handleAddVacation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/staff-vacations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, staff_id: selectedStaffId })
    });
    fetchStaffDetails(selectedStaffId);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Equipo</p>
          <p className="text-3xl font-bold mt-1 text-indigo-600">{staff.length}</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Promedio Antigüedad</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">2.4 años</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Vacaciones Pendientes</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">142 días</p>
        </Card>
      </div>
      <Card title="Distribución por Categoría">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Junior', value: staff.filter(s => s.csr.includes('1')).length },
              { name: 'Middle', value: staff.filter(s => s.csr.includes('2')).length },
              { name: 'Senior', value: staff.filter(s => s.csr.includes('3')).length },
              { name: 'Expert', value: staff.filter(s => s.csr.includes('4')).length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );

  const renderIntegrantes = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowNewModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Añadir Persona
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">CSR</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                <td className="px-6 py-4 text-slate-600">{s.email}</td>
                <td className="px-6 py-4 text-slate-600">{s.csr}</td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedStaffId(s.id)} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1">
                    <Edit3 size={14} /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEditView = () => {
    if (!selectedStaff) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedStaffId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Plus size={20} className="rotate-45" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">{selectedStaff.name}</h2>
        </div>

        <div className="flex gap-4 border-b border-slate-200">
          {(['general', 'annual', 'vacations'] as const).map(section => (
            <button
              key={section}
              onClick={() => setEditSection(section)}
              className={cn(
                "px-4 py-2 text-sm font-bold transition-all border-b-2 capitalize",
                editSection === section ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              {section}
            </button>
          ))}
        </div>

        {editSection === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Información Personal">
              <div className="space-y-3">
                <p><span className="text-xs font-bold text-slate-400 uppercase">Email:</span> {selectedStaff.email}</p>
                <p><span className="text-xs font-bold text-slate-400 uppercase">Nº Empleado:</span> {selectedStaff.employee_number}</p>
                <p><span className="text-xs font-bold text-slate-400 uppercase">CSR:</span> {selectedStaff.csr}</p>
                <p><span className="text-xs font-bold text-slate-400 uppercase">Antigüedad:</span> {selectedStaff.seniority_date}</p>
              </div>
            </Card>
            <Card title="Perfil Profesional">
              <div className="space-y-3">
                <p><span className="text-xs font-bold text-slate-400 uppercase">Perfil Salarial:</span> {selectedStaff.salary_profile}</p>
                <p><span className="text-xs font-bold text-slate-400 uppercase">Banda de Progreso:</span> {selectedStaff.category_band}</p>
                {selectedStaff.cv_path && (
                  <a href={`/${selectedStaff.cv_path}`} download className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                    <Download size={16} /> Descargar CV
                  </a>
                )}
              </div>
            </Card>
          </div>
        )}

        {editSection === 'annual' && (
          <div className="space-y-6">
            <Card title="Objetivos y Formación">
              <form onSubmit={handleAddAnnual} className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                    <select name="type" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                      <option value="Objetivo">Objetivo</option>
                      <option value="Formación">Formación</option>
                      <option value="Feedback">Feedback</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Contenido (Markdown)</label>
                    <textarea name="content" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono" rows={3} placeholder="Describe el objetivo o formación..." />
                  </div>
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors">
                  Añadir Registro
                </button>
              </form>
              <div className="space-y-4">
                {selectedStaff.annual?.map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">{item.type}</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {editSection === 'vacations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Días Totales</p>
                <p className="text-3xl font-bold mt-1 text-slate-800">23</p>
              </Card>
              <Card>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Días Disfrutados</p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">
                  {selectedStaff.vacations?.reduce((acc, curr) => acc + curr.days, 0) || 0}
                </p>
              </Card>
              <Card>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Días Restantes</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">
                  {23 - (selectedStaff.vacations?.reduce((acc, curr) => acc + curr.days, 0) || 0)}
                </p>
              </Card>
            </div>
            <Card title="Registrar Vacaciones">
              <form onSubmit={handleAddVacation} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Inicio</label>
                  <input name="start_date" type="date" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fin</label>
                  <input name="end_date" type="date" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Días</label>
                  <input name="days" type="number" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors">
                    Registrar
                  </button>
                </div>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Periodo</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Días</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStaff.vacations?.map(v => (
                      <tr key={v.id}>
                        <td className="px-4 py-3 text-sm">{v.start_date} al {v.end_date}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">{v.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };

  if (selectedStaffId) return renderEditView();

  return (
    <div className="space-y-8">
      <div className="flex border-b border-slate-200">
        {(['dashboard', 'integrantes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all border-b-2 capitalize",
              subTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'dashboard' ? renderDashboard() : renderIntegrantes()}

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Añadir Integrante">
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
              <input name="name" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input name="email" type="email" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nº Empleado</label>
              <input name="employee_number" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">CSR</label>
              <input name="csr" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Fecha Antigüedad</label>
              <input name="seniority_date" type="date" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Perfil Salarial</label>
              <input name="salary_profile" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Banda de Progreso</label>
              <input name="category_band" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">CV (PDF/Word)</label>
              <input name="cv" type="file" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Crear Integrante
          </button>
        </form>
      </Modal>
    </div>
  );
};

// --- Clients & Projects Module ---
// Manages client relationships and specific project definitions.
const ClientsView = ({ profileId }: { profileId: string }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [subTab, setSubTab] = useState<'dashboard' | 'clientes' | 'proyectos'>('dashboard');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const fetchData = async () => {
    const res = await fetch(`/api/clients/${profileId}`);
    const data = await res.json();
    setClients(data);
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, profile_id: profileId })
    });
    setShowClientModal(false);
    fetchData();
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowProjectModal(false);
    fetchData();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Clientes</p>
          <p className="text-3xl font-bold mt-1 text-indigo-600">{clients.length}</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Proyectos Activos</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">12</p>
        </Card>
      </div>
    </div>
  );

  const renderClientes = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowClientModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map(client => (
          <Card key={client.id} title={client.name}>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{client.info}</ReactMarkdown>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProyectos = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowProjectModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map(client => (
          <div key={client.id} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">{client.name}</h3>
            <ProjectList clientId={client.id} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex border-b border-slate-200">
        {(['dashboard', 'clientes', 'proyectos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all border-b-2 capitalize",
              subTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'dashboard' ? renderDashboard() : subTab === 'clientes' ? renderClientes() : renderProyectos()}

      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)} title="Nuevo Cliente">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Cliente</label>
            <input name="name" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Información (Markdown)</label>
            <textarea name="info" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={5} />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Crear Cliente
          </button>
        </form>
      </Modal>

      <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title="Nuevo Proyecto">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
            <select name="client_id" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Proyecto</label>
              <input name="name" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
              <input name="code" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
            <textarea name="description" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Costes</label>
              <input name="costs" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Precio Venta</label>
              <input name="sales_price" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Crear Proyecto
          </button>
        </form>
      </Modal>
    </div>
  );
};

const ProjectList = ({ clientId }: { clientId: number }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${clientId}`)
      .then(res => res.json())
      .then(setProjects);
  }, [clientId]);

  return (
    <div className="space-y-2">
      {projects.map(p => (
        <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-slate-800">{p.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{p.code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-600">{p.sales_price.toLocaleString()}€</p>
              <p className="text-[10px] text-slate-400">Venta</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2">{p.description}</p>
        </div>
      ))}
      {projects.length === 0 && <p className="text-xs text-slate-400 italic">No hay proyectos registrados.</p>}
    </div>
  );
};

// --- Work Hours Module ---
// Tracks billable time for staff members on specific projects.
const HoursView = ({ profileId }: { profileId: string }) => {
  const [hours, setHours] = useState<WorkHour[]>([]);
  const [summary, setSummary] = useState<WorkHoursSummary[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subTab, setSubTab] = useState<'dashboard' | 'gestion'>('dashboard');
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    const [hRes, sRes, stRes, cRes] = await Promise.all([
      fetch(`/api/work-hours/${profileId}`),
      fetch(`/api/work-hours-summary/${profileId}`),
      fetch(`/api/staff/${profileId}`),
      fetch(`/api/clients/${profileId}`)
    ]);
    setHours(await hRes.json());
    setSummary(await sRes.json());
    setStaff(await stRes.json());
    setClients(await cRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const handleClientChange = async (clientId: string) => {
    const res = await fetch(`/api/projects/${clientId}`);
    setProjects(await res.json());
  };

  const handleAddHours = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await fetch('/api/work-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowModal(false);
    fetchData();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Horas Totales</p>
          <p className="text-3xl font-bold mt-1 text-indigo-600">
            {summary.reduce((acc, curr) => acc + curr.total_hours, 0).toFixed(1)}h
          </p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Coste Equipo</p>
          <p className="text-3xl font-bold mt-1 text-slate-800">
            {summary.reduce((acc, curr) => acc + curr.total_cost, 0).toLocaleString()}€
          </p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Beneficio Generado</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">
            {summary.reduce((acc, curr) => acc + (curr.total_sales - curr.total_cost), 0).toLocaleString()}€
          </p>
        </Card>
      </div>

      <Card title="Resumen por Persona y Proyecto">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Persona</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Proyecto</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Horas</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Coste</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-right">Beneficio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{s.staff_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.project_name}</td>
                  <td className="px-4 py-3 text-sm text-right">{s.total_hours}h</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-500">{s.total_cost.toLocaleString()}€</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-emerald-600">
                    {(s.total_sales - s.total_cost).toLocaleString()}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderGestion = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} /> Imputar Horas
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proyecto</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Horas</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Beneficio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hours.map(h => (
              <tr key={h.id}>
                <td className="px-6 py-4 text-sm font-medium">{h.staff_name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{h.project_name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{h.date}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{h.hours}h</td>
                <td className="px-6 py-4 text-sm text-emerald-600 font-medium">
                  +{(h.hours * (h.sales_per_hour - h.cost_per_hour)).toFixed(2)}€
                </td>
              </tr>
            ))}
            {hours.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No hay registros de horas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex border-b border-slate-200">
        {(['dashboard', 'gestion'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all border-b-2 capitalize",
              subTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'dashboard' ? renderDashboard() : renderGestion()}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Imputar Horas">
        <form onSubmit={handleAddHours} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Persona</label>
              <select name="staff_id" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                <option value="">Seleccionar...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
              <select onChange={(e) => handleClientChange(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                <option value="">Seleccionar...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Proyecto</label>
              <select name="project_id" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                <option value="">Seleccionar...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
              <input name="date" type="date" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Horas</label>
              <input name="hours" type="number" step="0.5" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Coste/Hora (€)</label>
              <input name="cost_per_hour" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Venta/Hora (€)</label>
              <input name="sales_per_hour" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Registrar Horas
          </button>
        </form>
      </Modal>
    </div>
  );
};

// --- Economic View ---
// Aggregates data from projects and work hours to provide a financial overview.
const EconomicView = ({ profileId }: { profileId: string }) => {
  const [summary, setSummary] = useState<EconomicSummary[]>([]);
  const [subTab, setSubTab] = useState<'dashboard' | 'gestion'>('dashboard');

  const fetchData = async () => {
    const res = await fetch(`/api/economic-summary/${profileId}`);
    const data = await res.json();
    setSummary(data);
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  const chartData = summary.map(s => ({
    name: s.name,
    gastos: s.total_costs,
    beneficios: s.total_sales - s.total_costs
  }));

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gastos Totales</p>
          <p className="text-3xl font-bold mt-1 text-slate-800">
            {summary.reduce((acc, curr) => acc + curr.total_costs, 0).toLocaleString()}€
          </p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ventas Totales</p>
          <p className="text-3xl font-bold mt-1 text-indigo-600">
            {summary.reduce((acc, curr) => acc + curr.total_sales, 0).toLocaleString()}€
          </p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Margen Neto</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">
            {summary.reduce((acc, curr) => acc + (curr.total_sales - curr.total_costs), 0).toLocaleString()}€
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Balance por Cliente" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="beneficios" name="Beneficio" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gasto" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card title="Distribución de Ventas">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.map(s => ({ name: s.name, value: s.total_sales }))}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {summary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#818cf8', '#c7d2fe', '#4f46e5'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderGestion = () => (
    <div className="space-y-8">
      {summary.map(client => (
        <div key={client.id} className="space-y-4">
          <div className="flex justify-between items-end border-b border-slate-200 pb-2">
            <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Balance Cliente</p>
              <p className={cn("text-lg font-bold", (client.total_sales - client.total_costs) >= 0 ? "text-emerald-600" : "text-red-600")}>
                {(client.total_sales - client.total_costs).toLocaleString()}€
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.projects.map(project => (
              <Card key={project.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{project.code}</span>
                </div>
                <p className="font-bold text-slate-800 mb-4">{project.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gastos Totales:</span>
                    <span className="font-bold text-red-600">{project.total_costs.toLocaleString()}€</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Ventas Totales:</span>
                    <span className="font-bold text-indigo-600">{project.total_sales.toLocaleString()}€</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                    <span className="font-bold text-slate-700">Margen:</span>
                    <span className={cn("font-bold", (project.total_sales - project.total_costs) >= 0 ? "text-emerald-600" : "text-red-600")}>
                      {(project.total_sales - project.total_costs).toLocaleString()}€
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex border-b border-slate-200">
        {(['dashboard', 'gestion'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-bold transition-all border-b-2 capitalize",
              subTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-slate-800">Gestión Económica</h2>
      
      {subTab === 'dashboard' ? renderDashboard() : renderGestion()}
    </div>
  );
};

const UpdateView = () => {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [updating, setUpdating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [credentials, setCredentials] = useState({ username: '', token: '' });

  useEffect(() => {
    fetch('/api/version').then(res => res.json()).then(setVersion);
  }, []);

  const handleUpdate = async () => {
    if (!credentials.username || !credentials.token) {
      alert("Por favor, introduce tu usuario y token de GitHub.");
      return;
    }

    setUpdating(true);
    setLogs(prev => [...prev, "Iniciando actualización...", "Conectando con repositorio GitHub: ConHdeHacker/PSBD-Mgmt..."]);
    
    try {
      const res = await fetch('/api/update', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setLogs(prev => [...prev, data.message, "Actualización completada con éxito."]);
      } else {
        setLogs(prev => [...prev, `Error: ${data.message}`]);
      }
    } catch (error) {
      setLogs(prev => [...prev, "Error de conexión con el servidor."]);
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/export';
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("¿Estás seguro? Esta acción reemplazará TODOS los datos actuales con los del archivo de respaldo.")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        const data = await res.json();
        if (data.status === 'success') {
          alert("Datos importados correctamente. La aplicación se recargará.");
          window.location.reload();
        } else {
          alert("Error al importar: " + data.error);
        }
      } catch (err) {
        alert("Error al procesar el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Copia de Seguridad">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Extrae o importa toda la información de la base de datos.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleExport}
                className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all"
              >
                <Download size={18} /> Exportar Datos (JSON)
              </button>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <button className="w-full border border-slate-200 text-slate-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <Upload size={18} /> Importar Datos (JSON)
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Configuración de GitHub">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Usuario GitHub</label>
              <input 
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Tu usuario"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Token de Acceso (PAT)</label>
              <input 
                type="password"
                value={credentials.token}
                onChange={(e) => setCredentials(prev => ({ ...prev, token: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ghp_xxxxxxxxxxxx"
              />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Actualización del Sistema">
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle size={14} /> 
              La actualización solo descarga cambios en el código. Tus datos (base de datos y archivos subidos) no se verán afectados.
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Versión Actual</p>
              <p className="text-2xl font-bold text-slate-800">{version?.current || '...'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Última Versión (GitHub)</p>
              {version?.error ? (
                <p className="text-xs text-rose-500 font-medium max-w-[150px] leading-tight">{version.error}</p>
              ) : (
                <p className="text-2xl font-bold text-indigo-600">{version?.latest || '...'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Últimos cambios en GitHub:</h4>
            <ul className="space-y-1">
              {version?.changes?.map((change, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <ChevronRight size={14} className="text-indigo-400" /> {change}
                </li>
              ))}
              {(!version || !version.changes || version.changes.length === 0) && <li className="text-sm text-slate-400 italic">No hay cambios recientes detectados.</li>}
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleUpdate}
              disabled={updating}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              <RefreshCw size={18} className={updating ? "animate-spin" : ""} />
              {updating ? "Actualizando..." : "Actualizar Ahora"}
            </button>
          </div>
        </div>
      </Card>

      <Card title="Logs de Actualización">
        <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 h-48 overflow-y-auto space-y-1">
          {logs.length === 0 && <span className="text-slate-600">Esperando acciones...</span>}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- Documentation View ---
// This component provides extensive documentation on how to use each module of the tool.

const DocumentationView = () => {
  const sections = [
    {
      title: "Introducción",
      content: "PSBD Management es una herramienta integral para la gestión de oportunidades de negocio, reclutamiento, personal, clientes y finanzas. Está diseñada para centralizar el flujo de trabajo desde la detección de una oportunidad hasta la ejecución del proyecto y el seguimiento de rentabilidad."
    },
    {
      title: "Módulo de Oportunidades",
      content: "Este módulo permite registrar y seguir licitaciones o leads de ventas.\n\n**Flujo recomendado:**\n1. Crear una nueva oportunidad con los datos básicos del cliente y fechas clave (RFP).\n2. En la vista de gestión, subir los documentos oficiales (RFP, pliegos).\n3. Definir los requerimientos de personal (Perfiles) y herramientas necesarias en la sección Económica.\n4. Registrar las horas dedicadas por el equipo de preventa para conocer el coste de adquisición.\n5. Cambiar el estado a 'Ganada' o 'Perdida' según el resultado."
    },
    {
      title: "Módulo de Recruiting",
      content: "Gestión de vacantes y candidatos.\n\n**Flujo recomendado:**\n1. Crear una 'Posición' (vacante) detallando requerimientos, banda salarial y estado.\n2. Añadir candidatos a cada posición.\n3. Gestionar el estado del candidato (Entrevista, Oferta, Contratado).\n4. Subir el CV del candidato para tenerlo centralizado."
    },
    {
      title: "Módulo de Staffing",
      content: "Gestión del equipo interno.\n\n**Flujo recomendado:**\n1. Dar de alta a los integrantes del equipo con sus datos contractuales y CV.\n2. En la ficha de cada empleado, gestionar sus objetivos anuales y formaciones.\n3. Registrar los periodos de vacaciones para llevar un control de días disfrutados y pendientes."
    },
    {
      title: "Módulo de Clientes y Proyectos",
      content: "Centralización de la relación con clientes y ejecución de trabajos.\n\n**Flujo recomendado:**\n1. Crear un Cliente.\n2. Dentro del cliente, crear Proyectos específicos asignando un código, presupuesto de costes y precio de venta.\n3. Estos proyectos serán los que aparezcan en el módulo de imputación de horas."
    },
    {
      title: "Módulo de Horas / TLs",
      content: "Seguimiento del tiempo dedicado a proyectos facturables.\n\n**Flujo recomendado:**\n1. Seleccionar la persona y el proyecto.\n2. Introducir las horas trabajadas y la fecha.\n3. Definir el coste por hora (salario) y venta por hora (tarifa cliente) para calcular el beneficio real generado por esa jornada."
    },
    {
      title: "Gestión Económica",
      content: "Dashboard financiero global.\n\nEste módulo agrega automáticamente los datos de todos los proyectos y horas imputadas para mostrar:\n- Gastos totales (Costes de proyecto + Costes de personal por horas).\n- Ventas totales (Presupuestos + Ventas por horas).\n- Margen neto real por cliente y proyecto."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Guía de Uso y Documentación</h2>
        <p className="text-slate-500">Aprende a sacar el máximo partido a la herramienta PSBD Management.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card key={i} title={section.title}>
            <div className="prose prose-slate max-w-none prose-sm">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string>('offensive');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data);
        if (data.length > 0) setActiveProfile(data[0].id);
      });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'oportunidades': return <OpportunitiesView profileId={activeProfile} />;
      case 'recruiting': return <RecruitingView profileId={activeProfile} />;
      case 'staffing': return <StaffingView profileId={activeProfile} />;
      case 'clientes': return <ClientsView profileId={activeProfile} />;
      case 'economica': return <EconomicView profileId={activeProfile} />;
      case 'horas': return <HoursView profileId={activeProfile} />;
      case 'docs': return <DocumentationView />;
      case 'update': return <UpdateView />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-indigo-600 text-white border-none">
            <p className="text-indigo-100 text-sm">Oportunidades Activas</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </Card>
          <Card>
            <p className="text-slate-500 text-sm">Staff Total</p>
            <p className="text-3xl font-bold mt-1 text-slate-800">45</p>
          </Card>
          <Card>
            <p className="text-slate-500 text-sm">Proyectos en Curso</p>
            <p className="text-3xl font-bold mt-1 text-slate-800">8</p>
          </Card>
          <Card>
            <p className="text-slate-500 text-sm">Margen Beneficio</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">24%</p>
          </Card>
          <div className="col-span-full">
            <EconomicView profileId={activeProfile} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-right border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <h1 className="font-bold text-xl tracking-tight">PSBD <span className="text-slate-400 font-normal">Mgmt</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Briefcase} label="Oportunidades" active={activeTab === 'oportunidades'} onClick={() => setActiveTab('oportunidades')} />
          <SidebarItem icon={UserCheck} label="Recruiting" active={activeTab === 'recruiting'} onClick={() => setActiveTab('recruiting')} />
          <SidebarItem icon={Users} label="Staffing" active={activeTab === 'staffing'} onClick={() => setActiveTab('staffing')} />
          <SidebarItem icon={Building2} label="Clientes/Proyectos" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
          <SidebarItem icon={TrendingUp} label="Gestión Económica" active={activeTab === 'economica'} onClick={() => setActiveTab('economica')} />
          <SidebarItem icon={Clock} label="Horas/TLs" active={activeTab === 'horas'} onClick={() => setActiveTab('horas')} />
          <SidebarItem icon={BookOpen} label="Documentación" active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
        </nav>

        <div className="p-4 border-top border-slate-100">
          <SidebarItem icon={RefreshCw} label="Actualizaciones" active={activeTab === 'update'} onClick={() => setActiveTab('update')} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-center px-8">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveProfile(p.id)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
                  activeProfile === p.id 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeProfile}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
