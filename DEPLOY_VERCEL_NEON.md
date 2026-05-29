# HBJJ - Deploy na Vercel com Neon

## Pré-requisitos

- Conta na Vercel
- Conta no Neon PostgreSQL
- Repositório Git (GitHub, GitLab, Bitbucket)
- Variáveis de ambiente configuradas

## Configuração do Neon PostgreSQL

### 1. Criar Projeto Neon

1. Acessar https://neon.tech
2. Criar novo projeto
3. Escolher região mais próxima dos usuários
4. Copiar `DATABASE_URL`

### 2. Configurar Prisma

Adicionar `DATABASE_URL` no `.env`:

```
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
```

### 3. Gerar e Migrar

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Configuração da Vercel

### 1. Conectar Repositório

1. Acessar https://vercel.com
2. "Add New Project"
3. Importar repositório Git
4. Configurar framework: Next.js

### 2. Variáveis de Ambiente

Adicionar no painel da Vercel (Settings > Environment Variables):

```
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=sua-chave-secreta-gerada-com-openssl-rand-base64-32
NEXTAUTH_URL=https://seu-dominio.vercel.app
OPENAI_API_KEY=sk-... (opcional, para Coach IA)
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=1000
BLOB_READ_WRITE_TOKEN=vercel_blob_token (opcional, para upload)
```

### 3. Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 4. Configurar Build

No painel da Vercel, configurar:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Deploy Automático

### Prisma Migrate em Produção

Adicionar script no `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "migrate:prod": "prisma migrate deploy"
  }
}
```

Configurar na Vercel (Settings > General > Build & Development Settings):

- **Build Command**: `npm run migrate:prod && npm run build`

### Prisma Seed em Produção

O seed não deve rodar em produção. Remover ou condicionar:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Para produção, comentar ou remover a configuração de seed.

## Domínio Customizado

### 1. Adicionar Domínio

1. Vercel Dashboard > Project > Settings > Domains
2. Adicionar domínio (ex: hbjj.com)
3. Configurar DNS

### 2. Atualizar NEXTAUTH_URL

```
NEXTAUTH_URL=https://hbjj.com
```

### 3. Atualizar Neon Whitelist

Se necessário, adicionar domínio da Vercel na whitelist do Neon.

## Monitoramento

### Vercel Analytics

1. Dashboard > Analytics
2. Habilitar Analytics
3. Adicionar script no app (opcional, Vercel faz automaticamente)

### Logs

Vercel fornece logs em:
- Dashboard > Logs
- Ver logs de build, runtime, e funções serverless

### Neon Console

Monitorar banco:
- Neon Console > Metrics
- Ver CPU, Memory, Connections
- Queries lentas

## Performance

### Edge Functions

Considerar usar Edge Functions para APIs simples:

```typescript
// app/api/health/route.ts
export const runtime = 'edge'
```

### Cache

Implementar cache com Vercel KV ou similar para:
- Dados frequentemente acessados
- Rate limiting distribuído
- Session storage

## Backup

### Neon Backups

Neon oferece backups automáticos:
- 7 dias de retenção (grátis)
- Point-in-time recovery
- Export manual

### Export Manual

```bash
pg_dump $DATABASE_URL > backup.sql
```

## Troubleshooting

### Erro: Prisma Client Generation

Se o build falhar com erro do Prisma:

1. Verificar se `DATABASE_URL` está configurada
2. Verificar se `postinstall` está rodando
3. Tentar rodar `prisma generate` localmente

### Erro: Database Connection

Se não conectar ao banco:

1. Verificar `DATABASE_URL` correta
2. Verificar se SSL está habilitado (`sslmode=require`)
3. Verificar se IP está na whitelist do Neon

### Erro: NextAuth

Se autenticação falhar:

1. Verificar `NEXTAUTH_SECRET` configurada
2. Verificar `NEXTAUTH_URL` correta
3. Verificar se cookies estão sendo setados

### Erro: Rate Limit

Se rate limit não funcionar em produção:

- Rate limit em memória não funciona em serverless
- Implementar com Vercel KV ou Upstash Redis

## Rollback

### Vercel Rollback

1. Dashboard > Deployments
2. Selecionar deployment anterior
3. "Redeploy" ou "Rollback"

### Database Rollback

```bash
npx prisma migrate resolve --rolled-back [migration-name]
```

## Escalabilidade

### Horizontal Scaling

Vercel escala automaticamente:
- Serverless functions escalam horizontalmente
- Edge functions escalam globalmente

### Vertical Scaling

Neon escala automaticamente:
- Autoscaling baseado em uso
- Configurar limits no painel

## Custos

### Vercel

- **Hobby**: Grátis (limitações)
- **Pro**: $20/mês (mais recursos, bandwidth)
- **Enterprise**: Custom

### Neon

- **Free**: 0.5GB, 1 compute hour/dia
- **Pro**: $29/mês (1TB, ilimitado)
- **Scale**: Baseado em uso

### OpenAI

- **gpt-4o-mini**: $0.15/1M input, $0.60/1M output
- Estimar uso mensal baseado em usuários

## Checklist de Deploy

- [ ] Repositório conectado à Vercel
- [ ] DATABASE_URL configurada na Vercel
- [ ] NEXTAUTH_SECRET gerado e configurado
- [ ] NEXTAUTH_URL configurado
- [ ] Prisma migrate deploy configurado
- [ ] Build funciona localmente
- [ ] Lint e typecheck passam
- [ ] Domínio customizado configurado (opcional)
- [ ] Analytics habilitado
- [ ] Monitoramento configurado
- [ ] Backup configurado
- [ ] Custos estimados

## Comandos Úteis

```bash
# Deploy manual
vercel --prod

# Ver logs
vercel logs

# Ver ambiente
vercel env ls

# Adicionar variável
vercel env add DATABASE_URL
```

## Suporte

- Vercel: https://vercel.com/support
- Neon: https://neon.tech/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://authjs.dev
