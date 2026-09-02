import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  Printer,
  Download,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  CheckSquare,
  Square,
  FileImage,
  Sun,
  Moon,
  Scroll,
  Scissors,
  HelpCircle,
  Loader2,
  FileArchive,
  RefreshCw,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { MagiaCompleta } from '../types';
import {
  PrintableSpellCard,
  CardFormat,
  CardTheme,
} from './PrintableSpellCard';
import { GrimoireIcon } from './GrimoireIcon';

interface SpellSelectionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpells: MagiaCompleta[];
  onRemoveSpell: (id_magia: number) => void;
  onClearAll: () => void;
}

export const SpellSelectionStudioModal: React.FC<SpellSelectionStudioModalProps> = ({
  isOpen,
  onClose,
  selectedSpells,
  onRemoveSpell,
  onClearAll,
}) => {
  // Configurações Globais do Estúdio (padrão Claro para máxima legibilidade e economia de tinta)
  const [theme, setTheme] = useState<CardTheme>('clean');
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85); // Escala de visualização no preview
  
  // Mapeamento individual de tamanho por magia: { [id_magia]: 'standard' | 'wide' }
  const [customFormats, setCustomFormats] = useState<Record<number, CardFormat>>({});
  
  // Estado de exportação
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; spellName: string } | null>(null);
  const [exportingSingleId, setExportingSingleId] = useState<number | null>(null);

  // Refs de cada carta para exportação de PNG
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Helper para decidir o formato da carta (Padrão vs Amplo)
  const getFormatForSpell = useCallback(
    (magia: MagiaCompleta): CardFormat => {
      if (customFormats[magia.id_magia]) {
        return customFormats[magia.id_magia];
      }
      // Auto-detecção inteligente para textos longos (> 380 caracteres ou com múltiplas listas)
      if (magia.descricao && magia.descricao.length > 380) {
        return 'wide'; // 178mm x 146mm
      }
      return 'standard'; // 89mm x 146mm
    },
    [customFormats]
  );

  const toggleSpellFormat = (id_magia: number) => {
    const spell = selectedSpells.find((s) => s.id_magia === id_magia);
    if (!spell) return;
    const current = getFormatForSpell(spell);
    const next: CardFormat = current === 'standard' ? 'wide' : 'standard';
    setCustomFormats((prev) => ({ ...prev, [id_magia]: next }));
  };

  const setAllFormats = (format: CardFormat | 'auto') => {
    if (format === 'auto') {
      setCustomFormats({});
    } else {
      const all: Record<number, CardFormat> = {};
      selectedSpells.forEach((s) => {
        all[s.id_magia] = format;
      });
      setCustomFormats(all);
    }
  };

  // Disparar Impressão Nativa
  const handlePrint = () => {
    window.print();
  };

  // Exportar Carta Individual como PNG
  const handleExportSinglePng = async (magia: MagiaCompleta) => {
    const el = cardRefs.current[magia.id_magia];
    if (!el) return;

    setExportingSingleId(magia.id_magia);
    try {
      // Pequeno delay para garantir reflow limpo
      await new Promise((resolve) => setTimeout(resolve, 100));

      const format = getFormatForSpell(magia);
      const dimensionLabel = format === 'wide' ? '178x146mm' : '89x146mm';
      
      const dataUrl = await toPng(el, {
        pixelRatio: 2.5, // Alta resolução 300+ DPI para impressão gráfica
        cacheBust: true,
        style: {
          transform: 'none',
          outline: 'none',
        },
      });

      const link = document.createElement('a');
      const safeName = magia.nome_magia
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      link.download = `Carta_${safeName}_${dimensionLabel}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao exportar PNG:', err);
    } finally {
      setExportingSingleId(null);
    }
  };

  // Exportar Todas as Cartas como Pacote ZIP de PNGs
  const handleExportAllZip = async () => {
    if (selectedSpells.length === 0) return;

    setIsExportingZip(true);
    setExportProgress({ current: 0, total: selectedSpells.length, spellName: '' });

    try {
      const zip = new JSZip();
      const folder = zip.folder('cartas_de_magia_grimorio');

      for (let i = 0; i < selectedSpells.length; i++) {
        const magia = selectedSpells[i];
        setExportProgress({
          current: i + 1,
          total: selectedSpells.length,
          spellName: magia.nome_magia,
        });

        const el = cardRefs.current[magia.id_magia];
        if (el) {
          // Pequena pausa para garantir renderização
          await new Promise((resolve) => setTimeout(resolve, 80));

          const format = getFormatForSpell(magia);
          const dim = format === 'wide' ? '178x146mm' : '89x146mm';
          const safeName = `${String(i + 1).padStart(2, '0')}_${magia.nome_magia
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')}_${dim}.png`;

          const dataUrl = await toPng(el, {
            pixelRatio: 2.5,
            cacheBust: true,
            style: {
              transform: 'none',
              outline: 'none',
            },
          });

          // Converte Base64 para binário
          const base64Data = dataUrl.split(',')[1];
          folder?.file(safeName, base64Data, { base64: true });
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Grimorio_Cartas_de_Magias_${selectedSpells.length}_cartas.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar ZIP de cartas:', err);
    } finally {
      setIsExportingZip(false);
      setExportProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="spell-selection-studio-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
    >
      <div
        id="spell-selection-studio-modal"
        className="w-full max-w-[1500px] h-[95vh] bg-slate-950 border border-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* MODAL TOP HEADER */}
        <div className="studio-header no-print p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-400">
              <GrimoireIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Estúdio de Cartas & Impressão
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {selectedSpells.length} {selectedSpells.length === 1 ? 'carta' : 'cartas'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Dimensões de alta precisão: Padrão (89×146mm) e Ampla (178×146mm) com formatação rica em Markdown.
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2">
            {/* Export All PNG (ZIP) */}
            <button
              id="btn-studio-export-zip"
              type="button"
              onClick={handleExportAllZip}
              disabled={selectedSpells.length === 0 || isExportingZip}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Baixar todas as cartas selecionadas em um arquivo ZIP com imagens PNG em alta resolução"
            >
              {isExportingZip ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <FileArchive className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden sm:inline">Exportar Todas (ZIP)</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            {/* Print Native Button */}
            <button
              id="btn-studio-print-native"
              type="button"
              onClick={handlePrint}
              disabled={selectedSpells.length === 0}
              className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/40 transition-all"
              title="Abrir diálogo de impressão do navegador (otimizado para folha A4 / Carta)"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir Cartas</span>
            </button>

            {/* Close Studio */}
            <button
              id="btn-close-studio-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
              title="Fechar estúdio de cartas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="studio-toolbar no-print p-2.5 sm:p-3 bg-slate-900/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Left: Themes & Formats */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Theme Selector */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Tema:</span>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tema Sombrio de Grimório Mágico"
              >
                <Moon className="w-3 h-3" />
                <span>Grimório</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('parchment')}
                className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  theme === 'parchment'
                    ? 'bg-amber-700 text-amber-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tema de Pergaminho Arcano"
              >
                <Scroll className="w-3 h-3" />
                <span>Pergaminho</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('clean')}
                className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                  theme === 'clean'
                    ? 'bg-slate-200 text-slate-900 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tema Claro / Econômico para poupar tinta da impressora"
              >
                <Sun className="w-3 h-3" />
                <span>Econômico</span>
              </button>
            </div>

            {/* Global Format Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Dimensões:</span>
              <button
                type="button"
                onClick={() => setAllFormats('auto')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  Object.keys(customFormats).length === 0
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Auto-seleciona 178mm para descrições longas e 89mm para as demais"
              >
                Auto Inteligente
              </button>
              <button
                type="button"
                onClick={() => setAllFormats('standard')}
                className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                title="Definir todas para o tamanho padrão de 89mm x 146mm"
              >
                Todas 89mm
              </button>
              <button
                type="button"
                onClick={() => setAllFormats('wide')}
                className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                title="Definir todas para o tamanho amplo/longo de 178mm x 146mm"
              >
                Todas 178mm
              </button>
            </div>

            {/* Cut Guides Toggle */}
            <button
              type="button"
              onClick={() => setShowCutGuides((prev) => !prev)}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                showCutGuides
                  ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Exibir ou ocultar linhas pontilhadas de guia de corte"
            >
              <Scissors className="w-3 h-3 text-indigo-400" />
              <span>Guias de Corte</span>
            </button>

          </div>

          {/* Right: Zoom & Deck Manage */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Diminuir zoom do preview"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="font-mono text-slate-300 w-9 text-center font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="p-1 text-slate-400 hover:text-slate-200"
                title="Aumentar zoom do preview"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-1.5 py-0.5 ml-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                title="Tamanho real (100%)"
              >
                100%
              </button>
            </div>

            {/* Clear all cards */}
            <button
              id="btn-studio-clear-deck"
              type="button"
              onClick={onClearAll}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Limpar todas as cartas do deck selecionado"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar Seleção</span>
            </button>
          </div>
        </div>

        {/* PROGRESS BAR FOR ZIP EXPORT */}
        {isExportingZip && exportProgress && (
          <div className="p-3 bg-indigo-950/80 border-b border-indigo-500/30 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-150">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <p className="text-xs font-bold text-slate-100">
                  Gerando PNGs em alta resolução: {exportProgress.current} de {exportProgress.total}
                </p>
                <p className="text-[11px] text-indigo-300 truncate max-w-sm">
                  Renderizando &ldquo;{exportProgress.spellName}&rdquo;...
                </p>
              </div>
            </div>
            <div className="w-48 bg-slate-900 rounded-full h-2 overflow-hidden border border-indigo-700/50">
              <div
                className="bg-indigo-500 h-full transition-all duration-150"
                style={{
                  width: `${(exportProgress.current / exportProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* MAIN BODY: PREVIEW OF CARDS */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto bg-slate-900/40">
          {selectedSpells.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center">
                <GrimoireIcon className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">
                Nenhuma carta selecionada
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Volte para a listagem ou grade do grimório e marque as magias que deseja selecionar para compor o seu deck de cartas.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/30"
              >
                Explorar Grimório e Selecionar
              </button>
            </div>
          ) : (
            <div
              id="printable-deck-area"
              className="flex flex-wrap items-start justify-center gap-6 sm:gap-8 pb-12"
            >
              {selectedSpells.map((magia) => {
                const format = getFormatForSpell(magia);
                const isWide = format === 'wide';
                const isSingleExporting = exportingSingleId === magia.id_magia;

                return (
                  <div
                    key={magia.id_magia}
                    className="printable-card-wrapper flex flex-col items-center gap-2 group/card"
                    data-wide={isWide ? 'true' : 'false'}
                  >
                    {/* Top Card Controls (Switch format, export single png, remove) */}
                    <div className="card-action-bar no-print w-full flex items-center justify-between gap-1.5 px-1 py-1 bg-slate-900/90 rounded border border-slate-800 text-[11px] text-slate-300">
                      {/* Format toggle pill */}
                      <button
                        type="button"
                        onClick={() => toggleSpellFormat(magia.id_magia)}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border transition-all ${
                          isWide
                            ? 'bg-violet-950/80 border-violet-500/50 text-violet-300'
                            : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                        }`}
                        title="Alternar entre formato padrão (89x146mm) e amplo (178x146mm)"
                      >
                        {isWide ? 'Ampla (178×146mm)' : 'Padrão (89×146mm)'}
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Download Single PNG */}
                        <button
                          type="button"
                          onClick={() => handleExportSinglePng(magia)}
                          disabled={isSingleExporting}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 transition-colors"
                          title="Baixar imagem PNG desta carta"
                        >
                          {isSingleExporting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          ) : (
                            <FileImage className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Remove from selection */}
                        <button
                          type="button"
                          onClick={() => onRemoveSpell(magia.id_magia)}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-950/70 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Remover carta do deck"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Scaled Card Frame Preview */}
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        marginBottom: `${(1 - zoomLevel) * -146 * 3.78}px`, // Compensar espaço vertical do CSS transform
                      }}
                      className="card-zoom-container transition-transform duration-100"
                    >
                      <PrintableSpellCard
                        ref={(el) => {
                          if (el) {
                            cardRefs.current[magia.id_magia] = el;
                          } else {
                            delete cardRefs.current[magia.id_magia];
                          }
                        }}
                        magia={magia}
                        format={format}
                        theme={theme}
                        showCutGuides={showCutGuides}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER INFO */}
        <div className="studio-footer no-print p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Resumo de Impressão:</span>
            <span>
              {selectedSpells.filter((s) => getFormatForSpell(s) === 'standard').length} cartas Padrão (89×146mm)
            </span>
            <span>•</span>
            <span>
              {selectedSpells.filter((s) => getFormatForSpell(s) === 'wide').length} cartas Longas/Amplas (178×146mm)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              Dica: Na janela de impressão, ative &ldquo;Gráficos de segundo plano&rdquo; para cores perfeitas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
