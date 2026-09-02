import React from 'react';
import {
  X,
  Sparkles,
  Shield,
  Clock,
  Compass,
  Hourglass,
  Layers,
  Flame,
  Swords,
  BookOpen,
  Users,
  Edit,
  Trash2,
  Copy,
  Coins,
  AlertCircle,
  Crosshair,
  Check,
  Printer,
} from 'lucide-react';
import { MagiaCompleta } from '../types';
import {
  formatCirculo,
  getEscolaColor,
  getTipoDanoBadgeClass,
  formatDanoFormula,
  formatAtributoNome,
} from '../utils/magicHelpers';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SpellDetailModalProps {
  magia: MagiaCompleta | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (magia: MagiaCompleta) => void;
  onDelete: (magia: MagiaCompleta) => void;
  onDuplicate: (magia: MagiaCompleta) => void;
  isSelected?: boolean;
  onToggleSelect?: (magia: MagiaCompleta) => void;
  onOpenStudio?: () => void;
}

export const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  magia,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  isSelected = false,
  onToggleSelect,
  onOpenStudio,
}) => {
  if (!isOpen || !magia) return null;

  const escolaColor = getEscolaColor(magia.escola);
  const danoFormula = formatDanoFormula(
    magia.dado_dano,
    magia.numero_dados_dano,
    magia.bonus_dano
  );

  return (
    <div
      id="spell-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="spell-detail-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-md shadow-2xl overflow-hidden my-8 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header Ribbon */}
        <div className={`p-6 border-b border-slate-800 ${escolaColor.bg}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-black/25 text-white border border-white/20">
                  {formatCirculo(magia.circulo)}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-black/20 text-white/90 border border-white/20">
                  {magia.escola}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                {magia.nome_magia}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {onToggleSelect && (
                <button
                  id="btn-detail-toggle-select"
                  type="button"
                  onClick={() => onToggleSelect(magia)}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                  title={isSelected ? 'Carta selecionada no Deck' : 'Adicionar ao Deck de Cartas'}
                >
                  <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[3]' : 'opacity-60'}`} />
                  <span>{isSelected ? 'Selecionada' : 'Selecionar Carta'}</span>
                </button>
              )}

              <button
                id="btn-close-detail-modal"
                onClick={onClose}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Tempo
              </span>
              <span className="text-sm font-bold text-slate-200">{magia.tempo}</span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-400" /> Alcance
              </span>
              <span className="text-sm font-bold text-slate-200">{magia.alcance}</span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Hourglass className="w-3.5 h-3.5 text-violet-400" /> Duração
              </span>
              <span className="text-sm font-bold text-slate-200">{magia.duracao}</span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-pink-400" /> Componentes
              </span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {[
                  magia.componente_verbal ? 'V' : null,
                  magia.componente_somatico ? 'S' : null,
                  magia.componente_material ? 'M' : null,
                ]
                  .filter(Boolean)
                  .join(', ') || 'Nenhum'}
              </span>
            </div>
          </div>

          {/* Material & Area Details */}
          {(magia.componente_material || magia.forma || magia.tamanho) && (
            <div className="p-4 rounded bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
              {magia.componente_material && (
                <div className="flex items-start gap-2 text-slate-300">
                  <Coins className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">Material:</span>{' '}
                    {magia.descricao_material || 'Componente material genérico (bolsa de componentes/foco)'}
                    {magia.valor_material && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-semibold">
                        Custo: {magia.valor_material} PO
                      </span>
                    )}
                    {magia.consumo_material && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 font-semibold">
                        Consumido no lançamento
                      </span>
                    )}
                  </div>
                </div>
              )}

              {(magia.forma || magia.tamanho) && (
                <div className="flex items-center gap-2 text-slate-300 pt-1">
                  <Compass className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    <span className="font-semibold text-slate-200">Área de Efeito:</span>{' '}
                    {magia.forma || 'Área'} {magia.tamanho ? `(${magia.tamanho} metros)` : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Círculo, Escola, Concentração, Combate, Salvaguarda e Dano */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Círculo e Escola no início da linha de especificações */}
            <span className="text-xs font-bold px-3 py-1.5 rounded bg-indigo-600 text-white shadow-xs whitespace-nowrap">
              {formatCirculo(magia.circulo)}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded border whitespace-nowrap ${escolaColor.badge}`}>
              {magia.escola}
            </span>

            {magia.concentracao && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-600/50 whitespace-nowrap">
                Concentração
              </span>
            )}

            {magia.salvaguarda && (
              <div className="px-3 py-1.5 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong>Salvaguarda:</strong>{' '}
                  {magia.atributo_salvaguarda ? formatAtributoNome(magia.atributo_salvaguarda) : 'Exigida'}
                </span>
              </div>
            )}

            {magia.ataque && (
              <div className="px-3 py-1.5 rounded bg-rose-950/70 border border-rose-700/50 text-rose-300 text-xs flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-rose-400" />
                <span>
                  <strong>Ataque Mágico:</strong> Requer jogada de ataque
                </span>
              </div>
            )}

            {danoFormula && (
              <div className="px-3 py-1.5 rounded bg-violet-950/80 border border-violet-700/60 text-violet-300 text-xs flex items-center gap-2 font-mono">
                <Flame className="w-4 h-4 text-violet-400" />
                <span>
                  <strong>Dano:</strong> {danoFormula}
                </span>
              </div>
            )}

            {magia.tipos_dano && magia.tipos_dano.length > 0 && (
              <div className="flex items-center gap-1">
                {magia.tipos_dano.map((td) => (
                  <span
                    key={td}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border ${getTipoDanoBadgeClass(td)}`}
                  >
                    {td}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Spell Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Descrição da Magia
            </h4>
            <div className="p-4 rounded bg-slate-950 border border-slate-800 shadow-inner">
              <MarkdownRenderer content={magia.descricao} />
            </div>
          </div>

          {/* Classes de Conjuradores (N:M) */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Classes que Conjuram
            </h4>
            <div className="flex flex-wrap gap-2">
              {magia.conjuradores && magia.conjuradores.length > 0 ? (
                magia.conjuradores.map((c) => (
                  <span
                    key={c.id_conjurador}
                    className="px-3 py-1 rounded bg-slate-950 border border-emerald-700/50 text-emerald-300 text-xs font-semibold"
                  >
                    {c.classe}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Nenhuma classe associada.</span>
              )}
            </div>
          </div>

          {/* Livro de Origem */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" /> Fonte / Livro:{' '}
              <strong className="text-slate-200">{magia.nome_livro || 'Livro Padrão'}</strong>
            </span>
            <span>ID da Magia: #{magia.id_magia}</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onOpenStudio && (
              <button
                id="btn-detail-open-studio"
                onClick={() => {
                  if (!isSelected && onToggleSelect) {
                    onToggleSelect(magia);
                  }
                  onOpenStudio();
                }}
                className="px-3 py-2 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Abrir no Estúdio de Cartas & Impressão"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Estúdio de Cartas</span>
              </button>
            )}

            <button
              id="btn-detail-duplicate"
              onClick={() => onDuplicate(magia)}
              className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Duplicar informações para nova magia"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicar
            </button>
            <button
              id="btn-detail-delete"
              onClick={() => onDelete(magia)}
              className="px-3 py-2 rounded bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Apagar magia (Exige Senha de Segurança)"
            >
              <Trash2 className="w-3.5 h-3.5" /> Apagar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-detail-edit"
              onClick={() => onEdit(magia)}
              className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Edit className="w-3.5 h-3.5 stroke-[2.5]" /> Editar Magia
            </button>
            <button
              id="btn-detail-close"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
