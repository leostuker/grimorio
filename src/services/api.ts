import {
  MagiaCompleta,
  MagiaPayload,
  MetadataBanco,
  FiltrosMagia,
  ResultadoImportacaoCSV,
  Conjurador,
  Livro,
} from '../types';

let sessionPin: string = '';

export function setSessionPin(pin: string) {
  sessionPin = pin;
}

export function getSessionPin(): string {
  return sessionPin;
}

export async function fetchStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Falha ao obter status do banco');
  return res.json();
}

export async function fetchMetadata(): Promise<MetadataBanco> {
  const res = await fetch('/api/metadata');
  if (!res.ok) throw new Error('Falha ao obter metadados');
  return res.json();
}

export async function fetchMagias(filtros: FiltrosMagia): Promise<MagiaCompleta[]> {
  const params = new URLSearchParams();

  if (filtros.busca) params.append('busca', filtros.busca);
  if (filtros.circulos && filtros.circulos.length > 0) params.append('circulos', filtros.circulos.join(','));
  if (filtros.escolas && filtros.escolas.length > 0) params.append('escolas', filtros.escolas.join(','));
  if (filtros.conjuradores_ids && filtros.conjuradores_ids.length > 0) params.append('conjuradores_ids', filtros.conjuradores_ids.join(','));
  if (filtros.tipos_dano && filtros.tipos_dano.length > 0) params.append('tipos_dano', filtros.tipos_dano.join(','));
  if (filtros.livros_ids && filtros.livros_ids.length > 0) params.append('livros_ids', filtros.livros_ids.join(','));

  if (typeof filtros.concentracao === 'boolean') params.append('concentracao', String(filtros.concentracao));
  if (typeof filtros.salvaguarda === 'boolean') params.append('salvaguarda', String(filtros.salvaguarda));
  if (filtros.atributo_salvaguarda && filtros.atributo_salvaguarda !== 'todos') {
    params.append('atributo_salvaguarda', filtros.atributo_salvaguarda);
  }
  if (typeof filtros.ataque === 'boolean') params.append('ataque', String(filtros.ataque));
  if (typeof filtros.componente_verbal === 'boolean') params.append('componente_verbal', String(filtros.componente_verbal));
  if (typeof filtros.componente_somatico === 'boolean') params.append('componente_somatico', String(filtros.componente_somatico));
  if (typeof filtros.componente_material === 'boolean') params.append('componente_material', String(filtros.componente_material));
  if (typeof filtros.consumo_material === 'boolean') params.append('consumo_material', String(filtros.consumo_material));
  if (filtros.forma && filtros.forma !== 'todos') params.append('forma', filtros.forma);
  if (filtros.tem_dano === true) params.append('tem_dano', 'true');

  if (filtros.sort_by) params.append('sort_by', filtros.sort_by);
  if (filtros.sort_order) params.append('sort_order', filtros.sort_order);

  const res = await fetch(`/api/magias?${params.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar lista de magias');
  return res.json();
}

export async function fetchMagiaById(id: number): Promise<MagiaCompleta> {
  const res = await fetch(`/api/magias/${id}`);
  if (!res.ok) throw new Error(`Falha ao obter magia #${id}`);
  return res.json();
}

export async function verifySecurityPin(pin: string): Promise<boolean> {
  const res = await fetch('/api/verify-pin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  const data = await res.json();
  return Boolean(data.valid);
}

export async function createMagiaAPI(payload: MagiaPayload, pin: string): Promise<MagiaCompleta> {
  const res = await fetch('/api/magias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-security-pin': pin || sessionPin,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao criar magia');
  }
  return data;
}

export async function updateMagiaAPI(id: number, payload: MagiaPayload, pin: string): Promise<MagiaCompleta> {
  const res = await fetch(`/api/magias/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-security-pin': pin || sessionPin,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao atualizar magia');
  }
  return data;
}

export async function deleteMagiaAPI(id: number, pin: string): Promise<void> {
  const res = await fetch(`/api/magias/${id}`, {
    method: 'DELETE',
    headers: {
      'x-security-pin': pin || sessionPin,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao apagar magia');
  }
}

export async function importCSVAPI(file: File | null, csvText: string | null, pin: string): Promise<ResultadoImportacaoCSV> {
  let res: Response;

  if (file) {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('pin', pin || sessionPin);
    res = await fetch('/api/magias/import-csv', {
      method: 'POST',
      headers: {
        'x-security-pin': pin || sessionPin,
      },
      body: formData,
    });
  } else {
    res = await fetch('/api/magias/import-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-security-pin': pin || sessionPin,
      },
      body: JSON.stringify({ csvText, pin: pin || sessionPin }),
    });
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Falha na importação CSV');
  }
  return data;
}

export async function createLivroAPI(nome_livro: string, pin: string): Promise<Livro> {
  const res = await fetch('/api/livros', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-security-pin': pin || sessionPin,
    },
    body: JSON.stringify({ nome_livro }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao cadastrar livro');
  }
  return data;
}

export async function createConjuradorAPI(classe: string, pin: string): Promise<Conjurador> {
  const res = await fetch('/api/conjuradores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-security-pin': pin || sessionPin,
    },
    body: JSON.stringify({ classe }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao cadastrar classe de conjurador');
  }
  return data;
}
