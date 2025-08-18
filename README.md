# 🏗️ Sistema de Gestão de Problemas para Obras

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-API-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

> **Sistema completo para documentação, gestão e resolução de problemas de segurança e ambientais em canteiros de obras**

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [📱 Como Usar](#-como-usar)
- [🏗️ Arquitetura](#️-arquitetura)
- [📊 Banco de Dados](#-banco-de-dados)
- [🔐 Segurança](#-segurança)
- [📱 Responsividade](#-responsividade)
- [🎨 Interface](#-interface)
- [📈 Estatísticas](#-estatísticas)
- [🔄 Fluxo de Trabalho](#️-fluxo-de-trabalho)
- [🚀 Deploy](#-deploy)
- [🛠️ Desenvolvimento](#️-desenvolvimento)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## 🎯 Visão Geral

O **Sistema de Gestão de Problemas para Obras** é uma aplicação web moderna e robusta desenvolvida para documentar, gerenciar e acompanhar problemas de segurança e ambientais em canteiros de obras.

### 🌟 **Características Principais:**

- **Interface moderna** com Next.js 15 e React 19
- **Sistema completo de autenticação** com Supabase
- **Gestão avançada de problemas** com metodologia 5W2H
- **Upload e gestão de fotos** integrado
- **Relatórios profissionais** para impressão
- **Design responsivo** para todos os dispositivos

## ✨ Funcionalidades

### 🔧 **Gestão Completa de Problemas (CRUD)**

- ✅ **Criar**: Adicionar novos problemas com informações detalhadas
- ✅ **Visualizar**: Lista organizada com filtros e busca avançada
- ✅ **Editar**: Modificar problemas existentes
- ✅ **Deletar**: Remover problemas com confirmação de segurança

### 📸 **Sistema de Fotos Avançado**

- 📤 **Upload múltiplo** de imagens (até 5 fotos por problema)
- 🎠 **Carrossel automático** para visualização
- ☁️ **Integração com Vercel Blob** para armazenamento seguro
- 📱 **Suporte a formatos**: PNG, JPG, JPEG (máx. 10MB cada)
- 🔍 **Visualização otimizada** com zoom e navegação

### 📊 **Relatórios e Impressão Profissionais**

- 📄 **Geração de relatórios** completos em PDF
- 📈 **Estatísticas em tempo real** (total, resolvidos, pendentes)
- 🖨️ **Layout profissional** otimizado para impressão
- 🖼️ **Inclusão automática** de fotos no relatório
- 📋 **Formatação responsiva** para diferentes tamanhos de papel

### 🎯 **Metodologia 5W2H Integrada**

- 📝 **Sistema estruturado** para criação de planos de ação
- 🔍 **Campos organizados**: What, Why, When, Where, Who, How, How Much
- 📋 **Expansão/contração** via checkbox para melhor organização
- 📊 **Acompanhamento** de status de resolução
- 📈 **Métricas** de eficiência dos planos

### 🔍 **Filtros e Organização Inteligente**

- 🏷️ **Filtro por tipo**: Segurança, Ambiental, Infraestrutura, etc.
- ⚠️ **Filtro por severidade**: Crítico, Alto, Médio, Baixo
- ✅ **Filtro por status**: Resolvido/Pendente
- 🔍 **Busca por texto** em tempo real
- 📅 **Ordenação automática** (mais recentes primeiro)

## 🛠️ Tecnologias

### **Frontend Moderno**

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router e Server Components
- **[React 19](https://react.dev/)** - Biblioteca de interface com hooks avançados
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipagem estática e IntelliSense
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utilitário moderno
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes de interface profissionais
- **[Lucide React](https://lucide.dev/)** - Ícones modernos e consistentes

### **Backend & Banco de Dados**

- **[Supabase](https://supabase.com/)** - Plataforma backend-as-a-service com PostgreSQL
- **[Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)** - Segurança de dados avançada
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** - Armazenamento de imagens escalável
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** - Operações server-side seguras

### **Infraestrutura & Deploy**

- **[Vercel](https://vercel.com/)** - Plataforma de deploy e hospedagem
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional robusto
- **[Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)** - Autenticação e roteamento inteligente

### **Ferramentas de Desenvolvimento**

- **[ESLint](https://eslint.org/)** - Linting de código
- **[PostCSS](https://postcss.org/)** - Processamento de CSS
- **[Webpack](https://webpack.js.org/)** - Bundling otimizado
- **[React Hook Form](https://react-hook-form.com/)** - Gestão de formulários

## 🚀 Instalação

### **Pré-requisitos**

- Node.js 18+
- npm ou pnpm
- Git

### **1. Clone o repositório**

```bash
git clone <seu-repositorio>
cd DocProblemas
```

### **2. Instale as dependências**

```bash
npm install
# ou
pnpm install
```

### **3. Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# Vercel Blob (opcional)
BLOB_READ_WRITE_TOKEN=seu_token_vercel_blob
```

### **4. Execute o banco de dados**

```sql
-- Execute o script SQL para criar as tabelas
-- scripts/create-problems-tables-v7.sql
```

### **5. Inicie o servidor de desenvolvimento**

```bash
npm run dev
# ou
pnpm dev
```

A aplicação estará disponível em: **<http://localhost:3000>**

## ⚙️ Configuração

### **Configuração do Supabase**

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings → API**
4. Copie **Project URL** e **anon public key**
5. Configure no arquivo `.env.local`

### **Configuração do Vercel Blob (Opcional)**

1. Acesse [https://vercel.com](https://vercel.com)
2. Vá em **Storage → Blob**
3. Crie um novo bucket
4. Copie o token de acesso
5. Configure no arquivo `.env.local`

## 📱 Como Usar

### **1. Primeiro Acesso**

- Acesse a aplicação
- Use as credenciais de teste ou configure o Supabase
- Faça login com sua conta

### **2. Adicionando um Problema**

1. Clique em **"Adicionar Problema"**
2. Preencha os campos obrigatórios:
   - **Título**: Descrição breve do problema
   - **Tipo**: Selecione entre Segurança, Ambiental, etc.
   - **Severidade**: Crítico, Alto, Médio ou Baixo
   - **Descrição**: Detalhamento completo do problema
3. Campos opcionais:
   - **Local**: Localização específica na obra
   - **Recomendações**: Sugestões para resolução
   - **Fotos**: Upload de até 5 imagens
4. Clique em **"Adicionar Problema"**

### **3. Gerenciando Problemas**

- **Visualizar**: Problemas aparecem em cards organizados
- **Editar**: Clique no ícone de lápis (✏️)
- **Deletar**: Clique no ícone de lixeira (🗑️)
- **Marcar como Resolvido**: Use o checkbox correspondente

### **4. Criando Planos 5W2H**

1. Marque o checkbox **"Criar plano 5W2H para resolução"**
2. Preencha os campos que aparecem:
   - **What** (O que): O que será feito?
   - **Why** (Por que): Por que é necessário?
   - **When** (Quando): Prazo para execução
   - **Where** (Onde): Local de execução
   - **Who** (Quem): Responsável pela execução
   - **How** (Como): Como será executado?
   - **How Much** (Quanto): Custo estimado
3. Salve o plano clicando em **"Salvar Plano 5W2H"**

### **5. Gerando Relatórios**

1. Clique no botão **"Imprimir Relatório"**
2. O sistema processa as imagens (conversão para base64)
3. Abre uma nova janela com o relatório formatado
4. Use **Ctrl+P** (Cmd+P no Mac) para imprimir ou salvar como PDF

### **6. Usando Filtros**

- **Busca**: Digite no campo de busca para filtrar por texto
- **Tipo**: Selecione o tipo de problema no dropdown
- **Severidade**: Filtre por nível de severidade
- **Status**: Escolha entre "Todos", "Resolvidos" ou "Pendentes"

## 🏗️ Arquitetura

### **Estrutura de Pastas**

```bash
DocProblemas/
├── app/                    # App Router do Next.js 15
│   ├── auth/              # Rotas de autenticação
│   ├── api/               # API routes
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/             # Componentes React reutilizáveis
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── problem-card.tsx   # Card de problema
│   ├── add-problem-dialog.tsx # Dialog para adicionar problema
│   ├── photo-upload.tsx   # Upload de fotos
│   ├── w5h2-list.tsx      # Lista 5W2H
│   └── print-report.tsx   # Geração de relatórios
├── lib/                    # Utilitários e configurações
│   ├── supabase/          # Cliente Supabase
│   ├── actions.ts         # Server Actions
│   └── utils.ts           # Funções utilitárias
├── hooks/                  # Custom hooks
├── public/                 # Assets estáticos
└── scripts/                # Scripts SQL para banco de dados
```

### **Padrões de Desenvolvimento**

- **Server Components** para renderização server-side
- **Client Components** para interatividade
- **Server Actions** para operações de dados
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização utilitária

## 📊 Banco de Dados

### **Tabela: `problems`**

```sql
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_number SERIAL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendations TEXT,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabela: `problem_photos`**

```sql
CREATE TABLE problem_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabela: `problem_5w2h`**

```sql
CREATE TABLE problem_5w2h (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  what TEXT NOT NULL,
  why TEXT NOT NULL,
  when_field TEXT NOT NULL,
  where_field TEXT NOT NULL,
  who TEXT NOT NULL,
  how TEXT NOT NULL,
  how_much TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Índices e Otimizações**

```sql
-- Índices para performance
CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_problems_status ON problems(status);
CREATE INDEX idx_problems_type ON problems(type);
CREATE INDEX idx_problems_created_at ON problems(created_at);

-- Índices para fotos
CREATE INDEX idx_problem_photos_problem_id ON problem_photos(problem_id);

-- Índices para 5W2H
CREATE INDEX idx_problem_5w2h_problem_id ON problem_5w2h(problem_id);
```

## 🔐 Segurança

### **Autenticação e Autorização**

- **Supabase Auth** com sistema completo de usuários
- **Row Level Security (RLS)** para isolamento de dados
- **JWT tokens** para sessões seguras
- **Middleware** para proteção de rotas

### **Validação de Dados**

- **Zod** para validação de schemas
- **Sanitização** de inputs
- **Validação server-side** com Server Actions
- **Proteção contra XSS** e injeção SQL

### **Upload Seguro**

- **Validação de tipos** de arquivo
- **Limite de tamanho** (10MB por arquivo)
- **Sanitização de nomes** de arquivo
- **Armazenamento seguro** com Vercel Blob

## 📱 Responsividade

### **Design Mobile First**

- **Breakpoints otimizados** para todos os dispositivos
- **Touch-friendly** para dispositivos móveis
- **Navegação adaptativa** para diferentes tamanhos de tela
- **Carrossel responsivo** para fotos

### **Adaptação Automática**

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Interface

### **Design System**

- **Cores semânticas**: Verde para resolvido, vermelho para crítico
- **Tipografia clara** com hierarquia visual bem definida
- **Espaçamento consistente** usando sistema de design
- **Componentes reutilizáveis** com shadcn/ui

### **Estados e Feedback**

- **Loading states** para operações assíncronas
- **Toast notifications** para confirmações
- **Error boundaries** para tratamento de erros
- **Skeleton loading** para melhor UX

## 📈 Estatísticas

### **Dashboard em Tempo Real**

- **Total de Problemas**: Contador geral
- **Não Resolvidos**: Problemas pendentes (vermelho)
- **Resolvidos**: Problemas concluídos (verde)
- **Atualização automática** via Server Components

### **Métricas de Performance**

- **Tempo de carregamento** otimizado
- **Lazy loading** para imagens
- **Code splitting** automático
- **Cache inteligente** com Next.js

## 🔄 Fluxo de Trabalho

### **Processo Recomendado**

1. **🔍 Identificação**: Detectar problema na obra
2. **📝 Documentação**: Registrar no sistema com fotos
3. **🏷️ Classificação**: Definir tipo e severidade
4. **📋 Planejamento**: Criar plano 5W2H se necessário
5. **⚡ Execução**: Implementar soluções
6. **✅ Resolução**: Marcar como resolvido
7. **📄 Relatório**: Gerar documentação final

### **Workflow de Aprovação**

- **Criação** → **Revisão** → **Aprovação** → **Execução** → **Validação**

## 🚀 Deploy

### **Deploy Automático com Vercel**

1. **Conecte seu repositório** ao Vercel
2. **Configure as variáveis** de ambiente
3. **Deploy automático** a cada push
4. **Preview deployments** para branches

### **Configuração de Produção**

```bash
# Build de produção
npm run build

# Start de produção
npm start

# Deploy
vercel --prod
```

## 🛠️ Desenvolvimento

### **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting do código
```

### **Estrutura de Desenvolvimento**

- **Hot reload** para desenvolvimento rápido
- **TypeScript** para desenvolvimento seguro
- **ESLint** para qualidade de código
- **Prettier** para formatação automática

### **Debugging**

- **React DevTools** para debugging de componentes
- **Next.js DevTools** para debugging de rotas
- **Console logs** para debugging de server actions
- **Network tab** para debugging de API calls

## 🤝 Contribuição

### **Como Contribuir**

1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

### **Padrões de Código**

- **TypeScript** para todas as funcionalidades
- **Componentes funcionais** com hooks
- **Server Components** quando possível
- **Tailwind CSS** para estilização
- **ESLint** para qualidade de código

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🎉 **Agradecimentos**

- **Next.js Team** pelo framework incrível
- **Supabase Team** pela plataforma backend
- **Vercel Team** pela infraestrutura de deploy
- **shadcn/ui** pelos componentes profissionais
- **Tailwind CSS** pelo sistema de design

---

**Desenvolvido com ❤️ para otimizar a gestão de problemas em obras, garantindo segurança e conformidade ambiental.**

> *Sistema profissional para gestão eficiente de problemas em canteiros de obras*
