import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  ShieldAlert,
} from 'lucide-react';
import { StatusConexao } from '../types';

interface DbConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: StatusConexao | null;
  onRefreshStatus: () => Promise<void>;
}

export const DbConnectionModal: React.FC<DbConnectionModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  if (!isOpen) return null;

  const isPostgres = status?.modo === 'postgres';

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshStatus();
    } finally {
      setRefreshing(false);
    }
  };

  // Sanitizar mensagem para não expor IPs brutos
  const sanitizeMessage = (msg?: string) => {
    if (!msg) return '';
    return msg.replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, '[servidor]');
  };

  const errorMessage = sanitizeMessage(status?.ultimoErro || status?.detalhesErro || status?.mensagem);

  return (
    <div
      id="modal-db-status-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="modal-db-status"
        className="bg-slate-900 border border-slate-800 rounded-md w-full max-w-lg shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded ${
                isPostgres
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isPostgres ? <Database className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {isPostgres ? 'Banco de Dados Conectado' : 'Aviso de Conexão'}
              </h2>
              <p className="text-xs text-slate-400">
                {isPostgres ? 'Túnel / PostgreSQL operacional' : 'Operando em modo fallback'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-db-status-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-sm">
          {isPostgres ? (
            <div className="p-4 rounded bg-emerald-950/30 border border-emerald-800/50 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-300">
                  Conexão ativa com sucesso
                </p>
                <p className="text-xs text-slate-300">
                  O aplicativo está sincronizado com o banco de dados PostgreSQL. Todas as operações de leitura, criação e edição persistem normalmente.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded bg-amber-950/25 border border-amber-800/40 text-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-300">
                    Modo Fallback em Memória
                  </p>
                  <p className="text-xs text-slate-300">
                    Não foi possível conectar ao banco de dados externo. O sistema está funcionando normalmente em memória para consulta e testes.
                  </p>
                </div>
              </div>

              {/* Erro */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Erro reportado:
                </span>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-rose-300 whitespace-pre-wrap break-words">
                  {errorMessage || 'Falha ao conectar com o banco de dados.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            id="btn-retry-db-status"
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Verificando...' : 'Tentar Novamente'}</span>
          </button>

          <button
            id="btn-close-db-status-footer"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
