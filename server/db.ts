import pg from 'pg';
import dotenv from 'dotenv';
import {
  MagiaCompleta,
  MagiaPayload,
  Conjurador,
  Livro,
  FiltrosMagia,
  Escola,
  TipoDano,
  Atributo,
  Dado,
  Forma,
  ESCOLAS,
  TIPOS_DANO,
  ATRIBUTOS,
  DADOS,
  FORMAS,
} from '../src/types.js';

dotenv.config();

const { Pool } = pg;

const DB_CONFIG = {
  host: process.env.DB_HOST || '192.168.0.153',
  port: parseInt(process.env.DB_PORT || '6532', 10),
  user: process.env.DB_USER || 'leo',
  password: process.env.DB_PASSWORD || '1998',
  database: process.env.DB_NAME || 'dndmagias',
  connectionTimeoutMillis: 4000,
  query_timeout: 5000,
};

let activeDbConfig = { ...DB_CONFIG };
let pool: pg.Pool | null = null;
let isConnectedToPostgres = false;
let connectionErrorMsg = '';
let connectionErrorCode = '';
let connectionErrorDetail = '';
let lastAttemptTime: string = new Date().toISOString();

// Banco em memória para fallback/sandbox quando o IP 192.168.0.153 não estiver acessível
interface MemoryDB {
  conjuradores: Conjurador[];
  livros: Livro[];
  magias: Map<number, MagiaCompleta>;
  lastIdMagia: number;
  lastIdConjurador: number;
  lastIdLivro: number;
}

const memoryDB: MemoryDB = {
  conjuradores: [
    { id_conjurador: 1, classe: 'Mago' },
    { id_conjurador: 2, classe: 'Bruxo' },
    { id_conjurador: 3, classe: 'Feiticeiro' },
    { id_conjurador: 4, classe: 'Clérigo' },
    { id_conjurador: 5, classe: 'Druida' },
    { id_conjurador: 6, classe: 'Bardo' },
    { id_conjurador: 7, classe: 'Paladino' },
    { id_conjurador: 8, classe: 'Patrulheiro' },
    { id_conjurador: 9, classe: 'Artífice' },
  ],
  livros: [
    { id_livro: 1, nome_livro: 'Livro do Jogador (PHB)' },
    { id_livro: 2, nome_livro: 'Caldeirão de Tasha' },
    { id_livro: 3, nome_livro: 'Guia de Xanathar' },
  ],
  magias: new Map<number, MagiaCompleta>(),
  lastIdMagia: 0,
  lastIdConjurador: 9,
  lastIdLivro: 3,
};

// Carregar magias iniciais no banco de memória
function initSeedMemoryDB() {
  const seedSpells: Array<Omit<MagiaCompleta, 'id_magia'>> = [
    {
      nome_magia: 'Bola de Fogo',
      circulo: 3,
      escola: 'Evocação',
      tempo: '1 ação',
      alcance: '45 metros',
      forma: 'emanação/esfera',
      tamanho: 6,
      componente_verbal: true,
      componente_somatico: true,
      componente_material: true,
      consumo_material: false,
      valor_material: null,
      descricao_material: 'Uma pequena bola de guano de morcego e enxofre',
      duracao: 'Instantânea',
      concentracao: false,
      salvaguarda: true,
      atributo_salvaguarda: 'DES',
      ataque: false,
      id_livro: 1,
      nome_livro: 'Livro do Jogador (PHB)',
      descricao: 'Uma explosão brilhante de fogo irrompe com um estrondo no ponto que você escolher dentro do alcance. Cada criatura em uma esfera de 6 metros de raio deve fazer um teste de resistência de Destreza.',
      dado_dano: 'd6',
      numero_dados_dano: 8,
      bonus_dano: 0,
      conjuradores: [
        { id_conjurador: 1, classe: 'Mago' },
        { id_conjurador: 3, classe: 'Feiticeiro' },
      ],
      conjuradores_ids: [1, 3],
      tipos_dano: ['fogo'],
    },
    {
      nome_magia: 'Curar Ferimentos',
      circulo: 1,
      escola: 'Evocação',
      tempo: '1 ação',
      alcance: 'Toque',
      forma: null,
      tamanho: null,
      componente_verbal: true,
      componente_somatico: true,
      componente_material: false,
      consumo_material: null,
      valor_material: null,
      descricao_material: null,
      duracao: 'Instantânea',
      concentracao: false,
      salvaguarda: false,
      atributo_salvaguarda: null,
      ataque: false,
      id_livro: 1,
      nome_livro: 'Livro do Jogador (PHB)',
      descricao: 'Uma criatura que você tocar recupera um número de pontos de vida igual a 1d8 + seu modificador de habilidade de conjuração.',
      dado_dano: 'd8',
      numero_dados_dano: 1,
      bonus_dano: 0,
      conjuradores: [
        { id_conjurador: 4, classe: 'Clérigo' },
        { id_conjurador: 5, classe: 'Druida' },
        { id_conjurador: 6, classe: 'Bardo' },
        { id_conjurador: 7, classe: 'Paladino' },
        { id_conjurador: 8, classe: 'Patrulheiro' },
        { id_conjurador: 9, classe: 'Artífice' },
      ],
      conjuradores_ids: [4, 5, 6, 7, 8, 9],
      tipos_dano: [],
    },
    {
      nome_magia: 'Escudo Arcano',
      circulo: 1,
      escola: 'Abjuração',
      tempo: '1 reação',
      alcance: 'Pessoal',
      forma: null,
      tamanho: null,
      componente_verbal: true,
      componente_somatico: true,
      componente_material: false,
      consumo_material: null,
      valor_material: null,
      descricao_material: null,
      duracao: '1 rodada',
      concentracao: false,
      salvaguarda: false,
      atributo_salvaguarda: null,
      ataque: false,
      id_livro: 1,
      nome_livro: 'Livro do Jogador (PHB)',
      descricao: 'Uma barreira invisível de força mágica surge e protege você. Até o início do seu próximo turno, você tem +5 de bônus na CA e não sofre dano de Mísseis Mágicos.',
      dado_dano: null,
      numero_dados_dano: null,
      bonus_dano: null,
      conjuradores: [
        { id_conjurador: 1, classe: 'Mago' },
        { id_conjurador: 3, classe: 'Feiticeiro' },
      ],
      conjuradores_ids: [1, 3],
      tipos_dano: ['energético'],
    },
    {
      nome_magia: 'Mísseis Mágicos',
      circulo: 1,
      escola: 'Evocação',
      tempo: '1 ação',
      alcance: '36 metros',
      forma: null,
      tamanho: null,
      componente_verbal: true,
      componente_somatico: true,
      componente_material: false,
      consumo_material: null,
      valor_material: null,
      descricao_material: null,
      duracao: 'Instantânea',
      concentracao: false,
      salvaguarda: false,
      atributo_salvaguarda: null,
      ataque: false,
      id_livro: 1,
      nome_livro: 'Livro do Jogador (PHB)',
      descricao: 'Você cria três dardos brilhantes de força mágica. Cada dardo atinge uma criatura à sua escolha que você possa ver dentro do alcance, causando 1d4 + 1 de dano de energia.',
      dado_dano: 'd4',
      numero_dados_dano: 3,
      bonus_dano: 3,
      conjuradores: [
        { id_conjurador: 1, classe: 'Mago' },
        { id_conjurador: 3, classe: 'Feiticeiro' },
      ],
      conjuradores_ids: [1, 3],
      tipos_dano: ['energético'],
    },
    {
      nome_magia: 'Raio de Gelo',
      circulo: 0,
      escola: 'Evocação',
      tempo: '1 ação',
      alcance: '18 metros',
      forma: 'linha',
      tamanho: 18,
      componente_verbal: true,
      componente_somatico: true,
      componente_material: false,
      consumo_material: null,
      valor_material: null,
      descricao_material: null,
      duracao: 'Instantânea',
      concentracao: false,
      salvaguarda: false,
      atributo_salvaguarda: null,
      ataque: true,
      id_livro: 1,
      nome_livro: 'Livro do Jogador (PHB)',
      descricao: 'Um feixe de luz azul-esbranquiçada e gélida viaja em direção a uma criatura dentro do alcance. Realize um ataque à distância com magia contra o alvo. Se atingir, o alvo sofre 1d8 de dano de frio e sua velocidade é reduzida em 3 metros até o início do seu próximo turno.',
      dado_dano: 'd8',
      numero_dados_dano: 1,
      bonus_dano: 0,
      conjuradores: [
        { id_conjurador: 1, classe: 'Mago' },
        { id_conjurador: 3, classe: 'Feiticeiro' },
        { id_conjurador: 9, classe: 'Artífice' },
      ],
      conjuradores_ids: [1, 3, 9],
      tipos_dano: ['frio'],
    },
    {
      nome_magia: 'Invisibilidade',
      circulo: 2,
      escola: 'Ilusão',
      tempo: '1 ação',
      alcance: 'Toque',
      forma: null,
      tamanho: null,
      componente_verbal: true,
      componente_somatico: true,
      componente_material: true,
      consumo_material: false,
      valor_material: null,
      descricao_material: 'Um cílio envolto em goma-arábica',
      duracao: 'Até 1 hora',
      concentracao: true,
      salvaguarda: false,
      atributo_salvaguarda: null,
      ataque: false,
      id_livro: 1,
      nome_livro: 'Livro do Jogador (PHB)',
      descricao: 'Uma criatura que você tocar se torna invisível até a magia acabar. Qualquer coisa que o alvo estiver vestindo ou carregando fica invisível enquanto estiver com ele. A magia termina se o alvo atacar ou conjurar uma magia.',
      dado_dano: null,
      numero_dados_dano: null,
      bonus_dano: null,
      conjuradores: [
        { id_conjurador: 1, classe: 'Mago' },
        { id_conjurador: 2, classe: 'Bruxo' },
        { id_conjurador: 3, classe: 'Feiticeiro' },
        { id_conjurador: 6, classe: 'Bardo' },
        { id_conjurador: 9, classe: 'Artífice' },
      ],
      conjuradores_ids: [1, 2, 3, 6, 9],
      tipos_dano: [],
    },
  ];

  for (const s of seedSpells) {
    memoryDB.lastIdMagia++;
    const full: MagiaCompleta = {
      ...s,
      id_magia: memoryDB.lastIdMagia,
    };
    memoryDB.magias.set(full.id_magia, full);
  }
}

initSeedMemoryDB();

// Inicialização do Schema no PostgreSQL Real
const INIT_SCHEMA_SQL = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'atributos') THEN
    CREATE TYPE "atributos" AS ENUM ('FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dados') THEN
    CREATE TYPE "dados" AS ENUM ('d4', 'd6', 'd8', 'd10', 'd12');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'escolas') THEN
    CREATE TYPE "escolas" AS ENUM ('Abjuração', 'Adivinhação', 'Encantamento', 'Evocação', 'Ilusão', 'Invocação', 'Necromancia', 'Transmutação');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formas') THEN
    CREATE TYPE "formas" AS ENUM ('linha', 'cone', 'cubo', 'cilindro', 'emanação/esfera');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_dano') THEN
    CREATE TYPE "tipo_dano" AS ENUM ('ácido', 'contundente', 'cortante', 'elétrico', 'energético', 'fogo', 'frio', 'necrótico', 'perfurante', 'psíquico', 'radiante', 'trovejante', 'veneno');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."conjuradores" (
    "id_conjurador" serial NOT NULL,
    "classe" character varying(100) NOT NULL,
    CONSTRAINT "conjuradores_pkey" PRIMARY KEY ("id_conjurador")
);

CREATE TABLE IF NOT EXISTS "public"."livros" (
    "id_livro" serial NOT NULL,
    "nome_livro" text NOT NULL,
    CONSTRAINT "livros_pkey" PRIMARY KEY ("id_livro")
);

CREATE TABLE IF NOT EXISTS "public"."magias" (
    "id_magia" serial NOT NULL,
    "nome_magia" character varying(100) NOT NULL,
    "circulo" integer NOT NULL,
    "escola" escolas NOT NULL,
    "tempo" character varying(100) NOT NULL,
    "alcance" character varying(100) NOT NULL,
    "forma" formas,
    "tamanho" double precision,
    "componente_verbal" boolean NOT NULL,
    "componente_somatico" boolean NOT NULL,
    "componente_material" boolean NOT NULL,
    "consumo_material" boolean,
    "valor_material" double precision,
    "descricao_material" character varying(100),
    "duracao" character varying(100) NOT NULL,
    "concentracao" boolean NOT NULL,
    "salvaguarda" boolean NOT NULL,
    "atributo_salvaguarda" atributos,
    "ataque" boolean NOT NULL,
    "id_livro" integer NOT NULL,
    "descricao" text NOT NULL,
    "dado_dano" dados,
    "numero_dados_dano" integer,
    "bonus_dano" integer,
    CONSTRAINT "magias_pkey" PRIMARY KEY ("id_magia"),
    CONSTRAINT "magias_id_livro_fkey" FOREIGN KEY ("id_livro") REFERENCES "public"."livros"("id_livro") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "public"."magias_conjuradores" (
    "id_magia" integer NOT NULL,
    "id_conjurador" integer NOT NULL,
    CONSTRAINT "magias_conjuradores_pkey" PRIMARY KEY ("id_magia", "id_conjurador"),
    CONSTRAINT "magias_conjuradores_id_magia_fkey" FOREIGN KEY ("id_magia") REFERENCES "public"."magias"("id_magia") ON DELETE CASCADE,
    CONSTRAINT "magias_conjuradores_id_conjurador_fkey" FOREIGN KEY ("id_conjurador") REFERENCES "public"."conjuradores"("id_conjurador") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "public"."magias_tipo_dano" (
    "id_magia" integer NOT NULL,
    "tipo_dano" tipo_dano NOT NULL,
    CONSTRAINT "magias_tipo_dano_pkey" PRIMARY KEY ("id_magia", "tipo_dano"),
    CONSTRAINT "magias_tipo_dano_id_magia_fkey" FOREIGN KEY ("id_magia") REFERENCES "public"."magias"("id_magia") ON DELETE CASCADE
);
`;

export async function initDatabaseConnection(): Promise<void> {
  lastAttemptTime = new Date().toISOString();
  console.log(`[DB] Tentando conectar ao PostgreSQL em ${activeDbConfig.host}:${activeDbConfig.port} como '${activeDbConfig.user}' (Banco: '${activeDbConfig.database}')...`);

  try {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // ignore
      }
    }

    pool = new Pool(activeDbConfig);

    // Testar conexão inicial com timeout
    const client = await pool.connect();
    console.log('[DB] Conexão com PostgreSQL 16 estabelecida com sucesso!');
    isConnectedToPostgres = true;
    connectionErrorMsg = '';
    connectionErrorCode = '';
    connectionErrorDetail = '';

    // Garantir que as tabelas e tipos existam
    await client.query(INIT_SCHEMA_SQL);

    // Se estiver vazio, inserir livros e conjuradores base
    const conjRes = await client.query('SELECT COUNT(*) FROM "public"."conjuradores"');
    if (parseInt(conjRes.rows[0].count, 10) === 0) {
      console.log('[DB] Inserindo conjuradores padrão no PostgreSQL...');
      for (const c of memoryDB.conjuradores) {
        await client.query('INSERT INTO "public"."conjuradores" (classe) VALUES ($1)', [c.classe]);
      }
    }

    const livRes = await client.query('SELECT COUNT(*) FROM "public"."livros"');
    if (parseInt(livRes.rows[0].count, 10) === 0) {
      console.log('[DB] Inserindo livros padrão no PostgreSQL...');
      for (const l of memoryDB.livros) {
        await client.query('INSERT INTO "public"."livros" (nome_livro) VALUES ($1)', [l.nome_livro]);
      }
    }

    client.release();
  } catch (err: any) {
    isConnectedToPostgres = false;
    connectionErrorMsg = err?.message || 'Falha ao conectar ao PostgreSQL';
    connectionErrorCode = err?.code || 'CONNECTION_FAILED';
    connectionErrorDetail = err?.detail || err?.hint || '';
    console.warn(`[DB] PostgreSQL em ${activeDbConfig.host}:${activeDbConfig.port} inacessível (${connectionErrorMsg}). Código: ${connectionErrorCode}. Ativando modo local em memória para demonstração.`);
  }
}

// Testar conexão temporária sem alterar o pool principal
export async function testDatabaseConnection(configOverride: {
  host?: string;
  port?: number | string;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}): Promise<{
  sucesso: boolean;
  mensagem: string;
  codigo?: string;
  detalhe?: string;
  latenciaMs?: number;
}> {
  const startTime = Date.now();
  const testConfig = {
    host: configOverride.host || activeDbConfig.host,
    port: parseInt(String(configOverride.port || activeDbConfig.port), 10),
    user: configOverride.user || activeDbConfig.user,
    password: configOverride.password !== undefined ? configOverride.password : activeDbConfig.password,
    database: configOverride.database || activeDbConfig.database,
    connectionTimeoutMillis: 4000,
    query_timeout: 4000,
    ssl: configOverride.ssl ? { rejectUnauthorized: false } : undefined,
  };

  const testPool = new Pool(testConfig);
  try {
    const client = await testPool.connect();
    const result = await client.query('SELECT version(), current_database(), current_user');
    client.release();
    await testPool.end();
    const latenciaMs = Date.now() - startTime;

    return {
      sucesso: true,
      mensagem: `Conexão bem-sucedida! PostgreSQL respondendo em ${latenciaMs}ms (Usuário: ${result.rows[0]?.current_user}, Banco: ${result.rows[0]?.current_database})`,
      latenciaMs,
    };
  } catch (err: any) {
    try {
      await testPool.end();
    } catch {}

    return {
      sucesso: false,
      mensagem: err?.message || 'Falha ao conectar',
      codigo: err?.code || 'CONNECTION_ERROR',
      detalhe: err?.detail || err?.hint || undefined,
      latenciaMs: Date.now() - startTime,
    };
  }
}

// Reconectar aplicando novas configurações se fornecidas
export async function reconnectToDatabase(configOverride?: {
  host?: string;
  port?: number | string;
  user?: string;
  password?: string;
  database?: string;
}): Promise<ReturnType<typeof getDbStatus>> {
  if (configOverride) {
    activeDbConfig = {
      ...activeDbConfig,
      ...(configOverride.host ? { host: configOverride.host } : {}),
      ...(configOverride.port ? { port: parseInt(String(configOverride.port), 10) } : {}),
      ...(configOverride.user ? { user: configOverride.user } : {}),
      ...(configOverride.password !== undefined ? { password: configOverride.password } : {}),
      ...(configOverride.database ? { database: configOverride.database } : {}),
    };
  }

  await initDatabaseConnection();
  return getDbStatus();
}

// Retorna o status atual e detalhado da conexão
export function getDbStatus() {
  let dicaSolucao = '';
  if (!isConnectedToPostgres) {
    if (connectionErrorCode === 'ECONNREFUSED') {
      dicaSolucao = `A porta ${activeDbConfig.port} no host ${activeDbConfig.host} recusou a conexão. Verifique se o serviço do PostgreSQL está iniciado e escutando na porta correta.`;
    } else if (connectionErrorCode === 'ETIMEDOUT') {
      dicaSolucao = `Tempo limite esgotado ao tentar alcançar ${activeDbConfig.host}:${activeDbConfig.port}. Se o banco está na sua máquina local e a aplicação na nuvem, o IP privado (192.168.x.x) não é roteável pela internet. Se estiver rodando o app localmente via 'npm run dev', verifique se o firewall permite tráfego na porta ${activeDbConfig.port}.`;
    } else if (connectionErrorCode === '28P01' || connectionErrorMsg.includes('password authentication failed')) {
      dicaSolucao = `Falha de autenticação de senha para o usuário '${activeDbConfig.user}'. Preencha a variável DB_PASSWORD no arquivo .env ou no painel de diagnóstico.`;
    } else if (connectionErrorCode === '3D000' || connectionErrorMsg.includes('database') && connectionErrorMsg.includes('does not exist')) {
      dicaSolucao = `O banco de dados '${activeDbConfig.database}' não existe no servidor PostgreSQL. Crie-o com 'CREATE DATABASE ${activeDbConfig.database};'.`;
    } else if (connectionErrorCode === 'ENOTFOUND') {
      dicaSolucao = `O endereço host '${activeDbConfig.host}' não pôde ser resolvido por DNS. Verifique a digitação do host (ex: localhost ou 127.0.0.1 se for local).`;
    } else {
      dicaSolucao = `Verifique se as credenciais no .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) correspondem à sua instância do PostgreSQL.`;
    }
  }

  return {
    modo: (isConnectedToPostgres ? 'postgres' : 'fallback_memoria') as 'postgres' | 'fallback_memoria',
    mensagem: isConnectedToPostgres
      ? `Conectado com sucesso ao PostgreSQL 16 em ${activeDbConfig.host}:${activeDbConfig.port}`
      : `Modo Fallback em Memória ativo — Não foi possível comunicar com o PostgreSQL em ${activeDbConfig.host}:${activeDbConfig.port}.`,
    host: activeDbConfig.host,
    porta: activeDbConfig.port,
    banco: activeDbConfig.database,
    usuario: activeDbConfig.user,
    temSenha: Boolean(activeDbConfig.password && activeDbConfig.password.length > 0),
    ultimoErro: connectionErrorMsg || undefined,
    codigoErro: connectionErrorCode || undefined,
    detalhesErro: connectionErrorDetail || undefined,
    dicaSolucao: dicaSolucao || undefined,
    ultimaTentativa: lastAttemptTime,
  };
}

// ----------------------------------------------------
// METADATA (Conjuradores, Livros, Enums)
// ----------------------------------------------------
export async function getMetadata(): Promise<{
  conjuradores: Conjurador[];
  livros: Livro[];
  escolas: readonly Escola[];
  tipos_dano: readonly TipoDano[];
  atributos: readonly Atributo[];
  dados: readonly Dado[];
  formas: readonly Forma[];
  totalMagias: number;
  statusConexao: ReturnType<typeof getDbStatus>;
}> {
  let conjuradores: Conjurador[] = [];
  let livros: Livro[] = [];
  let totalMagias = 0;

  if (isConnectedToPostgres && pool) {
    try {
      const conjRes = await pool.query('SELECT id_conjurador, classe FROM "public"."conjuradores" ORDER BY classe ASC');
      conjuradores = conjRes.rows;

      const livRes = await pool.query('SELECT id_livro, nome_livro FROM "public"."livros" ORDER BY nome_livro ASC');
      livros = livRes.rows;

      const magRes = await pool.query('SELECT COUNT(*) FROM "public"."magias"');
      totalMagias = parseInt(magRes.rows[0].count, 10);
    } catch (e) {
      console.error('[DB Error in getMetadata]', e);
      conjuradores = [...memoryDB.conjuradores];
      livros = [...memoryDB.livros];
      totalMagias = memoryDB.magias.size;
    }
  } else {
    conjuradores = [...memoryDB.conjuradores];
    livros = [...memoryDB.livros];
    totalMagias = memoryDB.magias.size;
  }

  return {
    conjuradores,
    livros,
    escolas: ESCOLAS,
    tipos_dano: TIPOS_DANO,
    atributos: ATRIBUTOS,
    dados: DADOS,
    formas: FORMAS,
    totalMagias,
    statusConexao: getDbStatus(),
  };
}

// ----------------------------------------------------
// CRUD CONJURADORES E LIVROS
// ----------------------------------------------------
export async function createConjurador(classe: string): Promise<Conjurador> {
  const trimmed = classe.trim();
  if (!trimmed) throw new Error('Nome da classe é obrigatório');

  if (isConnectedToPostgres && pool) {
    const res = await pool.query('INSERT INTO "public"."conjuradores" (classe) VALUES ($1) RETURNING id_conjurador, classe', [trimmed]);
    return res.rows[0];
  } else {
    const existing = memoryDB.conjuradores.find(c => c.classe.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    memoryDB.lastIdConjurador++;
    const novo: Conjurador = { id_conjurador: memoryDB.lastIdConjurador, classe: trimmed };
    memoryDB.conjuradores.push(novo);
    return novo;
  }
}

export async function createLivro(nome_livro: string): Promise<Livro> {
  const trimmed = nome_livro.trim();
  if (!trimmed) throw new Error('Nome do livro é obrigatório');

  if (isConnectedToPostgres && pool) {
    const res = await pool.query('INSERT INTO "public"."livros" (nome_livro) VALUES ($1) RETURNING id_livro, nome_livro', [trimmed]);
    return res.rows[0];
  } else {
    const existing = memoryDB.livros.find(l => l.nome_livro.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    memoryDB.lastIdLivro++;
    const novo: Livro = { id_livro: memoryDB.lastIdLivro, nome_livro: trimmed };
    memoryDB.livros.push(novo);
    return novo;
  }
}

// ----------------------------------------------------
// LISTAGEM E FILTRAGEM AVANÇADA DE MAGIAS
// ----------------------------------------------------
export async function listMagias(filtros: FiltrosMagia): Promise<MagiaCompleta[]> {
  if (isConnectedToPostgres && pool) {
    try {
      let query = `
        SELECT 
          m.id_magia,
          m.nome_magia,
          m.circulo,
          m.escola,
          m.tempo,
          m.alcance,
          m.forma,
          m.tamanho,
          m.componente_verbal,
          m.componente_somatico,
          m.componente_material,
          m.consumo_material,
          m.valor_material,
          m.descricao_material,
          m.duracao,
          m.concentracao,
          m.salvaguarda,
          m.atributo_salvaguarda,
          m.ataque,
          m.id_livro,
          l.nome_livro,
          m.descricao,
          m.dado_dano,
          m.numero_dados_dano,
          m.bonus_dano,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('id_conjurador', c.id_conjurador, 'classe', c.classe)) 
            FILTER (WHERE c.id_conjurador IS NOT NULL), '[]'
          ) as conjuradores,
          COALESCE(
            array_agg(DISTINCT mc.id_conjurador) 
            FILTER (WHERE mc.id_conjurador IS NOT NULL), '{}'
          ) as conjuradores_ids,
          COALESCE(
            array_agg(DISTINCT mtd.tipo_dano) 
            FILTER (WHERE mtd.tipo_dano IS NOT NULL), '{}'
          ) as tipos_dano
        FROM "public"."magias" m
        LEFT JOIN "public"."livros" l ON m.id_livro = l.id_livro
        LEFT JOIN "public"."magias_conjuradores" mc ON m.id_magia = mc.id_magia
        LEFT JOIN "public"."conjuradores" c ON mc.id_conjurador = c.id_conjurador
        LEFT JOIN "public"."magias_tipo_dano" mtd ON m.id_magia = mtd.id_magia
      `;

      const whereClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filtros.busca && filtros.busca.trim()) {
        whereClauses.push(`(m.nome_magia ILIKE $${paramIndex} OR m.descricao ILIKE $${paramIndex})`);
        params.push(`%${filtros.busca.trim()}%`);
        paramIndex++;
      }

      if (filtros.circulos && filtros.circulos.length > 0) {
        whereClauses.push(`m.circulo = ANY($${paramIndex}::int[])`);
        params.push(filtros.circulos);
        paramIndex++;
      }

      if (filtros.escolas && filtros.escolas.length > 0) {
        whereClauses.push(`m.escola = ANY($${paramIndex}::escolas[])`);
        params.push(filtros.escolas);
        paramIndex++;
      }

      if (filtros.livros_ids && filtros.livros_ids.length > 0) {
        whereClauses.push(`m.id_livro = ANY($${paramIndex}::int[])`);
        params.push(filtros.livros_ids);
        paramIndex++;
      }

      if (typeof filtros.concentracao === 'boolean') {
        whereClauses.push(`m.concentracao = $${paramIndex}`);
        params.push(filtros.concentracao);
        paramIndex++;
      }

      if (typeof filtros.salvaguarda === 'boolean') {
        whereClauses.push(`m.salvaguarda = $${paramIndex}`);
        params.push(filtros.salvaguarda);
        paramIndex++;
      }

      if (filtros.atributo_salvaguarda && filtros.atributo_salvaguarda !== 'todos') {
        whereClauses.push(`m.atributo_salvaguarda = $${paramIndex}::atributos`);
        params.push(filtros.atributo_salvaguarda);
        paramIndex++;
      }

      if (typeof filtros.ataque === 'boolean') {
        whereClauses.push(`m.ataque = $${paramIndex}`);
        params.push(filtros.ataque);
        paramIndex++;
      }

      if (typeof filtros.componente_verbal === 'boolean') {
        whereClauses.push(`m.componente_verbal = $${paramIndex}`);
        params.push(filtros.componente_verbal);
        paramIndex++;
      }

      if (typeof filtros.componente_somatico === 'boolean') {
        whereClauses.push(`m.componente_somatico = $${paramIndex}`);
        params.push(filtros.componente_somatico);
        paramIndex++;
      }

      if (typeof filtros.componente_material === 'boolean') {
        whereClauses.push(`m.componente_material = $${paramIndex}`);
        params.push(filtros.componente_material);
        paramIndex++;
      }

      if (typeof filtros.consumo_material === 'boolean') {
        whereClauses.push(`m.consumo_material = $${paramIndex}`);
        params.push(filtros.consumo_material);
        paramIndex++;
      }

      if (filtros.forma && filtros.forma !== 'todos') {
        whereClauses.push(`m.forma = $${paramIndex}::formas`);
        params.push(filtros.forma);
        paramIndex++;
      }

      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      query += `
        GROUP BY m.id_magia, l.nome_livro
      `;

      // Having clauses para filtros em tabelas N:M
      const havingClauses: string[] = [];

      if (filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0) {
        havingClauses.push(`array_agg(DISTINCT mc.id_conjurador) && $${paramIndex}::int[]`);
        params.push(filtros.conjuradores_ids);
        paramIndex++;
      }

      if (filtros.tipos_dano && filtros.tipos_dano.length > 0) {
        havingClauses.push(`array_agg(DISTINCT mtd.tipo_dano::text) && $${paramIndex}::text[]`);
        params.push(filtros.tipos_dano);
        paramIndex++;
      }

      if (filtros.tem_dano === true) {
        havingClauses.push(`(m.dado_dano IS NOT NULL OR count(mtd.tipo_dano) > 0)`);
      }

      if (havingClauses.length > 0) {
        query += ' HAVING ' + havingClauses.join(' AND ');
      }

      const sortCol = filtros.sort_by === 'circulo' ? 'm.circulo' :
                      filtros.sort_by === 'escola' ? 'm.escola' :
                      filtros.sort_by === 'id_magia' ? 'm.id_magia' : 'm.nome_magia';
      const sortDir = filtros.sort_order === 'desc' ? 'DESC' : 'ASC';

      query += ` ORDER BY ${sortCol} ${sortDir}, m.nome_magia ASC`;

      const res = await pool.query(query, params);
      return res.rows.map(r => ({
        ...r,
        tamanho: r.tamanho !== null ? Number(r.tamanho) : null,
        valor_material: r.valor_material !== null ? Number(r.valor_material) : null,
        conjuradores: Array.isArray(r.conjuradores) ? r.conjuradores : [],
        conjuradores_ids: Array.isArray(r.conjuradores_ids) ? r.conjuradores_ids : [],
        tipos_dano: Array.isArray(r.tipos_dano) ? r.tipos_dano : [],
      }));
    } catch (err) {
      console.error('[DB Error in listMagias]', err);
    }
  }

  // Fallback em memória
  let list = Array.from(memoryDB.magias.values());

  if (filtros.busca && filtros.busca.trim()) {
    const q = filtros.busca.trim().toLowerCase();
    list = list.filter(m => m.nome_magia.toLowerCase().includes(q) || m.descricao.toLowerCase().includes(q));
  }

  if (filtros.circulos && filtros.circulos.length > 0) {
    list = list.filter(m => filtros.circulos!.includes(m.circulo));
  }

  if (filtros.escolas && filtros.escolas.length > 0) {
    list = list.filter(m => filtros.escolas!.includes(m.escola));
  }

  if (filtros.livros_ids && filtros.livros_ids.length > 0) {
    list = list.filter(m => filtros.livros_ids!.includes(m.id_livro));
  }

  if (filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0) {
    list = list.filter(m => m.conjuradores_ids.some(cid => filtros.conjuradores_ids!.includes(cid)));
  }

  if (filtros.tipos_dano && filtros.tipos_dano.length > 0) {
    list = list.filter(m => m.tipos_dano.some(td => filtros.tipos_dano!.includes(td)));
  }

  if (typeof filtros.concentracao === 'boolean') {
    list = list.filter(m => m.concentracao === filtros.concentracao);
  }

  if (typeof filtros.salvaguarda === 'boolean') {
    list = list.filter(m => m.salvaguarda === filtros.salvaguarda);
  }

  if (filtros.atributo_salvaguarda && filtros.atributo_salvaguarda !== 'todos') {
    list = list.filter(m => m.atributo_salvaguarda === filtros.atributo_salvaguarda);
  }

  if (typeof filtros.ataque === 'boolean') {
    list = list.filter(m => m.ataque === filtros.ataque);
  }

  if (typeof filtros.componente_verbal === 'boolean') {
    list = list.filter(m => m.componente_verbal === filtros.componente_verbal);
  }

  if (typeof filtros.componente_somatico === 'boolean') {
    list = list.filter(m => m.componente_somatico === filtros.componente_somatico);
  }

  if (typeof filtros.componente_material === 'boolean') {
    list = list.filter(m => m.componente_material === filtros.componente_material);
  }

  if (typeof filtros.consumo_material === 'boolean') {
    list = list.filter(m => m.consumo_material === filtros.consumo_material);
  }

  if (filtros.forma && filtros.forma !== 'todos') {
    list = list.filter(m => m.forma === filtros.forma);
  }

  if (filtros.tem_dano === true) {
    list = list.filter(m => m.dado_dano !== null || m.tipos_dano.length > 0);
  }

  const sortCol = filtros.sort_by || 'nome_magia';
  const sortDir = filtros.sort_order === 'desc' ? -1 : 1;

  list.sort((a, b) => {
    if (sortCol === 'circulo') {
      return (a.circulo - b.circulo) * sortDir;
    }
    if (sortCol === 'escola') {
      return a.escola.localeCompare(b.escola) * sortDir;
    }
    if (sortCol === 'id_magia') {
      return (a.id_magia - b.id_magia) * sortDir;
    }
    return a.nome_magia.localeCompare(b.nome_magia) * sortDir;
  });

  return list;
}

// ----------------------------------------------------
// OBTER MAGIA POR ID
// ----------------------------------------------------
export async function getMagiaById(id: number): Promise<MagiaCompleta | null> {
  if (isConnectedToPostgres && pool) {
    try {
      const query = `
        SELECT 
          m.*,
          l.nome_livro,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('id_conjurador', c.id_conjurador, 'classe', c.classe)) 
            FILTER (WHERE c.id_conjurador IS NOT NULL), '[]'
          ) as conjuradores,
          COALESCE(
            array_agg(DISTINCT mc.id_conjurador) 
            FILTER (WHERE mc.id_conjurador IS NOT NULL), '{}'
          ) as conjuradores_ids,
          COALESCE(
            array_agg(DISTINCT mtd.tipo_dano) 
            FILTER (WHERE mtd.tipo_dano IS NOT NULL), '{}'
          ) as tipos_dano
        FROM "public"."magias" m
        LEFT JOIN "public"."livros" l ON m.id_livro = l.id_livro
        LEFT JOIN "public"."magias_conjuradores" mc ON m.id_magia = mc.id_magia
        LEFT JOIN "public"."conjuradores" c ON mc.id_conjurador = c.id_conjurador
        LEFT JOIN "public"."magias_tipo_dano" mtd ON m.id_magia = mtd.id_magia
        WHERE m.id_magia = $1
        GROUP BY m.id_magia, l.nome_livro
      `;
      const res = await pool.query(query, [id]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        ...r,
        tamanho: r.tamanho !== null ? Number(r.tamanho) : null,
        valor_material: r.valor_material !== null ? Number(r.valor_material) : null,
        conjuradores: Array.isArray(r.conjuradores) ? r.conjuradores : [],
        conjuradores_ids: Array.isArray(r.conjuradores_ids) ? r.conjuradores_ids : [],
        tipos_dano: Array.isArray(r.tipos_dano) ? r.tipos_dano : [],
      };
    } catch (err) {
      console.error('[DB Error in getMagiaById]', err);
    }
  }

  return memoryDB.magias.get(id) || null;
}

// ----------------------------------------------------
// CRIAR MAGIA (COM TRANSAÇÃO N:M)
// ----------------------------------------------------
export async function createMagia(payload: MagiaPayload): Promise<MagiaCompleta> {
  // Validações estritas de schema
  if (!payload.nome_magia || !payload.nome_magia.trim()) throw new Error('Nome da magia é obrigatório');
  if (typeof payload.circulo !== 'number' || payload.circulo < 0 || payload.circulo > 9) {
    throw new Error('Círculo deve ser um número entre 0 e 9');
  }
  if (!ESCOLAS.includes(payload.escola)) {
    throw new Error(`Escola inválida: "${payload.escola}". Deve ser uma de: ${ESCOLAS.join(', ')}`);
  }
  if (payload.forma && !FORMAS.includes(payload.forma)) {
    throw new Error(`Forma inválida: "${payload.forma}". Deve ser uma de: ${FORMAS.join(', ')}`);
  }
  if (payload.atributo_salvaguarda && !ATRIBUTOS.includes(payload.atributo_salvaguarda)) {
    throw new Error(`Atributo de salvaguarda inválido: "${payload.atributo_salvaguarda}"`);
  }
  if (payload.dado_dano && !DADOS.includes(payload.dado_dano)) {
    throw new Error(`Dado de dano inválido: "${payload.dado_dano}"`);
  }

  for (const td of payload.tipos_dano || []) {
    if (!TIPOS_DANO.includes(td)) {
      throw new Error(`Tipo de dano inválido: "${td}". Deve ser um de: ${TIPOS_DANO.join(', ')}`);
    }
  }

  if (isConnectedToPostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertMagiaQuery = `
        INSERT INTO "public"."magias" (
          nome_magia, circulo, escola, tempo, alcance, forma, tamanho,
          componente_verbal, componente_somatico, componente_material,
          consumo_material, valor_material, descricao_material, duracao,
          concentracao, salvaguarda, atributo_salvaguarda, ataque, id_livro,
          descricao, dado_dano, numero_dados_dano, bonus_dano
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23
        ) RETURNING id_magia;
      `;

      const values = [
        payload.nome_magia.trim(),
        payload.circulo,
        payload.escola,
        payload.tempo.trim(),
        payload.alcance.trim(),
        payload.forma || null,
        payload.tamanho !== undefined && payload.tamanho !== null ? Number(payload.tamanho) : null,
        Boolean(payload.componente_verbal),
        Boolean(payload.componente_somatico),
        Boolean(payload.componente_material),
        payload.consumo_material !== undefined ? payload.consumo_material : null,
        payload.valor_material !== undefined && payload.valor_material !== null ? Number(payload.valor_material) : null,
        payload.descricao_material ? payload.descricao_material.trim() : null,
        payload.duracao.trim(),
        Boolean(payload.concentracao),
        Boolean(payload.salvaguarda),
        payload.atributo_salvaguarda || null,
        Boolean(payload.ataque),
        payload.id_livro,
        payload.descricao.trim(),
        payload.dado_dano || null,
        payload.numero_dados_dano !== undefined && payload.numero_dados_dano !== null ? Number(payload.numero_dados_dano) : null,
        payload.bonus_dano !== undefined && payload.bonus_dano !== null ? Number(payload.bonus_dano) : null,
      ];

      const res = await client.query(insertMagiaQuery, values);
      const newId = res.rows[0].id_magia;

      // Inserir conjuradores na tabela N:M
      if (payload.conjuradores_ids && payload.conjuradores_ids.length > 0) {
        for (const conjId of payload.conjuradores_ids) {
          await client.query(
            'INSERT INTO "public"."magias_conjuradores" (id_magia, id_conjurador) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [newId, conjId]
          );
        }
      }

      // Inserir tipos de dano na tabela N:M
      if (payload.tipos_dano && payload.tipos_dano.length > 0) {
        for (const td of payload.tipos_dano) {
          await client.query(
            'INSERT INTO "public"."magias_tipo_dano" (id_magia, tipo_dano) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [newId, td]
          );
        }
      }

      await client.query('COMMIT');
      client.release();

      const created = await getMagiaById(newId);
      if (!created) throw new Error('Erro ao recuperar magia criada');
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      throw err;
    }
  }

  // Em memória
  memoryDB.lastIdMagia++;
  const newId = memoryDB.lastIdMagia;

  const livroObj = memoryDB.livros.find(l => l.id_livro === payload.id_livro);
  const conjuradoresObjs = memoryDB.conjuradores.filter(c => (payload.conjuradores_ids || []).includes(c.id_conjurador));

  const novaMagia: MagiaCompleta = {
    id_magia: newId,
    nome_magia: payload.nome_magia.trim(),
    circulo: payload.circulo,
    escola: payload.escola,
    tempo: payload.tempo.trim(),
    alcance: payload.alcance.trim(),
    forma: payload.forma || null,
    tamanho: payload.tamanho !== undefined && payload.tamanho !== null ? Number(payload.tamanho) : null,
    componente_verbal: Boolean(payload.componente_verbal),
    componente_somatico: Boolean(payload.componente_somatico),
    componente_material: Boolean(payload.componente_material),
    consumo_material: payload.consumo_material !== undefined ? payload.consumo_material : null,
    valor_material: payload.valor_material !== undefined && payload.valor_material !== null ? Number(payload.valor_material) : null,
    descricao_material: payload.descricao_material ? payload.descricao_material.trim() : null,
    duracao: payload.duracao.trim(),
    concentracao: Boolean(payload.concentracao),
    salvaguarda: Boolean(payload.salvaguarda),
    atributo_salvaguarda: payload.atributo_salvaguarda || null,
    ataque: Boolean(payload.ataque),
    id_livro: payload.id_livro,
    nome_livro: livroObj ? livroObj.nome_livro : 'Livro Padrão',
    descricao: payload.descricao.trim(),
    dado_dano: payload.dado_dano || null,
    numero_dados_dano: payload.numero_dados_dano !== undefined && payload.numero_dados_dano !== null ? Number(payload.numero_dados_dano) : null,
    bonus_dano: payload.bonus_dano !== undefined && payload.bonus_dano !== null ? Number(payload.bonus_dano) : null,
    conjuradores: conjuradoresObjs,
    conjuradores_ids: payload.conjuradores_ids || [],
    tipos_dano: payload.tipos_dano || [],
  };

  memoryDB.magias.set(newId, novaMagia);
  return novaMagia;
}

// ----------------------------------------------------
// EDITAR MAGIA (COM ATUALIZAÇÃO TRANSAÇÃO N:M)
// ----------------------------------------------------
export async function updateMagia(id: number, payload: MagiaPayload): Promise<MagiaCompleta> {
  if (!payload.nome_magia || !payload.nome_magia.trim()) throw new Error('Nome da magia é obrigatório');
  if (typeof payload.circulo !== 'number' || payload.circulo < 0 || payload.circulo > 9) {
    throw new Error('Círculo deve ser um número entre 0 e 9');
  }
  if (!ESCOLAS.includes(payload.escola)) {
    throw new Error(`Escola inválida: "${payload.escola}"`);
  }

  if (isConnectedToPostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateQuery = `
        UPDATE "public"."magias" SET
          nome_magia = $1,
          circulo = $2,
          escola = $3,
          tempo = $4,
          alcance = $5,
          forma = $6,
          tamanho = $7,
          componente_verbal = $8,
          componente_somatico = $9,
          componente_material = $10,
          consumo_material = $11,
          valor_material = $12,
          descricao_material = $13,
          duracao = $14,
          concentracao = $15,
          salvaguarda = $16,
          atributo_salvaguarda = $17,
          ataque = $18,
          id_livro = $19,
          descricao = $20,
          dado_dano = $21,
          numero_dados_dano = $22,
          bonus_dano = $23
        WHERE id_magia = $24;
      `;

      const values = [
        payload.nome_magia.trim(),
        payload.circulo,
        payload.escola,
        payload.tempo.trim(),
        payload.alcance.trim(),
        payload.forma || null,
        payload.tamanho !== undefined && payload.tamanho !== null ? Number(payload.tamanho) : null,
        Boolean(payload.componente_verbal),
        Boolean(payload.componente_somatico),
        Boolean(payload.componente_material),
        payload.consumo_material !== undefined ? payload.consumo_material : null,
        payload.valor_material !== undefined && payload.valor_material !== null ? Number(payload.valor_material) : null,
        payload.descricao_material ? payload.descricao_material.trim() : null,
        payload.duracao.trim(),
        Boolean(payload.concentracao),
        Boolean(payload.salvaguarda),
        payload.atributo_salvaguarda || null,
        Boolean(payload.ataque),
        payload.id_livro,
        payload.descricao.trim(),
        payload.dado_dano || null,
        payload.numero_dados_dano !== undefined && payload.numero_dados_dano !== null ? Number(payload.numero_dados_dano) : null,
        payload.bonus_dano !== undefined && payload.bonus_dano !== null ? Number(payload.bonus_dano) : null,
        id,
      ];

      await client.query(updateQuery, values);

      // Sincronizar conjuradores N:M
      await client.query('DELETE FROM "public"."magias_conjuradores" WHERE id_magia = $1', [id]);
      if (payload.conjuradores_ids && payload.conjuradores_ids.length > 0) {
        for (const conjId of payload.conjuradores_ids) {
          await client.query(
            'INSERT INTO "public"."magias_conjuradores" (id_magia, id_conjurador) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, conjId]
          );
        }
      }

      // Sincronizar tipos de dano N:M
      await client.query('DELETE FROM "public"."magias_tipo_dano" WHERE id_magia = $1', [id]);
      if (payload.tipos_dano && payload.tipos_dano.length > 0) {
        for (const td of payload.tipos_dano) {
          await client.query(
            'INSERT INTO "public"."magias_tipo_dano" (id_magia, tipo_dano) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, td]
          );
        }
      }

      await client.query('COMMIT');
      client.release();

      const updated = await getMagiaById(id);
      if (!updated) throw new Error('Magia não encontrada após atualização');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      throw err;
    }
  }

  // Em memória
  if (!memoryDB.magias.has(id)) {
    throw new Error(`Magia #${id} não encontrada`);
  }

  const livroObj = memoryDB.livros.find(l => l.id_livro === payload.id_livro);
  const conjuradoresObjs = memoryDB.conjuradores.filter(c => (payload.conjuradores_ids || []).includes(c.id_conjurador));

  const updated: MagiaCompleta = {
    id_magia: id,
    nome_magia: payload.nome_magia.trim(),
    circulo: payload.circulo,
    escola: payload.escola,
    tempo: payload.tempo.trim(),
    alcance: payload.alcance.trim(),
    forma: payload.forma || null,
    tamanho: payload.tamanho !== undefined && payload.tamanho !== null ? Number(payload.tamanho) : null,
    componente_verbal: Boolean(payload.componente_verbal),
    componente_somatico: Boolean(payload.componente_somatico),
    componente_material: Boolean(payload.componente_material),
    consumo_material: payload.consumo_material !== undefined ? payload.consumo_material : null,
    valor_material: payload.valor_material !== undefined && payload.valor_material !== null ? Number(payload.valor_material) : null,
    descricao_material: payload.descricao_material ? payload.descricao_material.trim() : null,
    duracao: payload.duracao.trim(),
    concentracao: Boolean(payload.concentracao),
    salvaguarda: Boolean(payload.salvaguarda),
    atributo_salvaguarda: payload.atributo_salvaguarda || null,
    ataque: Boolean(payload.ataque),
    id_livro: payload.id_livro,
    nome_livro: livroObj ? livroObj.nome_livro : 'Livro Desconhecido',
    descricao: payload.descricao.trim(),
    dado_dano: payload.dado_dano || null,
    numero_dados_dano: payload.numero_dados_dano !== undefined && payload.numero_dados_dano !== null ? Number(payload.numero_dados_dano) : null,
    bonus_dano: payload.bonus_dano !== undefined && payload.bonus_dano !== null ? Number(payload.bonus_dano) : null,
    conjuradores: conjuradoresObjs,
    conjuradores_ids: payload.conjuradores_ids || [],
    tipos_dano: payload.tipos_dano || [],
  };

  memoryDB.magias.set(id, updated);
  return updated;
}

// ----------------------------------------------------
// APAGAR MAGIA
// ----------------------------------------------------
export async function deleteMagia(id: number): Promise<boolean> {
  if (isConnectedToPostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM "public"."magias_conjuradores" WHERE id_magia = $1', [id]);
      await client.query('DELETE FROM "public"."magias_tipo_dano" WHERE id_magia = $1', [id]);
      const res = await client.query('DELETE FROM "public"."magias" WHERE id_magia = $1', [id]);
      await client.query('COMMIT');
      client.release();
      return (res.rowCount || 0) > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      throw err;
    }
  }

  const existed = memoryDB.magias.has(id);
  memoryDB.magias.delete(id);
  return existed;
}
