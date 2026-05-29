# HBJJ - Security Hardening

## Visão Geral

Este documento descreve as medidas de segurança implementadas no HBJJ para proteger dados dos usuários e prevenir ataques.

## Autenticação

### NextAuth v5

Implementação de autenticação usando NextAuth v5 com Credentials Provider:

- **Cookies httpOnly**: Tokens JWT são armazenados em cookies httpOnly para prevenir XSS
- **Cookies secure**: Em produção, cookies são marcados como secure (HTTPS only)
- **Cookies sameSite**: Proteção contra CSRF com sameSite=lax
- **JWT Session**: Sessões são JWT stateless, sem dados sensíveis no token
- **Password Hashing**: Senhas são hasheadas usando bcryptjs
- **Session Expiration**: Sessões expiram após período configurado

### Proteção de Rotas

Middleware Next.js protege rotas privadas:

```typescript
// middleware.ts
export { default } from "next-auth/middleware"
export const config = { matcher: ["/dashboard/:path*", "/treinos/:path*", ...] }
```

Rotas não autenticadas redirecionam para `/login`.

## Rate Limiting

### Implementação

Rate limiting em memória para proteção contra abuso:

- **Login**: 5 tentativas por 15 minutos
- **Register**: 3 tentativas por hora
- **Coach IA**: 50 mensagens por dia por usuário
- **Upload**: 10 uploads por hora

### Headers de Resposta

APIs retornam headers de rate limit:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2024-05-29T21:30:00Z
```

### Código HTTP 429

Quando limite é excedido, retorna HTTP 429 com mensagem amigável.

## Segurança da IA

### Sanitização de Input

Mensagens são sanitizadas antes de serem processadas:

- Trim de espaços
- Limitado a 1000 caracteres
- Validação de tamanho mínimo (3 caracteres)

### Bloqueio de Conteúdo Perigoso

Palavras-chave perigosas são bloqueadas automaticamente:

- "corte extremo", "jejum prolongado"
- "diurético", "laxativo", "medicamento"
- "anabolizante", "esteróide"
- "autolesão", "bulimia", "anorexia"
- "perigo", "emergência", "hospital"

### Fallback Responses

Quando OpenAI falha ou conteúdo é perigoso, respostas seguras são usadas:

- Mensagens sobre dor/lesão → Recomendação de consultar médico
- Mensagens sobre peso → Recomendação de nutricionista
- Conteúdo perigoso → Bloqueio com aviso de segurança
- Erro técnico → Mensagem genérica de fallback

### Limites de Token

- Max tokens: 1000 (configurável via `AI_MAX_TOKENS`)
- Tokens usados são salvos no banco para monitoramento

## Validação de Dados

### Zod Schemas

Todas as APIs usam Zod para validação:

```typescript
import { registerSchema } from '@/lib/validations/auth'
const validatedData = registerSchema.parse(body)
```

Schemas disponíveis:
- `registerSchema` - Registro de usuário
- `athleteProfileSchema` - Perfil de atleta
- `jiuJitsuProfileSchema` - Perfil de jiu-jitsu
- `competitionSchema` - Competição

## Proteção contra Injeção SQL

### Prisma ORM

Todas as queries usam Prisma ORM, que protege contra SQL injection:

```typescript
// Seguro - Prisma escapa automaticamente
const user = await prisma.user.findUnique({
  where: { email: userInput }
})
```

## CORS

### Configuração

API routes não têm CORS explícito (same-origin por padrão em Next.js).

Para implementar CORS customizado, adicionar em `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ]
  },
}
```

## Environment Variables

### Variáveis Sensíveis

Variáveis sensíveis devem estar no `.env` (não commitado):

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=valor-seguro-aleatorio
OPENAI_API_KEY=sk-...
BLOB_READ_WRITE_TOKEN=vercel_blob_token
```

### Geração de Secret

Gerar `NEXTAUTH_SECRET` seguro:

```bash
openssl rand -base64 32
```

## Headers de Segurança

### Recomendados para Produção

Adicionar em `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}
```

## Upload Seguro

### Validações a Implementar

Quando implementar upload de fotos:

- **Tipo de arquivo**: Apenas image/jpeg, image/png, image/webp
- **Tamanho máximo**: 5MB por arquivo
- **Validação de MIME type**: Verificar real MIME type, não apenas extensão
- **Nome de arquivo**: Gerar nome aleatório, não usar nome original
- **Storage**: Usar Vercel Blob ou S3, não salvar base64 no banco
- **Dono da imagem**: Verificar se usuário é dono antes de permitir exclusão

## Logging e Monitoramento

### Logs de Erro

Erros são logados no console para debug. Em produção:

- Usar serviço de logging (Sentry, LogRocket)
- Logar tentativas de login falhadas
- Logar rate limit violations
- Logar erros da API da IA

### Alertas

Configurar alertas para:
- Muitas tentativas de login falhadas (possível ataque)
- Erros da API da IA (possível problema de billing)
- Erros de banco de dados

## HTTPS

### Produção

- Usar HTTPS obrigatório
- Redirecionar HTTP para HTTPS
- Configurar certificado SSL/TLS válido

## Backup de Banco

### Neon PostgreSQL

Neon oferece backups automáticos. Verificar:
- Retenção de backups (7 dias por padrão)
- Point-in-time recovery
- Replicação para alta disponibilidade

## Auditoria

### Logs de Ação

Considerar adicionar logs de auditoria para:
- Login/logout
- Mudanças de perfil
- Criação/deleção de competição
- Acesso a dados sensíveis

## Compliance

### LGPD

- Dados pessoais são coletados apenas quando necessário
- Usuário pode solicitar exclusão de dados
- Dados são armazenados em servidor seguro (Neon, EUA)
- Política de privacidade deve estar disponível

## Checklist de Segurança

- [ ] NEXTAUTH_SECRET configurado e seguro
- [ ] DATABASE_URL não está exposta
- [ ] Rate limit está ativo em endpoints críticos
- [ ] IA bloqueia conteúdo perigoso
- [ ] Todas as APIs validam input com Zod
- [ ] Prisma é usado para todas as queries (sem SQL raw)
- [ ] Cookies são httpOnly e secure em produção
- [ ] Middleware protege rotas privadas
- [ ] Senhas são hasheadas com bcrypt
- [ ] Logs de erro não expõem dados sensíveis
- [ ] Variáveis de ambiente não estão commitadas
- [ ] HTTPS está configurado em produção
