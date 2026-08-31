# Grimório - Webapp de Gerenciamento de Magias (PostgreSQL 16)

Sistema full-stack completo para gerenciamento, consulta avançada, cadastro, edição e importação em massa (CSV) de magias, construído estritamente sob as especificações do schema PostgreSQL 16 fornecido.

---

## 🗄️ Configuração do Banco de Dados PostgreSQL 16

O sistema conecta-se ao banco de dados utilizando os seguintes parâmetros:
- **Banco:** PostgreSQL 16
- **Host:** `192.168.0.153` (ou configurável via `.env`)
- **Porta:** `6532`
- **Usuário:** `leo`
- **Senha:** Definida na variável `DB_PASSWORD` do `.env`

> **Modo Fallback Inteligente:** Caso o servidor PostgreSQL não esteja acessível no ambiente local/preview, o backend inicializa automaticamente com um repositório em memória populado com dados fiéis ao schema, permitindo testes completos e demonstração fluida.

---

## 🔒 Regras de Segurança & Integridade de Dados

1. **Trava de Segurança (PIN "1998"):**
   - Todas as operações de escrita no banco de dados (**Criação**, **Edição**, **Exclusão** e **Importação em Massa por CSV**) exigem a confirmação da senha de segurança `1998`.
   - O backend valida a senha em middleware antes de executar qualquer comando SQL no banco.
2. **Tipagem Estrita (Enums PostgreSQL):**
   - `escolas`: `'Abjuração'`, `'Adivinhação'`, `'Encantamento'`, `'Evocação'`, `'Ilusão'`, `'Invocação'`, `'Necromancia'`, `'Transmutação'`
   - `tipo_dano`: `'ácido'`, `'concussão'`, `'congelante'`, `'cortante'`, `'elétrico'`, `'energético'`, `'fogo'`, `'necrótico'`, `'perfurante'`, `'psíquico'`, `'radiante'`, `'trovejante'`, `'veneno'`
   - `atributos`: `'FOR'`, `'DES'`, `'CON'`, `'INT'`, `'SAB'`, `'CAR'`
   - `dados`: `'d4'`, `'d6'`, `'d8'`, `'d10'`, `'d12'`
   - `formas`: `'linha'`, `'cone'`, `'cubo'`, `'cilindro'`, `'emanação/esfera'`
3. **Relacionamentos N:M com Integridade Transacional:**
   - `magias_conjuradores` (associação entre magias e classes de conjuradores)
   - `magias_tipo_dano` (associação de múltiplos tipos de dano por magia)
4. **Listagens Dinâmicas:**
   - As classes de conjuradores e os livros cadastrados são consultados diretamente das tabelas `conjuradores` e `livros`, sem hardcode, permitindo expansão dinâmica.

---

## 📄 Modelo e Guia de Importação CSV

O arquivo CSV deve conter a seguinte linha de cabeçalho:

```csv
nome_magia,circulo,escola,tempo,alcance,forma,tamanho,componente_verbal,componente_somatico,componente_material,consumo_material,valor_material,descricao_material,duracao,concentracao,salvaguarda,atributo_salvaguarda,ataque,livro,descricao,dado_dano,numero_dados_dano,bonus_dano,conjuradores,tipos_dano
```

### Exemplo de Registros CSV:
```csv
"Bola de Fogo",3,Evocação,"1 ação","45 metros",emanação/esfera,6,true,true,true,false,null,"Uma pequena bola de guano de morcego e enxofre","Instantânea",false,true,DES,false,"Livro do Jogador (PHB)","Uma explosão brilhante de fogo irrompe com um estrondo.",d6,8,0,"Mago; Feiticeiro","fogo"
"Mísseis Mágicos",1,Evocação,"1 ação","36 metros",null,null,true,true,false,null,null,null,"Instantânea",false,false,null,false,"Livro do Jogador (PHB)","Você cria três dardos brilhantes de força mágica.",d4,3,3,"Mago; Feiticeiro","energético"
"Curar Ferimentos",1,Evocação,"1 ação","Toque",null,null,true,true,false,null,null,null,"Instantânea",false,false,null,false,"Livro do Jogador (PHB)","Uma criatura que você tocar recupera pontos de vida.",d8,1,0,"Clérigo; Druida; Bardo; Paladino; Patrulheiro; Artífice",""
```

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz:
```env
DB_HOST=192.168.0.153
DB_PORT=6532
DB_USER=leo
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
SECURITY_PIN=1998
```

### 3. Rodar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`.

### 4. Build de Produção
```bash
npm run build
npm run start
```

---

## 🐳 Executando com Docker & Docker Compose

### Usando Docker Compose:
```bash
docker compose up --build -d
```

---

## 📁 Estrutura de Pastas Recomendada para o Repositório GitHub

```text
grimorio-spells/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD automatizado
├── server/
│   ├── db.ts                   # Camada de dados PostgreSQL 16 & Fallback
│   ├── csv.ts                  # Parser e exportador de CSV
│   └── routes.ts               # Rotas RESTful da API
├── src/
│   ├── components/             # Componentes React modulares
│   │   ├── Navbar.tsx          # Barra de topo com busca e ações
│   │   ├── FilterSidebar.tsx   # Filtros avançados com contadores
│   │   ├── SpellCard.tsx       # Card estilizado de exibição da magia
│   │   ├── SpellDetailModal.tsx# Modal com todos os dados da magia
│   │   ├── SpellFormModal.tsx  # Formulário de criação/edição
│   │   ├── CsvImportModal.tsx  # Tela de importação em lote CSV
│   │   ├── ManageEntitiesModal.tsx # Gerenciamento de classes e livros
│   │   ├── SchemaDocModal.tsx  # Documentação interna no app
│   │   ├── SecurityPinModal.tsx# Trava de segurança com PIN 1998
│   │   └── Toast.tsx           # Notificações do sistema
│   ├── services/
│   │   └── api.ts              # Cliente HTTP com PIN de sessão
│   ├── utils/
│   │   └── magicHelpers.ts     # Helpers de formatação e cores
│   ├── types.ts                # Interfaces e Enums do PostgreSQL
│   ├── App.tsx                 # View principal do Dashboard
│   ├── main.tsx
│   └── index.css               # Tailwind CSS v4
├── .env.example
├── .gitignore
├── Dockerfile                  # Multi-stage build Node 20
├── docker-compose.yml          # Orquestração do container
├── index.html
├── package.json
├── server.ts                   # Entry point Express + Vite
├── tsconfig.json
└── vite.config.ts
```
