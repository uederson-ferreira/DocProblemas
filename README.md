# Sistema de Registro de Problemas para Obras

*Sistema completo para documentação e gestão de problemas de segurança e ambientais em obras*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/uederson-ferreiras-projects/v0-melhorar-aplicacao)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/a66etRV7SpX)

## 📋 Visão Geral

O **Sistema de Registro de Problemas para Obras** é uma aplicação web completa desenvolvida para documentar, gerenciar e acompanhar problemas de segurança e ambientais em canteiros de obras. O sistema oferece funcionalidades avançadas de CRUD, upload de fotos, geração de relatórios e metodologia 5W2H para resolução de problemas.

## ✨ Funcionalidades Principais

### 🔧 Gestão Completa de Problemas (CRUD)
- **Criar**: Adicionar novos problemas com informações detalhadas
- **Visualizar**: Lista organizada com filtros e busca avançada
- **Editar**: Modificar problemas existentes
- **Deletar**: Remover problemas com confirmação de segurança

### 📸 Sistema de Fotos
- Upload múltiplo de imagens (até 5 fotos por problema)
- Carrossel automático para visualização
- Integração com Vercel Blob para armazenamento seguro
- Suporte a formatos: PNG, JPG, JPEG (máx. 10MB cada)

### 📊 Relatórios e Impressão
- Geração de relatórios completos em PDF
- Estatísticas em tempo real (total, resolvidos, pendentes)
- Layout profissional otimizado para impressão
- Inclusão automática de fotos no relatório

### 🎯 Metodologia 5W2H
- Sistema integrado para criação de planos de ação
- Campos estruturados: What, Why, When, Where, Who, How, How Much
- Expansão/contração via checkbox para melhor organização

### 🔍 Filtros e Organização
- Filtro por tipo de problema (Segurança, Ambiental, Infraestrutura, etc.)
- Filtro por severidade (Crítico, Alto, Médio, Baixo)
- Filtro por status (Resolvido/Pendente)
- Busca por texto em tempo real
- Ordenação automática (mais recentes primeiro)

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones modernos

### Backend & Banco de Dados
- **Supabase** - Banco PostgreSQL com autenticação
- **Row Level Security (RLS)** - Segurança de dados
- **Vercel Blob** - Armazenamento de imagens
- **Server Actions** - Operações server-side

### Infraestrutura
- **Vercel** - Deploy e hospedagem
- **PostgreSQL** - Banco de dados relacional
- **Middleware** - Autenticação e roteamento

## 🚀 Como Usar

### 1. Configuração Inicial
Execute o script SQL para criar as tabelas necessárias:
\`\`\`sql
-- Execute: scripts/create-problems-tables-v5.sql
\`\`\`

### 2. Adicionando um Problema
1. Clique no botão **"Adicionar Problema"**
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

### 3. Gerenciando Problemas
- **Visualizar**: Problemas aparecem em cards organizados
- **Editar**: Clique no ícone de lápis (✏️)
- **Deletar**: Clique no ícone de lixeira (🗑️)
- **Marcar como Resolvido**: Use o checkbox correspondente

### 4. Criando Planos 5W2H
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

### 5. Gerando Relatórios
1. Clique no botão **"Imprimir Relatório"**
2. O sistema processa as imagens (conversão para base64)
3. Abre uma nova janela com o relatório formatado
4. Use Ctrl+P (Cmd+P no Mac) para imprimir ou salvar como PDF

### 6. Usando Filtros
- **Busca**: Digite no campo de busca para filtrar por texto
- **Tipo**: Selecione o tipo de problema no dropdown
- **Severidade**: Filtre por nível de severidade
- **Status**: Escolha entre "Todos", "Resolvidos" ou "Pendentes"

## 📁 Estrutura do Banco de Dados

### Tabela: `problems`
\`\`\`sql
- id (UUID, Primary Key)
- problem_number (SERIAL, Número sequencial)
- title (TEXT, Título do problema)
- description (TEXT, Descrição detalhada)
- recommendations (TEXT, Recomendações)
- type (TEXT, Tipo do problema)
- severity (TEXT, Severidade)
- location (TEXT, Localização)
- status (TEXT, Status: pending/resolved)
- user_id (UUID, Referência ao usuário)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`

### Tabela: `problem_photos`
\`\`\`sql
- id (UUID, Primary Key)
- problem_id (UUID, Foreign Key)
- photo_url (TEXT, URL da imagem)
- filename (TEXT, Nome do arquivo)
- created_at (TIMESTAMP)
\`\`\`

### Tabela: `problem_5w2h`
\`\`\`sql
- id (UUID, Primary Key)
- problem_id (UUID, Foreign Key)
- what (TEXT, O que será feito)
- why (TEXT, Por que é necessário)
- when_field (TEXT, Quando será feito)
- where_field (TEXT, Onde será executado)
- who (TEXT, Quem é responsável)
- how (TEXT, Como será executado)
- how_much (TEXT, Quanto custará)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`

## 🔐 Segurança

- **Autenticação**: Sistema completo com Supabase Auth
- **RLS (Row Level Security)**: Usuários só acessam seus próprios dados
- **Validação**: Validação de dados no frontend e backend
- **Upload Seguro**: Validação de tipos e tamanhos de arquivo
- **CORS**: Configuração adequada para recursos externos

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: Adaptação automática para tablet e desktop
- **Touch Friendly**: Botões e controles otimizados para touch
- **Carrossel Responsivo**: Navegação adaptada para cada dispositivo

## 🎨 Interface

- **Design Moderno**: Interface limpa e profissional
- **Cores Semânticas**: Verde para resolvido, vermelho para crítico
- **Tipografia Clara**: Hierarquia visual bem definida
- **Feedback Visual**: Estados de loading e confirmações
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 📈 Estatísticas

O sistema exibe automaticamente:
- **Total de Problemas**: Contador geral
- **Não Resolvidos**: Problemas pendentes (vermelho)
- **Resolvidos**: Problemas concluídos (verde)
- **Atualização em Tempo Real**: Estatísticas atualizadas automaticamente

## 🔄 Fluxo de Trabalho Recomendado

1. **Identificação**: Detectar problema na obra
2. **Documentação**: Registrar no sistema com fotos
3. **Classificação**: Definir tipo e severidade
4. **Planejamento**: Criar plano 5W2H se necessário
5. **Execução**: Implementar soluções
6. **Resolução**: Marcar como resolvido
7. **Relatório**: Gerar documentação final

## 🚀 Deploy

Seu projeto está disponível em:
**[https://vercel.com/uederson-ferreiras-projects/v0-melhorar-aplicacao](https://vercel.com/uederson-ferreiras-projects/v0-melhorar-aplicacao)**

## 🛠️ Desenvolvimento

Continue desenvolvendo em:
**[https://v0.app/chat/projects/a66etRV7SpX](https://v0.app/chat/projects/a66etRV7SpX)**

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através do [Vercel Help](https://vercel.com/help).

---

*Sistema desenvolvido para otimizar a gestão de problemas em obras, garantindo segurança e conformidade ambiental.*
