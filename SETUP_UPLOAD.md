# Configuração de Upload de Fotos

## Problema Resolvido

O sistema de upload de fotos parou de funcionar provavelmente devido à falta de configuração das variáveis de ambiente necessárias para o Vercel Blob Storage.

## Solução Implementada

1. **Logs melhorados**: Adicionei logs detalhados tanto no frontend quanto no backend para ajudar a diagnosticar problemas
2. **Verificação de token**: A API agora verifica se o `BLOB_READ_WRITE_TOKEN` está configurado
3. **Tratamento de erros aprimorado**: Melhor tratamento de diferentes tipos de erro

## Como Configurar

### 1. Criar arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# Vercel Blob Storage Configuration (IMPORTANTE para upload de fotos)
BLOB_READ_WRITE_TOKEN=seu_token_vercel_blob

# Next.js Configuration
NEXTAUTH_SECRET=seu_secret_nextauth
NEXTAUTH_URL=http://localhost:3000
```

### 2. Obter o Token do Vercel Blob

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em "Storage" > "Blob"
3. Crie um novo store ou use um existente
4. Copie o token de leitura/escrita
5. Cole no arquivo .env.local como `BLOB_READ_WRITE_TOKEN`

### 3. Reiniciar o servidor

Após configurar as variáveis de ambiente:

```bash
npm run dev
```

## Como Testar

1. Abra a aplicação no navegador
2. Tente registrar um novo problema
3. Adicione uma foto
4. Verifique o console do navegador (F12) para logs detalhados
5. Verifique o console do servidor para logs da API

## Logs para Verificar

**No navegador (Console):**

- "Iniciando upload de [nome_arquivo]"
- "Resposta do upload: 200 OK"
- "Upload concluído para [nome_arquivo]"

**No servidor (Terminal):**

- "Iniciando upload - Headers: [...]"
- "Arquivo recebido: [nome], tamanho: [bytes], tipo: [tipo]"
- "Fazendo upload para Vercel Blob: [filename]"
- "Upload concluído: [url]"

## Possíveis Problemas

1. **Token não configurado**: Erro "Configuração de upload não disponível"
2. **Token inválido**: Erro "Token de upload inválido"
3. **Arquivo muito grande**: Erro "Arquivo muito grande"
4. **Tipo de arquivo inválido**: Erro "Apenas imagens são permitidas"

## Monitoramento

Os logs agora mostram detalhes completos do processo de upload, facilitando a identificação de problemas específicos.
