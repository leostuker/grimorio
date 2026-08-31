import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Shield,
  Save,
  Plus,
  Lock,
  Flame,
  Users,
  BookOpen,
  KeyRound,
  AlertCircle,
  Coins,
} from 'lucide-react';
import {
  MagiaCompleta,
  MagiaPayload,
  MetadataBanco,
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
} from '../types';
import { getSessionPin } from '../services/api';

interface SpellFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: MagiaPayload, pin: string) => Promise<void>;
  initialData?: Partial<MagiaCompleta> | null;
  metadata: MetadataBanco | null;
  isEditing?: boolean;
}

export const SpellFormModal: React.FC<SpellFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  metadata,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<MagiaPayload>({
    nome_magia: '',
    circulo: 1,
    escola: 'Evocação',
    tempo: '1 ação',
    alcance: '18 metros',
    forma: null,
    tamanho: null,
    componente_verbal: true,
    componente_somatico: true,
    componente_material: false,
    consumo_material: null,
    valor_material: null,
    descricao_material: '',
    duracao: 'Instantânea',
    concentracao: false,
    salvaguarda: false,
    atributo_salvaguarda: null,
    ataque: false,
    id_livro: 1,
    descricao: '',
    dado_dano: null,
    numero_dados_dano: null,
    bonus_dano: null,
    conjuradores_ids: [],
    tipos_dano: [],
  });

  const [pin, setPin] = useState(getSessionPin() || '1998');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome_magia: initialData.nome_magia || '',
        circulo: initialData.circulo ?? 1,
        escola: initialData.escola || 'Evocação',
        tempo: initialData.tempo || '1 ação',
        alcance: initialData.alcance || '18 metros',
        forma: initialData.forma || null,
        tamanho: initialData.tamanho ?? null,
        componente_verbal: Boolean(initialData.componente_verbal),
        componente_somatico: Boolean(initialData.componente_somatico),
        componente_material: Boolean(initialData.componente_material),
        consumo_material: initialData.consumo_material ?? null,
        valor_material: initialData.valor_material ?? null,
        descricao_material: initialData.descricao_material || '',
        duracao: initialData.duracao || 'Instantânea',
        concentracao: Boolean(initialData.concentracao),
        salvaguarda: Boolean(initialData.salvaguarda),
        atributo_salvaguarda: initialData.atributo_salvaguarda || null,
        ataque: Boolean(initialData.ataque),
        id_livro: initialData.id_livro || (metadata?.livros[0]?.id_livro ?? 1),
        descricao: initialData.descricao || '',
        dado_dano: initialData.dado_dano || null,
        numero_dados_dano: initialData.numero_dados_dano ?? null,
        bonus_dano: initialData.bonus_dano ?? null,
        conjuradores_ids: initialData.conjuradores_ids || (initialData.conjuradores ? initialData.conjuradores.map(c => c.id_conjurador) : []),
        tipos_dano: initialData.tipos_dano || [],
      });
    } else {
      setFormData({
        nome_magia: '',
        circulo: 1,
        escola: 'Evocação',
        tempo: '1 ação',
        alcance: '18 metros',
        forma: null,
        tamanho: null,
        componente_verbal: true,
        componente_somatico: true,
        componente_material: false,
        consumo_material: null,
        valor_material: null,
        descricao_material: '',
        duracao: 'Instantânea',
        concentracao: false,
        salvaguarda: false,
        atributo_salvaguarda: null,
        ataque: false,
        id_livro: metadata?.livros[0]?.id_livro ?? 1,
        descricao: '',
        dado_dano: null,
        numero_dados_dano: null,
        bonus_dano: null,
        conjuradores_ids: [],
        tipos_dano: [],
      });
    }
    setPin(getSessionPin() || '1998');
    setError(null);
  }, [initialData, isOpen, metadata]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_magia.trim()) {
      setError('O nome da magia é obrigatório.');
      return;
    }
    if (!formData.descricao.trim()) {
      setError('A descrição da magia é obrigatória.');
      return;
    }
    if (!pin.trim()) {
      setError('A senha de segurança (1998) é obrigatória para salvar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData, pin.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar magia.');
    } finally {
      setLoading(false);
    }
  };

  const toggleConjurador = (id: number) => {
    const current = formData.conjuradores_ids;
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    setFormData({ ...formData, conjuradores_ids: next });
  };

  const toggleTipoDano = (td: TipoDano) => {
    const current = formData.tipos_dano;
    const next = current.includes(td) ? current.filter((d) => d !== td) : [...current, td];
    setFormData({ ...formData, tipos_dano: next });
  };

  return (
    <div
      id="spell-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="spell-form-modal"
        className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {isEditing ? 'Editar Magia' : 'Cadastrar Nova Magia'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os campos respeitando os tipos estritos do PostgreSQL 16
              </p>
            </div>
          </div>

          <button
            id="btn-close-form-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div
              id="form-error-alert"
              className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              1. Identificação da Magia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Magia <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-nome-magia"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.nome_magia}
                  onChange={(e) => setFormData({ ...formData, nome_magia: e.target.value })}
                  placeholder="Ex: Bola de Fogo"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Círculo <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-circulo"
                  value={formData.circulo}
                  onChange={(e) => setFormData({ ...formData, circulo: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value={0}>0 - Truque</option>
                  <option value={1}>1º Círculo</option>
                  <option value={2}>2º Círculo</option>
                  <option value={3}>3º Círculo</option>
                  <option value={4}>4º Círculo</option>
                  <option value={5}>5º Círculo</option>
                  <option value={6}>6º Círculo</option>
                  <option value={7}>7º Círculo</option>
                  <option value={8}>8º Círculo</option>
                  <option value={9}>9º Círculo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Escola de Magia (Enum estrito) <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-escola"
                  value={formData.escola}
                  onChange={(e) => setFormData({ ...formData, escola: e.target.value as Escola })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {ESCOLAS.map((escola) => (
                    <option key={escola} value={escola}>
                      {escola}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Livro de Origem (Dinâmico do Banco) <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-livro"
                  value={formData.id_livro}
                  onChange={(e) => setFormData({ ...formData, id_livro: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {(metadata?.livros || []).map((livro) => (
                    <option key={livro.id_livro} value={livro.id_livro}>
                      {livro.nome_livro}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Conjuração & Alcance */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              2. Conjuração, Alcance e Duração
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tempo de Conjuração <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-tempo"
                  type="text"
                  required
                  value={formData.tempo}
                  onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                  placeholder="Ex: 1 ação, 1 ação bônus, 1 reação"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alcance <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-alcance"
                  type="text"
                  required
                  value={formData.alcance}
                  onChange={(e) => setFormData({ ...formData, alcance: e.target.value })}
                  placeholder="Ex: Pessoal, Toque, 18 metros"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Duração <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-duracao"
                  type="text"
                  required
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  placeholder="Ex: Instantânea, 1 minuto, Até 1 hora"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Forma de Área (Opcional)
                </label>
                <select
                  id="select-forma"
                  value={formData.forma || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      forma: e.target.value ? (e.target.value as Forma) : null,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Nenhuma (Alvo individual / Toque)</option>
                  {FORMAS.map((forma) => (
                    <option key={forma} value={forma}>
                      {forma}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tamanho da Área (metros)
                </label>
                <input
                  id="input-tamanho"
                  type="number"
                  step="0.5"
                  value={formData.tamanho ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tamanho: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Ex: 6 (raio), 18 (linha), 4.5 (cone)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Componentes Mágicos */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              3. Componentes
            </h3>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  id="checkbox-verbal"
                  type="checkbox"
                  checked={formData.componente_verbal}
                  onChange={(e) => setFormData({ ...formData, componente_verbal: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Verbal (V)</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  id="checkbox-somatico"
                  type="checkbox"
                  checked={formData.componente_somatico}
                  onChange={(e) => setFormData({ ...formData, componente_somatico: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Somático (S)</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <input
                  id="checkbox-material"
                  type="checkbox"
                  checked={formData.componente_material}
                  onChange={(e) => setFormData({ ...formData, componente_material: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span>Material (M)</span>
              </label>
            </div>

            {formData.componente_material && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descrição do Componente Material
                  </label>
                  <input
                    id="input-descricao-material"
                    type="text"
                    maxLength={100}
                    value={formData.descricao_material || ''}
                    onChange={(e) => setFormData({ ...formData, descricao_material: e.target.value })}
                    placeholder="Ex: Um rubi no valor de pelo menos 1.000 PO"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Valor do Material (em Peças de Ouro - PO)
                    </label>
                    <input
                      id="input-valor-material"
                      type="number"
                      step="0.01"
                      value={formData.valor_material ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          valor_material: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      placeholder="Ex: 50, 100, 1000"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-5">
                    <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                      <input
                        id="checkbox-consumo-material"
                        type="checkbox"
                        checked={Boolean(formData.consumo_material)}
                        onChange={(e) =>
                          setFormData({ ...formData, consumo_material: e.target.checked })
                        }
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
                      />
                      <span className="text-xs font-medium text-slate-300">
                        O material é consumido durante a conjuração?
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Regras Especiais & Combate */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              4. Regras Especiais & Combate
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  id="checkbox-concentracao"
                  type="checkbox"
                  checked={formData.concentracao}
                  onChange={(e) => setFormData({ ...formData, concentracao: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span className="text-xs font-semibold">Exige Concentração</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  id="checkbox-ataque"
                  type="checkbox"
                  checked={formData.ataque}
                  onChange={(e) => setFormData({ ...formData, ataque: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-400"
                />
                <span className="text-xs font-semibold">Jogada de Ataque</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  id="checkbox-salvaguarda"
                  type="checkbox"
                  checked={formData.salvaguarda}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salvaguarda: e.target.checked,
                      atributo_salvaguarda: e.target.checked ? formData.atributo_salvaguarda || 'DES' : null,
                    })
                  }
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <span className="text-xs font-semibold">Teste de Salvaguarda</span>
              </label>
            </div>

            {formData.salvaguarda && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Atributo de Salvaguarda (Enum estrito)
                </label>
                <select
                  id="select-atributo-salvaguarda"
                  value={formData.atributo_salvaguarda || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      atributo_salvaguarda: e.target.value ? (e.target.value as Atributo) : null,
                    })
                  }
                  className="w-full sm:w-1/2 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Selecione o atributo</option>
                  {ATRIBUTOS.map((attr) => (
                    <option key={attr} value={attr}>
                      {attr}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 5. Dados de Dano & Tipos de Dano */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              5. Dados e Tipos de Dano (Relacionamento N:M)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dado de Dano
                </label>
                <select
                  id="select-dado-dano"
                  value={formData.dado_dano || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dado_dano: e.target.value ? (e.target.value as Dado) : null,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Nenhum dado</option>
                  {DADOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantidade de Dados
                </label>
                <input
                  id="input-numero-dados"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.numero_dados_dano ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numero_dados_dano: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  placeholder="Ex: 8 (para 8d6)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bônus Fixo (+/-)
                </label>
                <input
                  id="input-bonus-dano"
                  type="number"
                  value={formData.bonus_dano ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bonus_dano: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  placeholder="Ex: 5"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tipos de Dano N:M */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Tipos de Dano Associados (Tabela N:M `magias_tipo_dano`)
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {TIPOS_DANO.map((td) => {
                  const selected = formData.tipos_dano.includes(td);
                  return (
                    <button
                      key={td}
                      type="button"
                      onClick={() => toggleTipoDano(td)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-orange-500 text-slate-950 border-orange-400 font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {td}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Conjuradores (Tabela N:M) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>6. Classes de Conjuradores (Tabela N:M `magias_conjuradores`)</span>
              <span className="text-[11px] font-normal text-slate-400">
                {formData.conjuradores_ids.length} selecionada(s)
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto">
              {(metadata?.conjuradores || []).map((c) => {
                const selected = formData.conjuradores_ids.includes(c.id_conjurador);
                return (
                  <label
                    key={c.id_conjurador}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      selected
                        ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleConjurador(c.id_conjurador)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-400"
                    />
                    <span className="truncate">{c.classe}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 7. Descrição Completa */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
              7. Descrição e Efeitos da Magia
            </h3>
            <textarea
              id="textarea-descricao"
              required
              rows={5}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva detalhadamente os efeitos, alvos, dano em níveis superiores, etc."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 8. Trava de Segurança */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Trava de Segurança Obrigatória (PIN 1998)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Conforme as regras de segurança, digite a senha "1998" para autorizar esta alteração no banco de dados.
            </p>
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="input-form-pin"
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1998"
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono tracking-widest text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-cancel-form"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-submit-form"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            {loading ? 'Salvando no Banco...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Magia'}
          </button>
        </div>

      </div>
    </div>
  );
};
