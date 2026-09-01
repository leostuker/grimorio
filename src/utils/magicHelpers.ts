import { Escola, TipoDano, Atributo, Dado, Forma } from '../types';

export function formatCirculo(circulo: number): string {
  if (circulo === 0) return 'Truque';
  return `${circulo}º Círculo`;
}

export function getEscolaColor(escola: Escola): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (escola) {
    case 'Evocação':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        badge: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
      };
    case 'Abjuração':
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        badge: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
      };
    case 'Necromancia':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        badge: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      };
    case 'Encantamento':
      return {
        bg: 'bg-pink-500/10',
        text: 'text-pink-400',
        border: 'border-pink-500/30',
        badge: 'bg-pink-950/80 text-pink-300 border-pink-700/60',
      };
    case 'Ilusão':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
      };
    case 'Invocação':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      };
    case 'Transmutação':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      };
    case 'Adivinhação':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        badge: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
      };
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        badge: 'bg-slate-900 text-slate-300 border-slate-700',
      };
  }
}

export function getTipoDanoBadgeClass(tipo: TipoDano): string {
  switch (tipo) {
    case 'fogo':
      return 'bg-red-950/70 text-red-300 border-red-700/50';
    case 'frio':
      return 'bg-cyan-950/70 text-cyan-300 border-cyan-700/50';
    case 'elétrico':
      return 'bg-yellow-950/70 text-yellow-300 border-yellow-700/50';
    case 'ácido':
      return 'bg-lime-950/70 text-lime-300 border-lime-700/50';
    case 'veneno':
      return 'bg-green-950/70 text-green-300 border-green-700/50';
    case 'necrótico':
      return 'bg-zinc-950/90 text-zinc-300 border-zinc-700/60';
    case 'radiante':
      return 'bg-amber-950/70 text-amber-200 border-amber-600/50';
    case 'psíquico':
      return 'bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-700/50';
    case 'energético':
      return 'bg-violet-950/70 text-violet-300 border-violet-700/50';
    case 'trovejante':
      return 'bg-blue-950/70 text-blue-300 border-blue-700/50';
    case 'contundente':
    case 'cortante':
    case 'perfurante':
      return 'bg-stone-900 text-stone-300 border-stone-700';
    default:
      return 'bg-slate-900 text-slate-300 border-slate-700';
  }
}

export function formatDanoFormula(
  dado_dano: Dado | null,
  numero_dados: number | null,
  bonus: number | null
): string | null {
  if (!dado_dano || !numero_dados || numero_dados <= 0) return null;
  let formula = `${numero_dados}${dado_dano}`;
  if (bonus && bonus > 0) formula += ` + ${bonus}`;
  else if (bonus && bonus < 0) formula += ` - ${Math.abs(bonus)}`;
  return formula;
}

export function formatAtributoNome(attr: Atributo): string {
  switch (attr) {
    case 'FOR': return 'Força (FOR)';
    case 'DES': return 'Destreza (DES)';
    case 'CON': return 'Constituição (CON)';
    case 'INT': return 'Inteligência (INT)';
    case 'SAB': return 'Sabedoria (SAB)';
    case 'CAR': return 'Carisma (CAR)';
  }
}

/**
 * Remove sintaxe básica de markdown para renderizar resumos limpos em cards e tabelas
 */
export function stripMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/#{1,6}\s+/g, '') // remove headings (# Titulo)
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold (**texto**)
    .replace(/\*(.*?)\*/g, '$1') // remove italic (*texto*)
    .replace(/__(.*?)__/g, '$1') // remove underline bold
    .replace(/_(.*?)_/g, '$1') // remove underline italic
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // remove code (`código`)
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove links ([nome](url))
    .replace(/^\s*[-*+]\s+/gm, '') // remove bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // remove numbered lists
    .replace(/^\s*>\s+/gm, '') // remove blockquotes
    .replace(/\|/g, ' ') // replace table pipes
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}
