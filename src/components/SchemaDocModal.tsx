import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Database,
  FileSpreadsheet,
  Layers,
  FolderTree,
  Shield,
  Copy,
  Check,
  Server,
} from 'lucide-react';
import { ESCOLAS, TIPOS_DANO, ATRIBUTOS, DADOS, FORMAS } from '../types';

interface SchemaDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaDocModal: React.FC<SchemaDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'csv' | 'docker' | 'github'>('schema');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const csvTemplateText = `nome_magia,circulo,escola,tempo,alcance,forma,tamanho,componente_verbal,componente_somatico,componente_material,consumo_material,valor_material,descricao_material,duracao,concentracao,salvaguarda,atributo_salvaguarda,ataque,livro,descricao,dado_dano,numero_dados_dano,bonus_dano,conjuradores,tipos_dano
"Bola de Fogo",3,Evocação,"1 ação","45 metros",emanação/esfera,6,true,true,true,false,null,"Uma pequena bola de guano de morcego e enxofre","Instantânea",false,true,DES,false,"Livro do Jogador (PHB)","Uma explosão brilhante de fogo irrompe com um estrondo.",d6,8,0,"Mago; Feiticeiro","fogo"
"Mísseis Mágicos",1,Evocação,"1 ação","36 metros",null,null,true,true,false,null,null,null,"Instantânea",false,false,null,false,"Livro do Jogador (PHB)","Você cria três dardos brilhantes de força mágica.",d4,3,3,"Mago; Feiticeiro","energético"
"Curar Ferimentos",1,Evocação,"1 ação","Toque",null,null,true,true,false,null,null,null,"Instantânea",false,false,null,false,"Livro do Jogador (PHB)","Uma criatura que você tocar recupera pontos de vida.",d8,1,0,"Clérigo; Druida; Bardo; Paladino; Patrulheiro; Artífice",""`;

  const dockerfileText = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/types.ts ./src/types.ts

EXPOSE 3000
CMD ["node", "dist/server.cjs"]`;

  const dockerComposeText = `version: '3.8'

services:
  grimorio-app:
    build: .
    container_name: grimorio_webapp
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=192.168.0.153
      - DB_PORT=6532
      - DB_USER=leo
      - DB_PASSWORD=sua_senha_aqui
      - DB_NAME=postgres
      - SECURITY_PIN=1998
    # Caso o PostgreSQL esteja no host da máquina:
    extra_hosts:
      - "host.docker.internal:host-gateway"`;

  const githubStructureText = `grimorio-spells/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD automatizado
├── server/
│   ├── db.ts                   # Conexão PG16 e transações N:M
│   ├── csv.ts                  # Parser e exportador de CSV
│   └── routes.ts               # Rotas da API RESTful
├── src/
│   ├── components/             # Componentes modulares
│   │   ├── Navbar.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── SpellCard.tsx
│   │   ├── SpellDetailModal.tsx
│   │   ├── SpellFormModal.tsx
│   │   ├── CsvImportModal.tsx
│   │   ├── ManageEntitiesModal.tsx
│   │   ├── SchemaDocModal.tsx
│   │   └── Toast.tsx
│   ├── services/
│   │   └── api.ts              # Cliente HTTP + PIN de segurança
│   ├── utils/
│   │   └── magicHelpers.ts     # Helpers de cores e formatação
│   ├── types.ts                # Tipos estritos e Enums do PostgreSQL
│   ├── App.tsx                 # Estado central da aplicação
│   ├── main.tsx
│   └── index.css               # Tailwind CSS v4
├── .env.example                # Configurações de ambiente
├── .gitignore
├── Dockerfile                  # Imagem Docker multi-stage
├── docker-compose.yml          # Orquestração do container
├── index.html
├── package.json
├── server.ts                   # Entry point Express + Vite
├── tsconfig.json
└── vite.config.ts`;

  return (
    <div
      id="schema-doc-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="schema-doc-modal"
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Documentação do Sistema & Deploy</h2>
              <p className="text-xs text-slate-400">
                Schema do PostgreSQL 16, Modelo CSV, Dockerfile e Organização no GitHub
              </p>
            </div>
          </div>

          <button
            id="btn-close-doc-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'schema'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Schema & Enums PG16
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'csv'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Modelo Textual CSV
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'docker'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Docker & Compose
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'github'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Estrutura GitHub
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {activeTab === 'schema' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Configuração de Conexão com o PostgreSQL 16
                </h3>
                <p className="text-xs text-slate-300">
                  Host: <code className="text-amber-300 font-mono">192.168.0.153</code> | Porta:{' '}
                  <code className="text-amber-300 font-mono">6532</code> | Usuário:{' '}
                  <code className="text-amber-300 font-mono">leo</code> | Senha configurada no{' '}
                  <code className="text-amber-300 font-mono">.env</code>.
                </p>
              </div>

              {/* Enums */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tipos ENUM Personalizados Estritos:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-1">escolas:</span>
                    <p className="text-slate-300 font-mono leading-relaxed">{ESCOLAS.join(', ')}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-orange-400 block mb-1">tipo_dano:</span>
                    <p className="text-slate-300 font-mono leading-relaxed">{TIPOS_DANO.join(', ')}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-cyan-400 block mb-1">atributos:</span>
                    <p className="text-slate-300 font-mono leading-relaxed">{ATRIBUTOS.join(', ')}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">dados:</span>
                    <p className="text-slate-300 font-mono leading-relaxed">{DADOS.join(', ')}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2">
                    <span className="font-bold text-teal-400 block mb-1">formas:</span>
                    <p className="text-slate-300 font-mono leading-relaxed">{FORMAS.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Tabelas e Relacionamentos */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tabelas Relacionais e Junções N:M:
                </h3>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400">magias_conjuradores:</strong> Tabela de junção N:M (
                    <code>id_magia</code> ↔ <code>id_conjurador</code>) que associa quais classes podem conjurar cada magia.
                  </li>
                  <li className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400">magias_tipo_dano:</strong> Tabela de junção N:M (
                    <code>id_magia</code> ↔ <code>tipo_dano</code>) que associa múltiplos tipos de dano causados por cada magia.
                  </li>
                  <li className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400">magias → livros:</strong> Chave estrangeira 1:N (
                    <code>magias.id_livro</code> → <code>livros.id_livro</code>).
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'csv' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Modelo Textual Exato do Arquivo CSV</h3>
                  <p className="text-xs text-slate-400">
                    Cabeçalhos exatos separados por vírgula compatíveis com o banco de dados
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(csvTemplateText, 'csv')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedSection === 'csv' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Modelo CSV
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {csvTemplateText}
              </pre>

              {/* Guia de Preenchimento */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider">
                  Instruções de Preenchimento dos Campos:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 leading-relaxed">
                  <div>
                    <strong className="text-slate-100">conjuradores (Associação N:M):</strong>
                    <p className="text-slate-400">
                      Preencha os nomes das classes separados por ponto-e-vírgula <code>;</code>. Ex:{' '}
                      <code>Mago; Feiticeiro; Bruxo</code>.
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-100">tipos_dano (Associação N:M):</strong>
                    <p className="text-slate-400">
                      Preencha os tipos de dano separados por ponto-e-vírgula <code>;</code>. Ex:{' '}
                      <code>fogo; elétrico</code>. Se não causar dano, deixe vazio <code>""</code>.
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-100">escola (Enum estrito):</strong>
                    <p className="text-slate-400">
                      Deve corresponder exatamente a um dos 8 nomes de escola (ex: <code>Evocação</code>,{' '}
                      <code>Abjuração</code>, <code>Necromancia</code>).
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-100">livro:</strong>
                    <p className="text-slate-400">
                      Nome do livro fonte (ex: <code>Livro do Jogador (PHB)</code>). Se ainda não existir no banco, o sistema cria automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-100">Dockerfile (Multi-Stage Build)</h3>
                  <button
                    onClick={() => copyToClipboard(dockerfileText, 'dockerfile')}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  >
                    {copiedSection === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                  {dockerfileText}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-100">docker-compose.yml</h3>
                  <button
                    onClick={() => copyToClipboard(dockerComposeText, 'compose')}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  >
                    {copiedSection === 'compose' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                  {dockerComposeText}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Estrutura de Pastas Recomendada para o GitHub</h3>
                  <p className="text-xs text-slate-400">
                    Organização profissional em camadas full-stack (Backend Node/Express + Frontend React/Tailwind)
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(githubStructureText, 'github')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedSection === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copiar Estrutura
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {githubStructureText}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            id="btn-close-schema-doc"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
