import React from 'react';

interface GrimoireIconProps {
  className?: string;
  size?: number;
}

/**
 * Ícone limpo e minimalista de Grimório / Livro Mágico
 * Estilo de linha e geometria sutil que harmoniza perfeitamente com ícones como relógio e ampulheta.
 */
export const GrimoireIcon: React.FC<GrimoireIconProps> = ({
  className = 'w-6 h-6',
  size,
}) => {
  const sizeProps = size ? { width: size, height: size } : {};

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...sizeProps}
    >
      {/* Livro de Grimório com Capa e Lombada */}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      
      {/* Marcador de Página / Fita */}
      <path d="M12 2v8l3-2 3 2V2" fill="currentColor" fillOpacity="0.15" />
      
      {/* Runa / Símbolo Arcano Místico Central */}
      <circle cx="12" cy="14.5" r="2" strokeWidth="1.25" />
      <path d="M12 11v1 M12 17v1 M8.5 14.5h1 M14.5 14.5h1" strokeWidth="1.25" />
    </svg>
  );
};
