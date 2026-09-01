import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  KeyRound,
  FileText,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { ResultadoImportacaoCSV } from '../types';
import { importCSVAPI, getSessionPin, setSessionPin } from '../services/api';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resultado: ResultadoImportacaoCSV) => void;
}

const SAMPLE_CSV = `nome_magia,circulo,escola,tempo,alcance,forma,tamanho,componente_verbal,componente_somatico,componente_material,consumo_material,valor_material,descricao_material,duracao,concentracao,salvaguarda,atributo_salvaguarda,ataque,livro,descricao,dado_dano,numero_dados_dano,bonus_dano,conjuradores,tipos_dano
"Muralha de Fogo",4,Evocação,"1 ação","36 metros",linha,18,true,true,true,false,null,"Um pequeno pedaço de fósforo","Concentração, até 1 minuto",true,true,DES,false,"Livro do Jogador (PHB)","Você cria uma muralha de fogo em uma superfície sólida dentro do alcance.",d8,5,0,"Mago; Bruxo; Feiticeiro; Druida","fogo"
"Raio Solar",6,Evocação,"1 ação","18 metros",linha,18,true,true,true,false,null,"Uma lente de aumento","Concentração, até 1 minuto",true,true,CON,false,"Livro do Jogador (PHB)","Um feixe de luz brilhante de 1,5 metro de largura e 18 metros de comprimento irrompe de sua mão.",d6,6,0,"Clérigo; Druida; Mago; Feiticeiro","radiante"
"Palavra de Poder: Curar",9,Evocação,"1 ação","Toque",null,null,true,true,false,null,null,null,"Instantânea",false,false,null,false,"Livro do Jogador (PHB)","Uma onda de energia curativa flui de você para uma criatura que você tocar.",d12,4,0,"Bardo; Clérigo",""
"Garras de Chamas",0,Evocação,"1 ação","Pessoal",cone,4.5,true,true,false,null,null,null,"Instantânea",false,true,DES,false,"Livro do Jogador (PHB)","Um cone de chamas irrompe da ponta dos seus dedos.",d6,1,0,"Feiticeiro; Mago; Artífice","fogo"`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [pin, setPin] = useState(getSessionPin());
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultadoImportacaoCSV | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_magias.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'file' && !file) {
      setError('Por favor, selecione um arquivo CSV.');
      return;
    }
    if (mode === 'text' && !csvText.trim()) {
      setError('Por favor, cole o texto do CSV.');
      return;
    }
    if (!pin.trim()) {
      setError('A senha de segurança é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importCSVAPI(
        mode === 'file' ? file : null,
        mode === 'text' ? csvText : null,
        pin.trim()
      );
      setResult(res);
      setSessionPin(pin.trim());
      if (res.importadas > 0) {
        onSuccess(res);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar importação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="csv-import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="csv-import-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Importação em Massa (CSV)</h2>
              <p className="text-xs text-slate-400">
                Importe dezenas de magias em lote com mapeamento automático de classes e danos N:M
              </p>
            </div>
          </div>

          <button
            id="btn-close-csv-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tabs Mode */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                id="tab-csv-file"
                onClick={() => setMode('file')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  mode === 'file'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Arquivo CSV
              </button>
              <button
                type="button"
                id="tab-csv-text"
                onClick={() => setMode('text')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  mode === 'text'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Colar Texto CSV
              </button>
            </div>

            <button
              type="button"
              id="btn-download-sample-csv"
              onClick={handleDownloadSample}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium underline underline-offset-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Modelo CSV Exato
            </button>
          </div>

          {error && (
            <div
              id="csv-error-alert"
              className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area */}
          {mode === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                file
                  ? 'border-emerald-500/60 bg-emerald-950/10'
                  : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/60 hover:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                id="input-file-csv"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileSpreadsheet
                className={`w-10 h-10 mx-auto mb-3 ${
                  file ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              {file ? (
                <div>
                  <span className="text-sm font-bold text-emerald-300 block">{file.name}</span>
                  <span className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB — Clique para trocar de arquivo
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-sm font-semibold text-slate-200 block mb-1">
                    Arraste seu arquivo .CSV aqui ou clique para selecionar
                  </span>
                  <span className="text-xs text-slate-400">
                    Formato UTF-8 delimitado por vírgula (,) ou ponto-e-vírgula (;)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cole o conteúdo bruto do CSV com cabeçalhos:
              </label>
              <textarea
                id="textarea-csv-paste"
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={SAMPLE_CSV}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          )}

          {/* Explicação de Preenchimento das Associações N:M */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <HelpCircle className="w-3.5 h-3.5" /> Como preencher as associações no CSV:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-200">conjuradores:</strong> Liste as classes separadas por ponto-e-vírgula (ex:{' '}
                <code className="text-amber-300">Mago; Feiticeiro; Bruxo</code>). Classes não existentes serão criadas automaticamente no banco.
              </li>
              <li>
                <strong className="text-slate-200">tipos_dano:</strong> Liste os danos do enum separados por ponto-e-vírgula (ex:{' '}
                <code className="text-amber-300">fogo; elétrico</code>).
              </li>
              <li>
                <strong className="text-slate-200">livro:</strong> Informe o nome do livro (ex:{' '}
                <code className="text-amber-300">Livro do Jogador (PHB)</code>).
              </li>
              <li>
                <strong className="text-slate-200">booleanos:</strong> Aceita{' '}
                <code className="text-amber-300">true/false</code>, <code className="text-amber-300">sim/nao</code>,{' '}
                <code className="text-amber-300">1/0</code>.
              </li>
            </ul>
          </div>

          {/* Resultado de Importação */}
          {result && (
            <div
              id="csv-import-result"
              className={`p-4 rounded-xl border space-y-3 ${
                result.sucesso
                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
                  : 'bg-amber-950/50 border-amber-700/60 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.sucesso ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <span>
                  {result.importadas} de {result.totalLinhas} magias importadas com sucesso!
                </span>
              </div>

              {(result.novosConjuradoresCriados.length > 0 || result.novosLivrosCriados.length > 0) && (
                <div className="text-xs space-y-1 text-slate-300 border-t border-slate-800/80 pt-2">
                  {result.novosLivrosCriados.length > 0 && (
                    <p>
                      <strong>Novos Livros Registrados:</strong>{' '}
                      {result.novosLivrosCriados.join(', ')}
                    </p>
                  )}
                  {result.novosConjuradoresCriados.length > 0 && (
                    <p>
                      <strong>Novas Classes de Conjuradores Registradas:</strong>{' '}
                      {result.novosConjuradoresCriados.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {result.erros && result.erros.length > 0 && (
                <div className="text-xs space-y-1 bg-rose-950/60 border border-rose-800/70 p-3 rounded-lg text-rose-200">
                  <span className="font-bold block">Erros encontrados ({result.erros.length}):</span>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {result.erros.map((err, i) => (
                      <p key={i}>
                        • Linha {err.linha}: {err.magia ? `"${err.magia}" - ` : ''}
                        {err.mensagem}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trava de Segurança */}
          <div className="p-4 rounded bg-amber-950/20 border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Trava de Segurança Obrigatória</span>
            </div>
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="input-csv-pin"
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded text-sm font-mono tracking-widest text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-cancel-csv"
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            id="btn-execute-csv-import"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            {loading ? 'Processando Importação...' : 'Importar Magias no Banco'}
          </button>
        </div>

      </div>
    </div>
  );
};
