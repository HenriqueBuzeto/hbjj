# HBJJ - Database Hardening

## Visão Geral

Este documento descreve as melhorias de segurança e performance implementadas no banco de dados PostgreSQL via Prisma Schema.

## Índices Adicionados

### Índices de Performance

Índices adicionados em campos frequentemente usados em queries para melhorar performance:

#### Competition
- `userId` - queries de competições por usuário
- `eventDate` - queries de competições por data
- `status` - queries de competições por status

#### TrainingCamp
- `userId` - queries de camps por usuário
- `competitionId` - queries de camps por competição
- `status` - queries de camps por status
- `startDate` - queries de camps por data de início

#### TrainingSession
- `userId` - queries de sessões por usuário
- `campId` - queries de sessões por camp
- `scheduledDate` - queries de sessões por data
- `status` - queries de sessões por status

#### MealLog
- `userId` - queries de refeições por usuário
- `date` - queries de refeições por data

#### HydrationLog
- `userId` - queries de hidratação por usuário
- `date` - queries de hidratação por data

#### BodyProgressLog
- `userId` - queries de progresso por usuário
- `date` - queries de progresso por data

#### ReadinessLog
- `userId` - queries de readiness por usuário
- `date` - queries de readiness por data

#### DailyMission
- `userId` - queries de missões por usuário
- `date` - queries de missões por data
- `status` - queries de missões por status

#### XPEvent
- `userId` - queries de eventos XP por usuário
- `gamificationProfileId` - queries de eventos por perfil
- `createdAt` - queries de eventos por data

#### AIConversation
- `userId` - queries de conversas por usuário
- `createdAt` - queries de conversas por data

## Unique Constraints

Constraints existentes para garantir integridade dos dados:

- `User.email` - email único por usuário
- `Account.provider, providerAccountId` - conta única por provider
- `Session.sessionToken` - token de sessão único
- `AthleteProfile.userId` - perfil de atleta único por usuário
- `JiuJitsuProfile.userId` - perfil de jiu-jitsu único por usuário
- `MealLog.userId, date, mealType` - refeição única por usuário/data/tipo
- `HydrationLog.userId, date` - hidratação única por usuário/data
- `BodyProgressLog.userId, date` - progresso único por usuário/data
- `ReadinessLog.userId, date` - readiness único por usuário/data
- `DailyMission.userId, date, title` - missão única por usuário/data/título
- `GamificationProfile.userId` - perfil de gamificação único por usuário
- `Badge.name` - badge único por nome
- `UserBadge.userId, badgeId` - badge único por usuário/badge
- `YoutubeVideo.youtubeVideoId` - vídeo único por ID do YouTube
- `UserVideoFavorite.userId, youtubeVideoId` - favorito único por usuário/vídeo
- `CampWeek.campId, weekNumber` - semana única por camp/número

## Cascade Deletes

Todas as relações usam `onDelete: Cascade` para garantir integridade referencial:

- Quando um User é deletado:
  - Accounts, Sessions, AthleteProfile, JiuJitsuProfile são deletados
  - Competitions, TrainingCamps são deletados
  - NutritionTargets, MealLogs, HydrationLogs são deletados
  - BodyProgressLogs, ReadinessLogs são deletados
  - DailyMissions, GamificationProfile são deletados
  - XPEvents, UserBadges são deletados
  - AIConversations, AIRecommendations são deletados
  - UserVideoFavorites, TrainingSessions são deletados

- Quando uma Competition é deletada:
  - TrainingCamps relacionados são deletados

- Quando um TrainingCamp é deletado:
  - CampWeeks são deletados
  - TrainingSessions são deletados

- Quando uma MealLog é deletada:
  - MealItems são deletados

- Quando um BodyProgressLog é deletado:
  - ProgressPhotos são deletados

- Quando um AIConversation é deletado:
  - AIMessages são deletados

## Relações Obrigatórias

Relações marcadas como obrigatórias para garantir integridade:

- `User` → `AthleteProfile` (opcional)
- `User` → `JiuJitsuProfile` (opcional)
- `User` → `GamificationProfile` (opcional)
- `User` → `NutritionTargets` (opcional)

## Soft Delete

O modelo `User` possui campo `deletedAt` para soft delete:

```prisma
model User {
  // ...
  deletedAt DateTime?
  // ...
}
```

Para implementar soft delete funcional, adicionar queries com:

```prisma
prisma.user.findMany({
  where: { deletedAt: null }
})
```

## Melhorias Futuras

1. **Soft Delete Global**: Implementar soft delete em todas as tabelas principais
2. **Índices Compostos**: Adicionar índices compostos para queries complexas
3. **Partial Indexes**: Índices condicionais para melhorar performance
4. **Full Text Search**: Índices para busca de texto em mensagens da IA
5. **Partitioning**: Particionar tabelas grandes por data (logs, eventos)

## Migration

Para aplicar essas mudanças ao banco de dados:

```bash
npx prisma migrate dev --name database_hardening
```

## Verificação

Verificar índices no banco:

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Verificar constraints:

```sql
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid::regclass::text = 'users';
```
