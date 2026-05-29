# HBJJ - QA Final Checklist

## Checklist de QA para Produção

### Pré-requisitos
- [ ] Arquivo `.env` criado e configurado com `DATABASE_URL` do Neon PostgreSQL
- [ ] `NEXTAUTH_SECRET` configurado com valor seguro
- [ ] `OPENAI_API_KEY` configurado (opcional, para Coach IA)
- [ ] Dependências instaladas (`npm install`)

### Comandos de QA

#### 1. Instalação de Dependências
```bash
npm install
```
**Critério de sucesso**: Instalação sem erros, ts-node instalado

#### 2. Gerar Cliente Prisma
```bash
npx prisma generate
```
**Critério de sucesso**: Cliente gerado sem erros de validação

#### 3. Migrar Banco de Dados
```bash
npx prisma migrate dev --name init
```
**Critério de sucesso**: Migration criada e aplicada sem erros

#### 4. Seed do Banco
```bash
npx prisma db seed
```
**Critério de sucesso**: Badges e vídeos de exemplo criados

#### 5. Typecheck
```bash
npm run typecheck
```
**Critério de sucesso**: Zero erros de TypeScript

#### 6. Lint
```bash
npm run lint
```
**Critério de sucesso**: Zero erros de lint (warnings aceitáveis)

#### 7. Build
```bash
npm run build
```
**Critério de sucesso**: Build completo sem erros

### Testes Manuais

#### Autenticação
- [ ] Criar conta com email e senha
- [ ] Fazer login com credenciais corretas
- [ ] Tentar login com senha incorreta (deve falhar)
- [ ] Fazer logout
- [ ] Tentar acessar rota privada sem login (deve redirecionar para /login)

#### Dashboard
- [ ] Dashboard carrega com dados reais
- [ ] Empty state aparece quando não há camp ativo
- [ ] CTA "Criar meu primeiro camp" funciona

#### Nutrição
- [ ] Empty state aparece quando não há refeições
- [ ] CTA "Registrar primeira refeição" funciona
- [ ] Adicionar refeição salva dados reais
- [ ] Hidratação registra dados corretamente

#### Evolução
- [ ] Empty state aparece quando não há registros
- [ ] CTA "Registrar peso da semana" funciona
- [ ] Gráfico de peso exibe dados reais

#### Coach IA
- [ ] Empty state aparece quando não há conversa
- [ ] Enviar mensagem gera resposta
- [ ] Rate limit funciona após 50 mensagens
- [ ] Conteúdo perigoso é bloqueado
- [ ] Fallback funciona quando OpenAI falha

#### Perfil
- [ ] Dados do perfil carregam corretamente
- [ ] Logout funciona e redireciona para login

### Critérios de Aceitação

#### Funcional
- [ ] Build passa sem erros
- [ ] Typecheck passa sem erros
- [ ] Lint passa sem erros
- [ ] Prisma migrate funciona
- [ ] Seed funciona

#### Segurança
- [ ] Login real funciona
- [ ] Nenhuma tela principal usa mock
- [ ] Nenhuma API aceita userId do frontend
- [ ] Rotas privadas estão protegidas
- [ ] Rate limit está ativo
- [ ] IA tem segurança mínima
- [ ] Banco tem índices e constraints

#### UX
- [ ] Empty states estão profissionais
- [ ] Loading states funcionam
- [ ] Error states são tratados

### Comandos Rápidos

```bash
# QA completo
npm install && \
npx prisma generate && \
npx prisma migrate dev --name init && \
npx prisma db seed && \
npm run typecheck && \
npm run lint && \
npm run build
```

### Problemas Comuns

**Erro: Environment variable not found: DATABASE_URL**
- Solução: Criar arquivo `.env` com base no `.env.example`
- Preencher `DATABASE_URL` com credenciais do Neon PostgreSQL

**Erro: Prisma schema validation**
- Solução: Rodar `npx prisma format` para formatar o schema

**Erro: ts-node not found**
- Solução: `npm install -D ts-node typescript @types/node`

**Erro: Rate limit errors durante QA**
- Solução: Normal durante desenvolvimento, limpar cache se necessário
