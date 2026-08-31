// Tipos Estritos do Banco de Dados PostgreSQL 16 (conforme dump SQL)

export const ATRIBUTOS = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'] as const;
export type Atributo = typeof ATRIBUTOS[number];

export const DADOS = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type Dado = typeof DADOS[number];

export const ESCOLAS = [
  'Abjuração',
  'Adivinhação',
  'Encantamento',
  'Evocação',
  'Ilusão',
  'Invocação',
  'Necromancia',
  'Transmutação',
] as const;
export type Escola = typeof ESCOLAS[number];

export const FORMAS = [
  'linha',
  'cone',
  'cubo',
  'cilindro',
  'emanação/esfera',
] as const;
export type Forma = typeof FORMAS[number];

export const TIPOS_DANO = [
  'ácido',
  'contundente',
  'cortante',
  'elétrico',
  'energético',
  'fogo',
  'frio',
  'necrótico',
  'perfurante',
  'psíquico',
  'radiante',
  'trovejante',
  'veneno',
] as const;
export type TipoDano = typeof TIPOS_DANO[number];

// Tabela: conjuradores
export interface Conjurador {
  id_conjurador: number;
  classe: string;
}

// Tabela: livros
export interface Livro {
  id_livro: number;
  nome_livro: string;
}

// Tabela: magias (registro cru no banco)
export interface MagiaDB {
  id_magia: number;
  nome_magia: string;
  circulo: number;
  escola: Escola;
  tempo: string;
  alcance: string;
  forma: Forma | null;
  tamanho: number | null;
  componente_verbal: boolean;
  componente_somatico: boolean;
  componente_material: boolean;
  consumo_material: boolean | null;
  valor_material: number | null;
  descricao_material: string | null;
  duracao: string;
  concentracao: boolean;
  salvaguarda: boolean;
  atributo_salvaguarda: Atributo | null;
  ataque: boolean;
  id_livro: number;
  descricao: string;
  dado_dano: Dado | null;
  numero_dados_dano: number | null;
  bonus_dano: number | null;
}

// Tabela de junção: magias_conjuradores
export interface MagiaConjurador {
  id_magia: number;
  id_conjurador: number;
}

// Tabela de junção: magias_tipo_dano
export interface MagiaTipoDano {
  id_magia: number;
  tipo_dano: TipoDano;
}

// Magia completa com relacionamentos hidratados
export interface MagiaCompleta extends MagiaDB {
  nome_livro?: string;
  conjuradores: Conjurador[];
  conjuradores_ids: number[];
  tipos_dano: TipoDano[];
}

// Payload para criação / edição de magia
export interface MagiaPayload {
  nome_magia: string;
  circulo: number;
  escola: Escola;
  tempo: string;
  alcance: string;
  forma?: Forma | null;
  tamanho?: number | null;
  componente_verbal: boolean;
  componente_somatico: boolean;
  componente_material: boolean;
  consumo_material?: boolean | null;
  valor_material?: number | null;
  descricao_material?: string | null;
  duracao: string;
  concentracao: boolean;
  salvaguarda: boolean;
  atributo_salvaguarda?: Atributo | null;
  ataque: boolean;
  id_livro: number;
  descricao: string;
  dado_dano?: Dado | null;
  numero_dados_dano?: number | null;
  bonus_dano?: number | null;
  conjuradores_ids: number[];
  tipos_dano: TipoDano[];
  pin?: string;
}

// Filtros de busca
export interface FiltrosMagia {
  busca?: string;
  circulos?: number[];
  escolas?: Escola[];
  conjuradores_ids?: number[];
  tipos_dano?: TipoDano[];
  livros_ids?: number[];
  concentracao?: boolean | 'todos';
  salvaguarda?: boolean | 'todos';
  atributo_salvaguarda?: Atributo | 'todos';
  ataque?: boolean | 'todos';
  componente_verbal?: boolean | 'todos';
  componente_somatico?: boolean | 'todos';
  componente_material?: boolean | 'todos';
  consumo_material?: boolean | 'todos';
  forma?: Forma | 'todos';
  tem_dano?: boolean | 'todos';
  sort_by?: 'nome_magia' | 'circulo' | 'escola' | 'id_magia';
  sort_order?: 'asc' | 'desc';
}

// Metadata dinâmica do banco
export interface MetadataBanco {
  conjuradores: Conjurador[];
  livros: Livro[];
  escolas: readonly Escola[];
  tipos_dano: readonly TipoDano[];
  atributos: readonly Atributo[];
  dados: readonly Dado[];
  formas: readonly Forma[];
  totalMagias: number;
  statusConexao: {
    modo: 'postgres' | 'fallback_memoria';
    mensagem: string;
    host: string;
    porta: number;
    banco: string;
    usuario: string;
  };
}

// Resposta de importação CSV
export interface ResultadoImportacaoCSV {
  sucesso: boolean;
  importadas: number;
  totalLinhas: number;
  erros: Array<{ linha: number; magia?: string; mensagem: string }>;
  novosLivrosCriados: string[];
  novosConjuradoresCriados: string[];
}
