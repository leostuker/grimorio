import React from 'react';
import {
  Clock,
  Compass,
  Hourglass,
  Sparkles,
  Shield,
  Flame,
  Swords,
  Layers,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Crosshair,
} from 'lucide-react';
import { MagiaCompleta } from '../types';
import {
  formatCirculo,
  getEscolaColor,
  getTipoDanoBadgeClass,
  formatDanoFormula,
  stripMarkdown,
} from '../utils/magicHelpers';
import { ClassPictogram } from './ClassPictogram';

interface SpellCardProps {
  magia: MagiaCompleta;
  onView: (magia: MagiaCompleta) => void;
  onEdit: (magia: MagiaCompleta) => void;
  onDelete: (magia: MagiaCompleta) => void;
}

export const SpellCard: React.FC<SpellCardProps> = ({
  magia,
  onView,
  onEdit,
  onDelete,
}) => {
  const escolaColor = getEscolaColor(magia.escola);
  const danoFormula = formatDanoFormula(
    magia.dado_dano,
    magia.numero_dados_dano,
    magia.bonus_dano
  );

  return (
    <div
      id={`spell-card-${magia.id_magia}`}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {formatCirculo(magia.circulo)}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${escolaColor.badge}`}
              >
                {magia.escola}
              </span>
            </div>

            <h3
              onClick={() => onView(magia)}
              className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors cursor-pointer truncate"
              title={magia.nome_magia}
            >
              {magia.nome_magia}
            </h3>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              id={`btn-view-spell-${magia.id_magia}`}
              onClick={() => onView(magia)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Ver detalhes da magia"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              id={`btn-edit-spell-${magia.id_magia}`}
              onClick={() => onEdit(magia)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
              title="Editar magia (Exige PIN 1998)"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              id={`btn-delete-spell-${magia.id_magia}`}
              onClick={() => onDelete(magia)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Apagar magia (Exige PIN 1998)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-3.5 py-3 px-3.5 bg-slate-950/70 rounded-xl border border-slate-800/70 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate font-medium" title={magia.tempo}>
              {magia.tempo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Compass className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate font-medium" title={magia.alcance}>
              {magia.alcance}
              {magia.forma ? ` (${magia.forma})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Hourglass className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="truncate font-medium" title={magia.duracao}>
              {magia.duracao}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="font-mono tracking-wider font-semibold">
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

        {/* Badges de Regras (Concentração, Salvaguarda, Ataque, Dano) */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {magia.concentracao && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-xs">
              Concentração
            </span>
          )}

          {magia.salvaguarda && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-xs flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Salv: {magia.atributo_salvaguarda || 'Sim'}
            </span>
          )}

          {magia.ataque && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-xs flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5" />
              Ataque
            </span>
          )}

          {danoFormula && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-950/90 text-violet-300 border border-violet-700/70 font-mono shadow-xs">
              {danoFormula}
            </span>
          )}

          {magia.tipos_dano &&
            magia.tipos_dano.map((td) => (
              <span
                key={td}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border shadow-xs ${getTipoDanoBadgeClass(
                  td
                )}`}
              >
                {td}
              </span>
            ))}
        </div>

        {/* Descrição Curta (Sanitizada de Markdown para preview) */}
        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-3.5">
          {stripMarkdown(magia.descricao)}
        </p>
      </div>

      {/* Footer: Conjuradores & Livro */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        {/* Classes de Conjuradores */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {magia.conjuradores && magia.conjuradores.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 items-center">
              {magia.conjuradores.slice(0, 3).map((c) => (
                <span
                  key={c.id_conjurador}
                  className="text-xs pl-1.5 pr-2 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5"
                >
                  <ClassPictogram classe={c.classe} size="xs" />
                  <span>{c.classe}</span>
                </span>
              ))}
              {magia.conjuradores.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-400 font-medium">
                  +{magia.conjuradores.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">Sem conjurador</span>
          )}
        </div>

        {/* Livro */}
        <span
          className="text-xs text-slate-400 truncate max-w-[140px] flex items-center gap-1.5 shrink-0"
          title={magia.nome_livro || 'Livro Padrão'}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {magia.nome_livro || 'Livro Padrão'}
        </span>
      </div>
    </div>
  );
};
