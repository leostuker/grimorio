import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  Check,
  CheckCircle2,
  Loader2,
  FolderArchive,
  Layers,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { MagiaCompleta } from '../types';
import { SpellPrintCard, PrintTheme, CardSize } from './SpellPrintCard';

interface PrintAndExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpells: MagiaCompleta[];
  onDeselectSpell: (id: number) => void;
  onClearSelection: () => void;
}

export const PrintAndExportModal: React.FC<PrintAndExportModalProps> = ({
  isOpen,
  onClose,
  selectedSpells,
  onDeselectSpell,
  onClearSelection,
}) => {
  const [activeTab, setActiveTab] = useState<'print' | 'images'>('print');
  const [printTheme, setPrintTheme] = useState<PrintTheme>('parchment');
  const [cardLayout, setCardLayout] = useState<CardSize>('card_standard');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; spellName: string } | null>(null);
  const [downloadingSingleId, setDownloadingSingleId] = useState<number | null>(null);

  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Disparar impressão do navegador
  const handleTriggerPrint = () => {
    window.print();
  };

  // Download de uma imagem individual em PNG
  const handleDownloadSingleImage = async (magia: MagiaCompleta) => {
    try {
      setDownloadingSingleId(magia.id_magia);
      const elementId = `export-card-target-${magia.id_magia}`;
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento do card não encontrado.');
      }

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2, // Dobro de resolução para ficar nítido
        cacheBust: true,
      });

      const safeName = magia.nome_magia
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_');

      const link = document.createElement('a');
      link.download = `magia_${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      alert('Não foi possível gerar a imagem deste card. Tente novamente.');
    } finally {
      setDownloadingSingleId(null);
    }
  };

  // Download de todos os cards em um arquivo ZIP com PNGs
  const handleDownloadAllAsZip = async () => {
    if (selectedSpells.length === 0) return;
    try {
      setIsExportingZip(true);
      const zip = new JSZip();
      const folder = zip.folder('cartas_de_magia_dnd5e');

      for (let i = 0; i < selectedSpells.length; i++) {
        const magia = selectedSpells[i];
        setExportProgress({
          current: i + 1,
          total: selectedSpells.length,
          spellName: magia.nome_magia,
        });

        const elementId = `export-card-target-${magia.id_magia}`;
        const element = document.getElementById(elementId);
        if (element) {
          const dataUrl = await toPng(element, {
            quality: 0.98,
            pixelRatio: 2,
            cacheBust: true,
          });

          // Extrai os dados base64
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          const safeName = `${String(i + 1).padStart(2, '0')}_${magia.nome_magia
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_')}`;

          folder?.file(`${safeName}.png`, base64Data, { base64: true });
        }
      }

      // Gera o zip final
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `grimorio_cards_magias_5e_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar arquivo ZIP:', err);
      alert('Houve um erro ao processar o arquivo ZIP com as imagens.');
    } finally {
      setIsExportingZip(false);
      setExportProgress(null);
    }
  };

  return (
    <div
      id="print-export-modal"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Header Controls (Oculto na impressão) */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Modo de Impressão & Exportação</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-xs font-semibold">
                {selectedSpells.length} {selectedSpells.length === 1 ? 'magia' : 'magias'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Prepare folhas para impressão A4 ou gere imagens individuais de cada card.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              id="tab-print-sheet"
              type="button"
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'print'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Folhas para Imprimir (A4)</span>
            </button>
            <button
              id="tab-export-images"
              type="button"
              onClick={() => setActiveTab('images')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'images'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gerar Imagens (PNG / ZIP)</span>
            </button>
          </div>

          <button
            id="btn-close-print-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-2"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toolbar de Opções de Customização (Oculto na impressão) */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        
        {/* Opções de Tema e Layout */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Seletor de Tema Visual */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Tema:</span>
            <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setPrintTheme('parchment')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  printTheme === 'parchment'
                    ? 'bg-[#ede3cc] text-[#4a1c1a] shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Pergaminho clássico D&D"
              >
                Pergaminho RPG
              </button>
              <button
                type="button"
                onClick={() => setPrintTheme('eco_white')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  printTheme === 'eco_white'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Econômico em tinta (fundo branco puro)"
              >
                Econômico (P&B)
              </button>
              <button
                type="button"
                onClick={() => setPrintTheme('dark_arcane')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  printTheme === 'dark_arcane'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Visual noturno / arcano"
              >
                Arcano Noturno
              </button>
            </div>
          </div>

          {/* Formato de Cartão / Layout */}
          {activeTab === 'print' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Formato:</span>
              <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setCardLayout('card_standard')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                    cardLayout === 'card_standard'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cartas (Padrão)
                </button>
                <button
                  type="button"
                  onClick={() => setCardLayout('card_medium')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                    cardLayout === 'card_medium'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cartões Médios
                </button>
                <button
                  type="button"
                  onClick={() => setCardLayout('grimoire_sheet')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                    cardLayout === 'grimoire_sheet'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Livro / Grimório
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Botões de Ação Principais */}
        <div className="flex items-center gap-2 ml-auto">
          {activeTab === 'print' ? (
            <button
              id="btn-print-now"
              type="button"
              onClick={handleTriggerPrint}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
          ) : (
            <button
              id="btn-download-all-zip"
              type="button"
              disabled={isExportingZip || selectedSpells.length === 0}
              onClick={handleDownloadAllAsZip}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isExportingZip ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Gerando ZIP ({exportProgress?.current}/{exportProgress?.total})...
                  </span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4" />
                  <span>Baixar Todas as Imagens (.ZIP)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* Progress Bar para exportação em lote */}
      {isExportingZip && exportProgress && (
        <div className="bg-indigo-950 border-b border-indigo-800 px-4 py-2 print:hidden flex items-center gap-3 text-xs text-indigo-200 animate-in fade-in">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] mb-1">
              <span>Renderizando card: <strong>{exportProgress.spellName}</strong></span>
              <span>{Math.round((exportProgress.current / exportProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 transition-all duration-150"
                style={{
                  width: `${(exportProgress.current / exportProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area com Scroll */}
      <div
        ref={printContainerRef}
        id="print-export-content-body"
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 print:bg-white print:p-0 print:overflow-visible"
      >
        {selectedSpells.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
            <Sparkles className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-semibold">Nenhuma magia selecionada.</p>
            <p className="text-xs text-slate-500 mt-1">
              Feche este modal e selecione as magias que deseja imprimir ou exportar.
            </p>
          </div>
        ) : activeTab === 'print' ? (
          /* Visualização de Impressão (Fichas organizadas para folha A4) */
          <div className="max-w-5xl mx-auto">
            
            <div className="mb-4 text-xs text-slate-400 print:hidden flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span>
                Prévia da diagramação de impressão ({selectedSpells.length} {selectedSpells.length === 1 ? 'cartão' : 'cartões'}):
              </span>
              <span className="text-[11px] text-slate-500">
                Dica: Escolha "Salvar como PDF" na tela de impressão.
              </span>
            </div>

            {/* Grid de Impressão */}
            <div
              className={`flex flex-wrap gap-4 justify-center print:block print:w-full`}
            >
              {selectedSpells.map((magia) => (
                <div
                  key={magia.id_magia}
                  className="relative group print:inline-block print:m-2 print:align-top"
                >
                  <SpellPrintCard
                    magia={magia}
                    theme={printTheme}
                    cardSize={cardLayout}
                  />

                  {/* Botão de remover individual da seleção na prévia */}
                  <button
                    type="button"
                    onClick={() => onDeselectSpell(magia.id_magia)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center justify-center print:hidden opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover desta folha"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Visualização de Galeria para Exportar Imagens Individuais (PNG) */
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span>
                Cards prontos para exportação em alta resolução (2x PNG):
              </span>
              <span className="text-[11px] text-indigo-400">
                Você pode baixar cada um individualmente ou todos de uma vez via ZIP.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {selectedSpells.map((magia) => (
                <div
                  key={magia.id_magia}
                  className="flex flex-col items-center gap-2.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800"
                >
                  {/* Container do Card para renderização de imagem */}
                  <div
                    id={`export-card-target-${magia.id_magia}`}
                    className="overflow-hidden rounded-lg shadow-xl"
                  >
                    <SpellPrintCard
                      magia={magia}
                      theme={printTheme}
                      cardSize="card_standard"
                    />
                  </div>

                  {/* Controles do Card Individual */}
                  <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                    <span className="font-bold text-slate-300 truncate max-w-[170px]" title={magia.nome_magia}>
                      {magia.nome_magia}
                    </span>

                    <button
                      type="button"
                      disabled={downloadingSingleId === magia.id_magia}
                      onClick={() => handleDownloadSingleImage(magia)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                      title="Baixar imagem PNG"
                    >
                      {downloadingSingleId === magia.id_magia ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span>PNG</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer com contagem e desmarcar todos (Oculto na impressão) */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 shrink-0 flex items-center justify-between text-xs text-slate-400 print:hidden">
        <div className="flex items-center gap-2">
          <span>{selectedSpells.length} {selectedSpells.length === 1 ? 'magia selecionada' : 'magias selecionadas'}</span>
          {selectedSpells.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-rose-400 hover:text-rose-300 hover:underline ml-2"
            >
              Desmarcar todas
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
        >
          Concluir / Fechar
        </button>
      </div>
    </div>
  );
};
