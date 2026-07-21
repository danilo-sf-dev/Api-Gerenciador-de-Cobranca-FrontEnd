# Trustee Ledger — Frontend

> **Sistema de Gestão de Cobranças e Contas a Receber** — Interface web multi-tenant para controle de títulos, clientes, vendedores e fluxo financeiro de cobrança.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Módulos do Sistema](#módulos-do-sistema)
- [Controle de Acesso e Permissões](#controle-de-acesso-e-permissões)
- [Máquina de Estados dos Títulos](#máquina-de-estados-dos-títulos)
- [Testes](#testes)
- [Formatação e Qualidade de Código](#formatação-e-qualidade-de-código)
- [Fluxo de Branches](#fluxo-de-branches)
- [Design System](#design-system)

---

## Sobre o Projeto

O **Trustee Ledger** é um sistema web de gerenciamento de cobranças voltado para pequenas e médias empresas (PMEs) que comercializam produtos ou serviços a prazo e necessitam de um controle estruturado sobre recebíveis e inadimplência.

O sistema centraliza **clientes, vendedores e o ciclo de vida completo dos títulos de cobrança** — incluindo cálculo automático de multas, juros e transições de estado — além de manter um histórico de auditoria rastreável para renegociações.

> ⚠️ **Este repositório contém exclusivamente o Frontend.** Os dados são atualmente servidos por um mock local (`src/mocks/data/db.ts`) que simula o comportamento da API REST. A integração com o backend real deverá substituir as chamadas nos arquivos de serviço (`src/features/*/services/`).

---

## Funcionalidades

### Dashboard Operacional
- Resumo em tempo real de títulos **A Vencer**, **Em Atraso** e **Vencidos**
- Alertas automáticos de títulos críticos para acompanhamento
- Visão geral de inadimplência e volume financeiro em aberto

### Gestão de Títulos (`/titulos`)
- Listagem paginada com filtros por status, período de vencimento e busca textual
- Ordenação por coluna (valor, vencimento, cliente)
- Criação manual de títulos com validação de formulário
- **Página de detalhes completa** com:
  - Informações gerais, valores calculados (multa + juros) e datas
  - Registro de baixa de pagamento (PIX, Boleto, Cartão)
  - Cancelamento de título
  - Renegociação com geração de novo título filho
  - Log de auditoria com histórico de todas as transições de estado
- Importação em lote via arquivo

### Gestão de Clientes (`/clientes`)
- Cadastro com suporte a **CPF** e **CNPJ** com validação e formatação automática
- Vinculação obrigatória a um vendedor responsável
- Edição de dados cadastrais

### Gestão de Vendedores (`/vendedores`)
- Cadastro com CPF validado, telefone com máscara e e-mail
- Ativação / Inativação com toggle visual
- Geração automática de código de vendedor

### Gestão de Usuários (`/usuarios`)
- Convite de novos usuários por e-mail
- Visualização de status: `Pendente`, `Ativo`, `Inativo`
- Troca de cargo com aprovação hierárquica
- Último acesso rastreado

### Gestão de Cargos (`/cargos`)
- CRUD completo de cargos com nível hierárquico numérico
- Bloqueio de inativação para cargos padrão do sistema (`Owner`, `Gerente`)
- Toggle visual de ativação/inativação

---

## Stack Tecnológica

| Categoria             | Tecnologia                              |
|-----------------------|-----------------------------------------|
| Framework             | [Next.js 16](https://nextjs.org/) (App Router) |
| Linguagem             | [TypeScript 5](https://www.typescriptlang.org/) |
| UI Library            | [React 19](https://react.dev/)          |
| Ícones                | [Lucide React](https://lucide.dev/)     |
| Estilização           | CSS Modules + Vanilla CSS               |
| Testes E2E            | [Playwright](https://playwright.dev/)   |
| Formatador            | [Prettier](https://prettier.io/)        |
| Linter                | [ESLint 9](https://eslint.org/)         |
| Gerenciador de pacotes| npm                                     |

---

## Pré-requisitos

- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/danilo-sf-dev/Api-Gerenciador-de-Cobranca-FrontEnd.git
cd Api-Gerenciador-de-Cobranca-FrontEnd
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute em modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

### 4. Build de produção

```bash
npm run build
npm run start
```

---

## Estrutura do Projeto

```
src/
├── app/                        # Rotas Next.js (App Router)
│   ├── (auth)/                 # Rotas públicas (login, recuperação de senha)
│   │   ├── login/
│   │   ├── esqueci-minha-senha/
│   │   ├── redefinir-senha/[token]/
│   │   └── ativar-conta/[token]/
│   ├── (sistema)/              # Rotas protegidas (sistema principal)
│   │   ├── cargos/             # CRUD de cargos
│   │   ├── clientes/           # CRUD de clientes
│   │   ├── titulos/            # Módulo completo de títulos e cobranças
│   │   │   ├── [id]/           # Detalhes, edição e renegociação
│   │   │   ├── importar/       # Importação em lote
│   │   │   └── novo/           # Criação de título
│   │   ├── usuarios/           # Gestão de usuários e convites
│   │   └── vendedores/         # CRUD de vendedores
│   ├── globals.css             # Tokens de design global (CSS variables)
│   ├── layout.tsx              # Layout raiz da aplicação
│   └── page.tsx                # Dashboard operacional
│
├── components/                 # Componentes reutilizáveis
│   ├── data-table/             # Tabela com paginação, ordenação e estados vazios
│   ├── feedback/               # Toast de notificações e diálogo de confirmação
│   ├── forms/                  # Inputs especializados (CPF, CNPJ, moeda, telefone)
│   ├── layout/                 # Sidebar, header e layout wrapper
│   ├── permissions/            # Guard de permissão por componente
│   └── ui/                     # Elementos de UI compartilhados
│
├── features/                   # Camada de serviços por domínio
│   ├── auth/                   # Contexto de autenticação e serviço de login
│   ├── cargos/                 # Serviço de cargos (roles.service.ts)
│   ├── clientes/               # Serviço de clientes (customers.service.ts)
│   ├── titulos/                # Serviço de títulos (titles.service.ts)
│   ├── usuarios/               # Serviço de usuários (users.service.ts)
│   └── vendedores/             # Serviço de vendedores (sellers.service.ts)
│
├── hooks/                      # Hooks customizados
│   └── use-permissions.ts      # Hook de verificação de permissões do usuário
│
├── lib/
│   ├── constants/              # Permissões e rotas da aplicação
│   ├── formatters/             # Formatadores (CPF, CNPJ, moeda, data, telefone)
│   ├── permissions/            # Motor de regras de permissão por cargo
│   ├── utils/                  # Utilitários gerais
│   └── validators/             # Validadores de CPF e CNPJ
│
├── mocks/
│   └── data/db.ts              # Banco de dados mock in-memory (simula API REST)
│
└── types/
    └── index.ts                # Tipagens TypeScript globais da aplicação

e2e/
└── billing.spec.ts             # Suíte de testes E2E (Playwright)
```

---

## Módulos do Sistema

### Módulo de Títulos

O módulo de títulos é o coração do sistema. Um **título** representa uma cobrança vinculada a um cliente e a um vendedor, com um ciclo de vida gerenciado por uma máquina de estados.

**Entidades principais:**

```typescript
// Status possíveis de um título
type TitleStatus = "UPCOMING" | "OVERDUE" | "LATE" | "PAID" | "CANCELED" | "RENEGOTIATED";

// Métodos de pagamento suportados
type PaymentMethod = "PIX" | "BOLETO" | "CARD";
```

**Campos financeiros calculados automaticamente:**
- `originalAmount` — Valor original do título
- `updatedAmount` — Valor atualizado (original + multa + juros)
- `fineAmount` — Multa calculada sobre o atraso
- `interestAmount` — Juros acumulados

---

## Controle de Acesso e Permissões

O sistema implementa um modelo de permissões baseado em **hierarquia de cargos**:

| Cargo       | Nível Hierárquico | Descrição                                                      |
|-------------|-------------------|-----------------------------------------------------------------|
| Owner       | 1                 | Acesso total; aprova promoções para Gerente                    |
| Gerente     | 2                 | Gerencia usuários/vendedores e opera títulos                   |
| Vendedor    | 3                 | Operações CRUD básicas; acesso limitado ao dashboard           |
| Funcionário | 4                 | Visualização e operações restritas                             |

**Permissões disponíveis no sistema:**

```typescript
// Exemplos das permissões disponíveis
VIEW_DASHBOARD | VIEW_SELLERS | CREATE_SELLER | EDIT_SELLER | INACTIVATE_SELLER
VIEW_ROLES | CREATE_ROLE | EDIT_ROLE | INACTIVATE_ROLE
VIEW_USERS | INVITE_USER | RESEND_INVITATION | CANCEL_INVITATION
CHANGE_USER_ROLE | APPROVE_MANAGER_PROMOTION
VIEW_CUSTOMERS | CREATE_CUSTOMER | EDIT_CUSTOMER
VIEW_TITLES | CREATE_TITLE | EDIT_TITLE | CANCEL_TITLE
REGISTER_PAYMENT | RENEGOTIATE_TITLE | IMPORT_TITLES
```

O hook `usePermissions()` expõe o método `hasPermission(PERMISSIONS.CHAVE)` para verificação inline em qualquer componente.

---

## Máquina de Estados dos Títulos

```
           ┌─────────────────────────────────────┐
           │                                     │
     ┌─────▼─────┐                               │
     │  UPCOMING  │ ──── Cancelar ────────► CANCELED
     └─────┬─────┘
           │ Vence (0–2 dias após vencimento)
           ▼
       ┌────────┐
       │ OVERDUE │
       └────┬───┘
            │ 3+ dias de atraso
            ▼
         ┌──────┐
         │ LATE  │ ──── Renegociar ──────► RENEGOTIATED
         └──┬───┘                          (gera título filho)
            │
            │ Registrar Pagamento
            ▼
          ┌──────┐
          │ PAID  │
          └──────┘
```

- **UPCOMING** → título dentro do prazo
- **OVERDUE** → vencido há até 2 dias (tolerância)
- **LATE** → vencido há 3 ou mais dias (multa + juros ativos)
- **PAID** → baixa registrada com método de pagamento
- **CANCELED** → cancelado quando ainda estava A Vencer
- **RENEGOTIATED** → substituído por novo título filho; mantém histórico do título pai

---

## Testes

Os testes end-to-end utilizam **Playwright** e cobrem o fluxo crítico completo do sistema.

### Executar testes

> ⚠️ O servidor de desenvolvimento deve estar rodando (ou o Playwright o inicia automaticamente).

```bash
npx playwright test
```

### Cobertura do teste E2E (`e2e/billing.spec.ts`)

O teste `"should login, create a seller, create a customer, and register a manual title"` valida o fluxo completo:

1. ✅ Login na aplicação com credenciais válidas
2. ✅ Criação de um novo vendedor (com CPF válido gerado dinamicamente)
3. ✅ Criação de um novo cliente (com CNPJ válido e vinculação ao vendedor)
4. ✅ Criação de um título manual com valor e datas
5. ✅ Acesso à página de detalhes do título
6. ✅ Registro de baixa de pagamento no modal
7. ✅ Verificação do status `Pago` na listagem de títulos

### Configuração do Playwright (`playwright.config.ts`)

| Parâmetro        | Valor                          |
|------------------|--------------------------------|
| `baseURL`        | `http://localhost:3000`        |
| `testDir`        | `./e2e`                        |
| `workers`        | `1` (sequencial)               |
| `browser`        | Chromium (Desktop Chrome)      |
| `webServer`      | `npm run dev` (auto-start)     |

---

## Formatação e Qualidade de Código

### Prettier

```bash
# Formatar todos os arquivos
npm run format

# Verificar formatação sem alterar arquivos
npm run format:check
```

### ESLint

```bash
npm run lint
```

### TypeScript

```bash
npx tsc --noEmit
```

---

## Fluxo de Branches

| Branch      | Propósito                                                  |
|-------------|-------------------------------------------------------------|
| `master`    | Branch principal, reflete o estado estável de produção      |
| `developer` | Branch de integração contínua para desenvolvimento ativo    |
| `feature/*` | Branches de funcionalidades criadas a partir de `developer` |

**Fluxo padrão:**

```
feature/xxx  →  developer  →  master
```

1. Desenvolvimento ocorre em branches `feature/*`
2. Após revisão e testes, merge para `developer`
3. Quando estável, merge de `developer` para `master`

---

## Design System

O Trustee Ledger adota um sistema de design chamado **"The Trustee Ledger"** — uma interface de alta densidade orientada a dados financeiros.

### Paleta de Cores

| Token              | Hex         | Uso                                                  |
|--------------------|-------------|-------------------------------------------------------|
| Primary (Crimson)  | `#d21c38`   | Botões primários, navegação ativa, alertas críticos   |
| Neutral BG         | `#ffffff`   | Fundo principal da aplicação                          |
| Surface            | `#f8f9fa`   | Fundo de cards, tabelas e toolbars                    |
| Border             | `#e9ecef`   | Separadores, bordas de linhas e seções                |
| Ink (texto)        | `#1a1a1a`   | Texto de alto contraste                               |
| Muted (texto)      | `#6c757d`   | Metadados, legendas e labels secundários              |
| Accent (Azul)      | `#1c3d5a`   | Badges informativos e status pills                    |

### Status dos Títulos (Badges)

| Status       | Cor visual    |
|--------------|---------------|
| A Vencer     | Índigo        |
| Vencido      | Âmbar         |
| Atraso       | Vermelho      |
| Pago         | Verde         |
| Cancelado    | Cinza escuro  |
| Renegociado  | Roxo          |

### Princípios de Design

- **Flat-by-default**: profundidade expressa por contraste de cores e bordas, não por sombras
- **Tabular Numbers**: todos os valores financeiros, CPF/CNPJ, datas e códigos usam `font-variant-numeric: tabular-nums`
- **Regra dos 10%**: o vermelho primário ocupa menos de 10% de qualquer superfície de layout
- **Contraste WCAG**: mínimo de 4.5:1 para texto e placeholders em todos os contextos

---

## Licença

Este projeto é privado e de uso interno. Todos os direitos reservados.
