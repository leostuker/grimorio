import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { verifySecurityPin, setSessionPin } from '../services/api';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  actionTitle?: string;
  actionDescription?: string;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Ação Administrativa Protegida',
  actionDescription = 'Para criar, editar, apagar ou importar magias, digite a senha de segurança de 4 dígitos configurada no sistema (1998).',
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Por favor, digite a senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isValid = await verifySecurityPin(pin.trim());
      if (isValid) {
        if (rememberSession) {
          setSessionPin(pin.trim());
        }
        onSuccess(pin.trim());
        onClose();
        setPin('');
      } else {
        setError('Senha de segurança incorreta. Tente novamente.');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao verificar a senha.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultPin = () => {
    setPin('1998');
    setError(null);
  };

  return (
    <div
      id="security-pin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="security-pin-modal"
        className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 relative overflow-hidden"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-600" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{actionTitle}</h3>
              <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Trava de Segurança</span>
            </div>
          </div>
          <button
            id="btn-close-pin-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">{actionDescription}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Senha de Acesso (4 dígitos)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                id="input-security-pin"
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ex: 1998"
                autoFocus
                className="w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                id="btn-toggle-show-pin"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="pin-error-alert"
              className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                id="checkbox-remember-pin"
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-400 w-4 h-4"
              />
              <span>Lembrar nesta sessão</span>
            </label>

            <button
              type="button"
              id="btn-fill-preset-pin"
              onClick={fillDefaultPin}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              Inserir senha padrão (1998)
            </button>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              id="btn-cancel-pin"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-pin"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Validando...' : 'Confirmar e Prosseguir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
