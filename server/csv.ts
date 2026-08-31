import {
  MagiaCompleta,
  MagiaPayload,
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
  ResultadoImportacaoCSV,
} from '../src/types.js';
import {
  getMetadata,
  createLivro,
  createConjurador,
  createMagia,
} from './db.js';

// Função para parsear linha CSV respeitando aspas
export function parseCSVLine(text: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Converte strings flexíveis para boolean
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (!value) return false;
  const v = String(value).trim().toLowerCase();
  return ['true', '1', 'sim', 's', 'v', 'verdadeiro', 'yes', 'y'].includes(v);
}

export function parseNullableBoolean(value: any): boolean | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  return parseBoolean(value);
}

export function parseNullableNumber(value: any): number | null {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const num = Number(String(value).replace(',', '.').trim());
  return isNaN(num) ? null : num;
}

// Normaliza strings para comparar ignorando acentos ou minúsculas caso necessário, mas validando os enums exatos
export function findMatchingEnum<T extends string>(val: string | null | undefined, validValues: readonly T[]): T | null {
  if (!val || !val.trim()) return null;
  const trimmed = val.trim();
  // Busca exata primeiro
  const exact = validValues.find(v => v.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  return null;
}

export async function processCSVImport(
  csvContent: string,
  securityPin: string,
  expectedPin: string = '1998'
): Promise<ResultadoImportacaoCSV> {
  if (securityPin !== expectedPin) {
    throw new Error('Senha de segurança inválida. Acesso negado para importação.');
  }

  const rawLines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length < 2) {
    throw new Error('O arquivo CSV deve conter um cabeçalho e pelo menos uma linha de dados.');
  }

  // Detectar delimitador (vírgula ou ponto-e-vírgula no cabeçalho)
  const headerLine = rawLines[0];
  const delimiter = headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';
  const headers = parseCSVLine(headerLine, delimiter).map(h => h.toLowerCase().replace(/[\s_]+/g, '_'));

  const meta = await getMetadata();
  const existingLivrosMap = new Map<string, number>(meta.livros.map(l => [l.nome_livro.toLowerCase(), l.id_livro]));
  const existingConjuradoresMap = new Map<string, number>(meta.conjuradores.map(c => [c.classe.toLowerCase(), c.id_conjurador]));

  const novosLivrosCriados: string[] = [];
  const novosConjuradoresCriados: string[] = [];
  const erros: Array<{ linha: number; magia?: string; mensagem: string }> = [];
  let importadas = 0;

  for (let idx = 1; idx < rawLines.length; idx++) {
    const lineNum = idx + 1;
    const lineText = rawLines[idx];
    const cols = parseCSVLine(lineText, delimiter);

    // Mapear valores por cabeçalho
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = cols[i] || '';
    });

    const nome_magia = row['nome_magia'] || row['nome'] || '';
    if (!nome_magia.trim()) {
      erros.push({ linha: lineNum, mensagem: 'Nome da magia não informado.' });
      continue;
    }

    try {
      // 1. Validar círculo
      const circuloRaw = row['circulo'] || row['nivel'] || '0';
      const circulo = parseInt(circuloRaw, 10);
      if (isNaN(circulo) || circulo < 0 || circulo > 9) {
        throw new Error(`Círculo inválido: "${circuloRaw}". Deve ser entre 0 e 9.`);
      }

      // 2. Validar escola
      const escolaRaw = row['escola'] || '';
      const escolaMatch = findMatchingEnum(escolaRaw, ESCOLAS);
      if (!escolaMatch) {
        throw new Error(`Escola inválida: "${escolaRaw}". Opções válidas: ${ESCOLAS.join(', ')}`);
      }

      // 3. Validar forma e atributo_salvaguarda
      const formaRaw = row['forma'] || '';
      const formaMatch = formaRaw ? findMatchingEnum(formaRaw, FORMAS) : null;
      if (formaRaw && !formaMatch) {
        throw new Error(`Forma inválida: "${formaRaw}". Opções válidas: ${FORMAS.join(', ')}`);
      }

      const salvaguarda = parseBoolean(row['salvaguarda']);
      const attrSalvaRaw = row['atributo_salvaguarda'] || row['salvaguarda_atributo'] || '';
      const attrMatch = attrSalvaRaw ? findMatchingEnum(attrSalvaRaw, ATRIBUTOS) : null;
      if (attrSalvaRaw && !attrMatch) {
        throw new Error(`Atributo de salvaguarda inválido: "${attrSalvaRaw}". Opções válidas: ${ATRIBUTOS.join(', ')}`);
      }

      // 4. Validar dados de dano
      const dadoRaw = row['dado_dano'] || row['dado'] || '';
      const dadoMatch = dadoRaw ? findMatchingEnum(dadoRaw, DADOS) : null;
      if (dadoRaw && !dadoMatch) {
        throw new Error(`Dado de dano inválido: "${dadoRaw}". Opções válidas: ${DADOS.join(', ')}`);
      }

      // 5. Livro (busca existente ou cria)
      const nomeLivro = row['livro'] || row['nome_livro'] || 'Livro do Jogador (PHB)';
      let idLivro = existingLivrosMap.get(nomeLivro.toLowerCase());
      if (!idLivro) {
        const novoLivro = await createLivro(nomeLivro);
        idLivro = novoLivro.id_livro;
        existingLivrosMap.set(nomeLivro.toLowerCase(), idLivro);
        if (!novosLivrosCriados.includes(nomeLivro)) novosLivrosCriados.push(nomeLivro);
      }

      // 6. Conjuradores (N:M - separados por ; ou | ou /)
      const conjuradoresRaw = row['conjuradores'] || row['classes'] || '';
      const conjuradoresNomes = conjuradoresRaw
        ? conjuradoresRaw.split(/[,;|/]/).map(c => c.trim()).filter(Boolean)
        : [];

      const conjuradores_ids: number[] = [];
      for (const cNome of conjuradoresNomes) {
        let cId = existingConjuradoresMap.get(cNome.toLowerCase());
        if (!cId) {
          const novoConj = await createConjurador(cNome);
          cId = novoConj.id_conjurador;
          existingConjuradoresMap.set(cNome.toLowerCase(), cId);
          if (!novosConjuradoresCriados.includes(cNome)) novosConjuradoresCriados.push(cNome);
        }
        if (!conjuradores_ids.includes(cId)) {
          conjuradores_ids.push(cId);
        }
      }

      // 7. Tipos de Dano (N:M - separados por ; ou | ou /)
      const tiposDanoRaw = row['tipos_dano'] || row['tipo_dano'] || row['danos'] || '';
      const tiposDanoNomes = tiposDanoRaw
        ? tiposDanoRaw.split(/[,;|/]/).map(d => d.trim()).filter(Boolean)
        : [];

      const tipos_dano: TipoDano[] = [];
      for (const tdNome of tiposDanoNomes) {
        const tdMatch = findMatchingEnum(tdNome, TIPOS_DANO);
        if (!tdMatch) {
          throw new Error(`Tipo de dano inválido: "${tdNome}". Opções válidas: ${TIPOS_DANO.join(', ')}`);
        }
        if (!tipos_dano.includes(tdMatch)) {
          tipos_dano.push(tdMatch);
        }
      }

      const payload: MagiaPayload = {
        nome_magia: nome_magia.trim(),
        circulo,
        escola: escolaMatch,
        tempo: row['tempo'] || '1 ação',
        alcance: row['alcance'] || 'Pessoal',
        forma: formaMatch,
        tamanho: parseNullableNumber(row['tamanho']),
        componente_verbal: parseBoolean(row['componente_verbal'] ?? row['verbal']),
        componente_somatico: parseBoolean(row['componente_somatico'] ?? row['somatico']),
        componente_material: parseBoolean(row['componente_material'] ?? row['material']),
        consumo_material: parseNullableBoolean(row['consumo_material']),
        valor_material: parseNullableNumber(row['valor_material']),
        descricao_material: row['descricao_material'] || null,
        duracao: row['duracao'] || 'Instantânea',
        concentracao: parseBoolean(row['concentracao']),
        salvaguarda,
        atributo_salvaguarda: attrMatch,
        ataque: parseBoolean(row['ataque']),
        id_livro: idLivro,
        descricao: row['descricao'] || 'Sem descrição.',
        dado_dano: dadoMatch,
        numero_dados_dano: parseNullableNumber(row['numero_dados_dano']),
        bonus_dano: parseNullableNumber(row['bonus_dano']),
        conjuradores_ids,
        tipos_dano,
      };

      await createMagia(payload);
      importadas++;
    } catch (err: any) {
      erros.push({
        linha: lineNum,
        magia: nome_magia,
        mensagem: err?.message || 'Erro desconhecido ao processar linha',
      });
    }
  }

  return {
    sucesso: erros.length === 0,
    importadas,
    totalLinhas: rawLines.length - 1,
    erros,
    novosLivrosCriados,
    novosConjuradoresCriados,
  };
}

// Gera conteúdo CSV das magias atuais
export function generateCSVExport(magias: MagiaCompleta[]): string {
  const headers = [
    'nome_magia',
    'circulo',
    'escola',
    'tempo',
    'alcance',
    'forma',
    'tamanho',
    'componente_verbal',
    'componente_somatico',
    'componente_material',
    'consumo_material',
    'valor_material',
    'descricao_material',
    'duracao',
    'concentracao',
    'salvaguarda',
    'atributo_salvaguarda',
    'ataque',
    'livro',
    'descricao',
    'dado_dano',
    'numero_dados_dano',
    'bonus_dano',
    'conjuradores',
    'tipos_dano',
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = magias.map(m => {
    const conjuradoresStr = (m.conjuradores || []).map(c => c.classe).join(';');
    const tiposDanoStr = (m.tipos_dano || []).join(';');

    return [
      escapeCSV(m.nome_magia),
      escapeCSV(m.circulo),
      escapeCSV(m.escola),
      escapeCSV(m.tempo),
      escapeCSV(m.alcance),
      escapeCSV(m.forma || ''),
      escapeCSV(m.tamanho !== null ? m.tamanho : ''),
      escapeCSV(m.componente_verbal ? 'true' : 'false'),
      escapeCSV(m.componente_somatico ? 'true' : 'false'),
      escapeCSV(m.componente_material ? 'true' : 'false'),
      escapeCSV(m.consumo_material !== null ? (m.consumo_material ? 'true' : 'false') : ''),
      escapeCSV(m.valor_material !== null ? m.valor_material : ''),
      escapeCSV(m.descricao_material || ''),
      escapeCSV(m.duracao),
      escapeCSV(m.concentracao ? 'true' : 'false'),
      escapeCSV(m.salvaguarda ? 'true' : 'false'),
      escapeCSV(m.atributo_salvaguarda || ''),
      escapeCSV(m.ataque ? 'true' : 'false'),
      escapeCSV(m.nome_livro || ''),
      escapeCSV(m.descricao),
      escapeCSV(m.dado_dano || ''),
      escapeCSV(m.numero_dados_dano !== null ? m.numero_dados_dano : ''),
      escapeCSV(m.bonus_dano !== null ? m.bonus_dano : ''),
      escapeCSV(conjuradoresStr),
      escapeCSV(tiposDanoStr),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
