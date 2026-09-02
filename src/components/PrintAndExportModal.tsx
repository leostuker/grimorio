import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  Loader2,
  FolderArchive,
  Maximize2,
  Minimize2,
  Sliders,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { MagiaCompleta } from '../types';
import { SpellPrintCard, PrintTheme } from './SpellPrintCard';

export type LayoutMode = 'auto' | 'standard_2col' | 'all_wide';

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
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('auto');
  
  // Customizações manuais de largura por card (id_magia -> boolean)
  const [manualWideMap, setManualWideMap] = useState<Record<number, boolean>>({});

  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; spellName: string } | null>(null);
  const [downloadingSingleId, setDownloadingSingleId] = useState<number | null>(null);

  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Determinar se um card é largo (ocupa 2 colunas / largura lateral de 2 cards)
  const isSpellWide = (magia: MagiaCompleta): boolean => {
    // Se o usuário alternou manualmente este card, honrar sua escolha
    if (manualWideMap[magia.id_magia] !== undefined) {
      return manualWideMap[magia.id_magia];
    }

    // Modo forçado
    if (layoutMode === 'all_wide') return true;
    if (layoutMode === 'standard_2col') return false;

    // Modo Automático: detecta se a descrição é longa ou possui muitas quebras/tabelas
    const desc = magia.descricao || '';
    const lineCount = desc.split('\n').length;
    return desc.length > 360 || lineCount > 5;
  };

  // Alternar largura de um card individual
  const toggleCardWide = (id: number, currentIsWide: boolean) => {
    setManualWideMap((prev) => ({
      ...prev,
      [id]: !currentIsWide,
    }));
  };

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
        pixelRatio: 2, // Resolução nítida 2x
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
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200"
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
              Folha formatada para 4 cards por página A4 com ajuste dinâmico para magias com textos longos.
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
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        
        {/* Opções de Tema e Layout */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Seletor de Tema Visual */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Tema:</span>
            <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setPrintTheme('parchment')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
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
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
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
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
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

          {/* Formato de Cartão / Layout Dinâmico */}
          {activeTab === 'print' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Diagramação:</span>
              <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setLayoutMode('auto')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                    layoutMode === 'auto'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="4 cards por folha A4 com expansão automática para textos longos"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Dinâmica (4 por folha / 2 se longo)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('standard_2col')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    layoutMode === 'standard_2col'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Forçar todos os cards em tamanho padrão (4 por folha)"
                >
                  Todos Padrão (2x2)
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('all_wide')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    layoutMode === 'all_wide'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Forçar todos os cards em largura total (estilo grimório)"
                >
                  Todos Largos (1 por linha)
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
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 print:bg-white print:p-0 print:m-0 print:overflow-visible"
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
          <div className="max-w-4xl mx-auto print:max-w-none print:w-full print:m-0">
            
            <div className="mb-3 text-xs text-slate-400 print:hidden flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-medium text-slate-300">
                Prévia da folha de impressão ({selectedSpells.length} {selectedSpells.length === 1 ? 'cartão' : 'cartões'}):
              </span>
              <span className="text-[11px] text-indigo-400">
                Cards com textos longos expandem para a largura dupla automaticamente. Você também pode alternar individualmente nos botões de cada card.
              </span>
            </div>

            {/* Grid de Impressão de 2 Colunas para A4 */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-4 print:w-full print:m-0"
            >
              {selectedSpells.map((magia) => {
                const wide = isSpellWide(magia);
                return (
                  <div
                    key={magia.id_magia}
                    className={`relative group print-card-break print:break-inside-avoid print:page-break-inside-avoid ${
                      wide
                        ? 'col-span-1 md:col-span-2 print:col-span-2'
                        : 'col-span-1'
                    }`}
                  >
                    {/* Barra de controle no topo do card (Visível apenas na tela, oculta na impressão) */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <button
                        type="button"
                        onClick={() => toggleCardWide(magia.id_magia, wide)}
                        className="px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-[10px] font-semibold border border-slate-700 shadow-md flex items-center gap-1 backdrop-blur-xs"
                        title={wide ? 'Reduzir para 1 coluna' : 'Expandir para 2 colunas'}
                      >
                        {wide ? (
                          <>
                            <Minimize2 className="w-3 h-3 text-amber-400" />
                            <span>1 Coluna</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-3 h-3 text-indigo-400" />
                            <span>Largo (2x)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeselectSpell(magia.id_magia)}
                        className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center justify-center transition-colors"
                        title="Remover desta folha"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <SpellPrintCard
                      magia={magia}
                      theme={printTheme}
                      isWide={wide}
                      className="w-full h-full"
                    />
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Visualização de Galeria para Exportar Imagens Individuais (PNG) */
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span>
                Cards prontos para exportação em alta resolução (PNG com Markdown renderizado):
              </span>
              <span className="text-[11px] text-indigo-400">
                Você pode baixar cada um individualmente ou todos de uma vez via ZIP.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {selectedSpells.map((magia) => {
                const wide = isSpellWide(magia);
                return (
                  <div
                    key={magia.id_magia}
                    className={`flex flex-col items-center gap-2.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 ${
                      wide ? 'sm:col-span-2 lg:col-span-2 w-full max-w-[680px]' : 'w-full max-w-[360px]'
                    }`}
                  >
                    {/* Container do Card para renderização de imagem */}
                    <div
                      id={`export-card-target-${magia.id_magia}`}
                      className="overflow-hidden rounded-lg shadow-xl w-full"
                    >
                      <SpellPrintCard
                        magia={magia}
                        theme={printTheme}
                        isWide={wide}
                        className="w-full"
                      />
                    </div>

                    {/* Controles do Card Individual */}
                    <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-300 truncate" title={magia.nome_magia}>
                          {magia.nome_magia}
                        </span>
                        {wide && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] shrink-0 font-medium">
                            Card Largo
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={downloadingSingleId === magia.id_magia}
                        onClick={() => handleDownloadSingleImage(magia)}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 shrink-0"
                        title="Baixar imagem PNG"
                      >
                        {downloadingSingleId === magia.id_magia ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span>Baixar PNG</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
