import React from 'react';

interface ClassPictogramProps {
  classe: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Pictogramas 2D minimalistas em vetor estilo RPG
 * Linhas definidas, design plano, branco puro sobre fundo escuro sólido.
 */
export const ClassPictogram: React.FC<ClassPictogramProps> = ({
  classe,
  className = '',
  size = 'sm',
}) => {
  const normalized = (classe || '').trim().toLowerCase();

  const sizeClasses = {
    xs: 'w-4 h-4 p-0.5',
    sm: 'w-5 h-5 p-1',
    md: 'w-6 h-6 p-1',
    lg: 'w-8 h-8 p-1.5',
  }[size];

  // Identificação do objeto de classe correspondente
  const renderSvg = () => {
    // 1. Mago -> Grimório Arcano Aberto / Livro de Magia
    if (normalized.includes('mago') || normalized.includes('wizard')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2.2" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2.2" />
          <path d="M12 6l1.2 2.5L16 9l-2 2 .5 2.8-2.5-1.3L9.5 13.8 10 11 8 9l2.8-.5L12 6z" fill="currentColor" stroke="none" />
        </svg>
      );
    }

    // 2. Bruxo -> Olho Oculto dos Patronos / Olho Místico Eldritch
    if (normalized.includes('bruxo') || normalized.includes('warlock')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" strokeWidth="2.2" />
          <circle cx="12" cy="12" r="3.5" strokeWidth="2.2" />
          <polygon points="12,10 13,12 12,14 11,12" fill="currentColor" />
          <path d="M12 2v3M12 19v3M4 5l2.5 2.5M17.5 16.5L20 19" strokeWidth="2" />
        </svg>
      );
    }

    // 3. Feiticeiro -> Chama Dracônica / Centelha de Energia Bruta
    if (normalized.includes('feiticeiro') || normalized.includes('sorcerer')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" strokeWidth="2.2" fill="currentColor" fillOpacity="0.3" />
          <path d="M12 18a3 3 0 0 0 3-3c0-1-.5-1.8-1.5-2.5-.5.8-1 1-1.5 1.5A2 2 0 0 0 10 16a2 2 0 0 0 2 2z" fill="currentColor" />
        </svg>
      );
    }

    // 4. Clérigo -> Símbolo Sagrado Radiante / Sol Divino
    if (normalized.includes('clérigo') || normalized.includes('clerigo') || normalized.includes('cleric')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <circle cx="12" cy="12" r="4.5" strokeWidth="2.2" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="2.4" />
          <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="2" />
          <path d="M12 9v6M9 12h6" strokeWidth="2.4" />
        </svg>
      );
    }

    // 5. Druida -> Folha de Carvalho Sagrada com Lua Crescente
    if (normalized.includes('druida') || normalized.includes('druid')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 19 9.5 19 15a7 7 0 0 1-8 5z" strokeWidth="2.2" />
          <path d="M12 21c-3-2.5-7-7-4-13 4 1 8 5 4 13z" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
          <path d="M10 15c1.5-1.5 3-2 5-2" strokeWidth="2" />
          <path d="M7 21l3-6" strokeWidth="2.2" />
        </svg>
      );
    }

    // 6. Bardo -> Alaúde Medieval com Notas Musicais
    if (normalized.includes('bardo') || normalized.includes('bard')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M6 13a6 6 0 0 0 6 6c3.3 0 6-2.7 6-6 0-2.5-1.5-4.7-3.7-5.5L16 3h-3l-1.3 4.2C9.5 7.7 8 9.7 8 12" strokeWidth="2.2" />
          <circle cx="12" cy="13" r="2" strokeWidth="2" fill="currentColor" />
          <line x1="12" y1="3" x2="12" y2="7.5" strokeWidth="2.2" />
          <path d="M18 4l2-1v4l-2 1" fill="currentColor" stroke="none" />
        </svg>
      );
    }

    // 7. Paladino -> Escudo com Espada Sagrada Cruzada
    if (normalized.includes('paladino') || normalized.includes('paladin')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2.2" />
          <path d="M12 6v10M9 9h6" strokeWidth="2.4" />
          <polygon points="12,18 10,16 14,16" fill="currentColor" />
        </svg>
      );
    }

    // 8. Patrulheiro -> Arco Curvo de Caça com Flecha e Penas
    if (normalized.includes('patrulheiro') || normalized.includes('ranger')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M19 5c0 8.3-4.7 14-14 14" strokeWidth="2.4" />
          <line x1="5" y1="19" x2="19" y2="5" strokeWidth="1.6" strokeDasharray="1 2" />
          <path d="M8 8l8 8" strokeWidth="2.4" />
          <polygon points="17,7 21,3 17,3" fill="currentColor" />
          <polygon points="6,18 3,21 7,21" fill="currentColor" />
        </svg>
      );
    }

    // 9. Artífice -> Engrenagens Mecânicas com Martelo Mágico
    if (normalized.includes('artífice') || normalized.includes('artifice') || normalized.includes('artificer')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2.2" />
          <circle cx="18" cy="18" r="3" strokeWidth="2" />
          <path d="M18 14v1M18 21v1M14 18h1M21 18h1" strokeWidth="2" />
        </svg>
      );
    }

    // Genérico / Outra Classe -> Varinha Mágica com Estrela Arcana
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
        <path d="M14.5 9.5L3 21" strokeWidth="2.2" />
        <path d="M15 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="currentColor" stroke="none" />
        <path d="M20 12l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-black border border-slate-700/80 shadow-inner shrink-0 ${sizeClasses} ${className}`}
      title={`Pictograma da classe: ${classe}`}
    >
      {renderSvg()}
    </div>
  );
};
