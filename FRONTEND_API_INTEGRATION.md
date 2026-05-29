# HBJJ - Integração do Frontend com APIs Reais

## Resumo

Este documento explica como integrar o frontend do HBJJ com as APIs reais que foram implementadas, substituindo os dados mock por chamadas de API autenticadas.

## Pré-requisitos

- Autenticação NextAuth implementada (veja `AUTH_IMPLEMENTATION.md`)
- Dependências instaladas (`npm install`)
- Banco de dados configurado (Neon PostgreSQL)
- Sessão NextAuth funcionando

## Padrão de Integração

### 1. Hook de Sessão

Use o hook `useSession` do NextAuth para obter a sessão do usuário:

```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <LoadingSpinner />
  if (!session) return <Redirect to="/login" />
  
  // Renderizar componente
}
```

### 2. TanStack Query para Dados

Use TanStack Query (React Query) para buscar dados das APIs:

```typescript
import { useQuery } from '@tanstack/react-query'

function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })
  
  if (user.isLoading) return <LoadingSpinner />
  if (user.error) return <Error error={user.error} />
  
  return <div>Bem-vindo, {user.data.user.name}</div>
}
```

### 3. Mutações para Dados

Use `useMutation` para criar/atualizar dados:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function UpdateProfile() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/profile/athlete', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
  
  const handleSubmit = (data) => {
    mutation.mutate(data)
  }
}
```

## Integração por Tela

### 1. Dashboard (`app/dashboard/page.tsx`)

**APIs necessárias:**
- `GET /api/auth/me` - Dados do usuário
- `GET /api/camp/active` - Camp ativo
- `GET /api/missions/today` - Missões de hoje
- `GET /api/gamification` - Gamification (XP, streak)
- `GET /api/readiness/today` - Readiness de hoje

**Exemplo:**
```typescript
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

export default function Dashboard() {
  const { data: session } = useSession()
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/auth/me').then(r => r.json()),
    enabled: !!session,
  })
  
  const { data: camp } = useQuery({
    queryKey: ['camp', 'active'],
    queryFn: () => fetch('/api/camp/active').then(r => r.json()),
    enabled: !!session,
  })
  
  const { data: missions } = useQuery({
    queryKey: ['missions', 'today'],
    queryFn: () => fetch('/api/missions/today').then(r => r.json()),
    enabled: !!session,
  })
  
  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => fetch('/api/gamification').then(r => r.json()),
    enabled: !!session,
  })
  
  const { data: readiness } = useQuery({
    queryKey: ['readiness', 'today'],
    queryFn: () => fetch('/api/readiness/today').then(r => r.json()),
    enabled: !!session,
  })
  
  // Renderizar com dados reais ou empty states
}
```

### 2. Camp (`app/treinos/page.tsx`)

**APIs necessárias:**
- `GET /api/camp/active` - Camp ativo
- `GET /api/camp/generate` - Gerar novo camp
- `GET /api/training-sessions` - Sessões de treino
- `POST /api/training-sessions/[id]/complete` - Completar sessão

### 3. Coach IA (`app/coach/page.tsx`)

**APIs necessárias:**
- `GET /api/auth/me` - Contexto do usuário
- `POST /api/ai/chat` - Enviar mensagem para IA

**Exemplo:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function AIChat() {
  const queryClient = useQueryClient()
  
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
```

### 4. Nutrição (`app/alimentacao/page.tsx`)

**APIs necessárias:**
- `GET /api/nutrition/today` - Dados de hoje
- `GET /api/nutrition/targets` - Metas nutricionais
- `POST /api/meals` - Criar refeição
- `POST /api/hydration` - Logar água

### 5. Evolução (`app/evolucao/page.tsx`)

**APIs necessárias:**
- `GET /api/progress` - Logs de progresso
- `POST /api/progress` - Criar log
- `POST /api/progress/photos` - Upload de foto
- `DELETE /api/progress/photos` - Deletar foto

### 6. Perfil (`app/perfil/page.tsx`)

**APIs necessárias:**
- `GET /api/profile/athlete` - Perfil atleta
- `PUT /api/profile/athlete` - Atualizar perfil
- `GET /api/profile/jiu-jitsu` - Perfil Jiu-Jitsu
- `PUT /api/profile/jiu-jitsu` - Atualizar perfil

### 7. Onboarding (`app/signup/page.tsx`)

**Já integrado!**
- Usa `/api/auth/register` para criar usuário
- Usa NextAuth signIn para login automático
- Usa `/api/onboarding/complete` para salvar perfis
- Usa `/api/competitions` para criar competição

## Empty States

Quando não houver dados, mostre empty states bonitos em vez de mock:

```typescript
function EmptyState({ type }: { type: 'camp' | 'nutrition' | 'progress' }) {
  const messages = {
    camp: 'Você ainda não tem um camp ativo. Gere seu primeiro camp!',
    nutrition: 'Nenhum dado nutricional registrado hoje.',
    progress: 'Nenhum dado de evolução registrado.',
  }
  
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📊</div>
      <p className="text-zinc-400">{messages[type]}</p>
      <Button className="mt-4">Adicionar Dados</Button>
    </div>
  )
}
```

## Remoção de Mock Data

### 1. Remover `context/AppContext.tsx` Mock Data

O `AppContext` atualmente usa dados mock. Você pode:

**Opção A:** Manter o AppContext para estado local e usar APIs para dados persistentes
**Opção B:** Substituir completamente por TanStack Query

**Recomendado:** Opção A - Manter AppContext para UI state (tema, notificações) e usar TanStack Query para dados do servidor.

### 2. Remover `data/mockData.tsx`

Este arquivo pode ser removido ou mantido apenas como referência. Após a integração completa, pode ser deletado.

## Checklist de Integração

- [ ] Dashboard - Integrar APIs de camp, missions, gamification, readiness
- [ ] Camp - Integrar APIs de camp e training sessions
- [ ] Coach IA - Integrar API de chat
- [ ] Nutrição - Integrar APIs de targets, meals, hydration
- [ ] Evolução - Integrar APIs de progress e photos
- [ ] Perfil - Integrar APIs de athlete e jiu-jitsu profiles
- [ ] Readiness - Integrar APIs de check-in e history
- [ ] Reports - Integrar API de summary
- [ ] Adicionar empty states em todas as telas
- [ ] Testar fluxo completo (cadastro → dashboard → todas as telas)

## Padrão de Error Handling

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: async () => {
    const res = await fetch('/api/endpoint')
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to fetch')
    }
    return res.json()
  },
})

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error.message} />
if (!data) return <EmptyState />
```

## Padrão de Loading States

```typescript
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  )
}
```

## Conclusão

A integração do frontend com APIs reais deve ser feita tela por tela, usando TanStack Query para gerenciar dados e sessões NextAuth para autenticação. Não altere o visual aprovado - apenas substitua os dados mock por dados reais das APIs.
