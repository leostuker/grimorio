import React, { useState } from 'react';
import {
  X,
  Users,
  BookOpen,
  Plus,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { MetadataBanco } from '../types';
import { createConjuradorAPI, createLivroAPI, getSessionPin, setSessionPin } from '../services/api';

interface ManageEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: MetadataBanco | null;
  onEntityCreated: () => void;
}

export const ManageEntitiesModal: React.FC<ManageEntitiesModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onEntityCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'conjuradores' | 'livros'>('conjuradores');
  const [newClasse, setNewClasse] = useState('');
  const [newLivro, setNewLivro] = useState('');
  const [pin, setPin] = useState(getSessionPin());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddConjurador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClasse.trim()) return;
    if (!pin.trim()) {
      setError('A senha de segurança é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createConjuradorAPI(newClasse.trim(), pin.trim());
      setSessionPin(pin.trim());
      setSuccess(`Classe "${newClasse.trim()}" cadastrada com sucesso!`);
      setNewClasse('');
      onEntityCreated();
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar classe.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLivro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLivro.trim()) return;
    if (!pin.trim()) {
      setError('A senha de segurança é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createLivroAPI(newLivro.trim(), pin.trim());
      setSessionPin(pin.trim());
      setSuccess(`Livro "${newLivro.trim()}" cadastrado com sucesso!`);
      setNewLivro('');
      onEntityCreated();
    } catch (err: any) {
      setError(err?.message || 'Erro ao cadastrar livro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="manage-entities-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="manage-entities-modal"
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Gerenciar Conjuradores e Livros</h2>
              <p className="text-xs text-slate-400">
                Adicione novas classes ou fontes bibliográficas dinamicamente ao PostgreSQL
              </p>
            </div>
          </div>

          <button
            id="btn-close-entities-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          <button
            type="button"
            id="tab-manage-casters"
            onClick={() => {
              setActiveTab('conjuradores');
              setError(null);
              setSuccess(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'conjuradores'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Classes de Conjuradores ({metadata?.conjuradores.length || 0})
          </button>

          <button
            type="button"
            id="tab-manage-books"
            onClick={() => {
              setActiveTab('livros');
              setError(null);
              setSuccess(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'livros'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Livros e Suplementos ({metadata?.livros.length || 0})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'conjuradores' ? (
            <div className="space-y-4">
              {/* Form Adicionar Conjurador */}
              <form onSubmit={handleAddConjurador} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Nova Classe de Conjurador:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newClasse}
                    onChange={(e) => setNewClasse(e.target.value)}
                    placeholder="Ex: Alquimista, Xamã, Lâmina Maldita"
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Adicionar
                  </button>
                </div>
              </form>

              {/* Lista Existente */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Classes Cadastradas no Banco:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {(metadata?.conjuradores || []).map((c) => (
                    <div
                      key={c.id_conjurador}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{c.classe}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{c.id_conjurador}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Form Adicionar Livro */}
              <form onSubmit={handleAddLivro} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Nome do Livro ou Suplemento:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newLivro}
                    onChange={(e) => setNewLivro(e.target.value)}
                    placeholder="Ex: Tesouro dos Dragões de Fizban"
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Adicionar
                  </button>
                </div>
              </form>

              {/* Lista Existente */}
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Livros Cadastrados no Banco:
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {(metadata?.livros || []).map((l) => (
                    <div
                      key={l.id_livro}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{l.nome_livro}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: #{l.id_livro}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PIN Input */}
          <div className="p-4 rounded bg-amber-950/20 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Senha de Segurança</span>
            </div>
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono tracking-widest text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            id="btn-close-manage-entities"
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
