# Documentação do Banco de Dados - HBJJ

## Visão Geral

Banco de dados PostgreSQL projetado para aplicação de gerenciamento de atletas de Jiu-Jitsu, com foco em gamificação, acompanhamento de treinos, nutrição e competição.

## Estrutura do Banco

### 1. Autenticação e Usuários

#### `users`
Tabela principal de usuários com autenticação e perfil.

**Campos:**
- `id` (String, PK): Identificador único (CUID)
- `name` (String, nullable): Nome do usuário
- `email` (String, unique): Email de acesso
- `emailVerified` (DateTime, nullable): Data de verificação do email
- `image` (String, nullable): URL da foto de perfil
- `passwordHash` (String, nullable): Hash da senha (bcrypt)
- `role` (String): Papel do usuário (athlete, admin)
- `plan` (String): Plano de assinatura (free, pro, elite)
- `createdAt` (DateTime): Data de criação
- `updatedAt` (DateTime): Data de última atualização
- `deletedAt` (DateTime, nullable): Soft delete

**Índices:**
- `idx_users_email` no campo `email`

**Relações:**
- 1:N com `accounts`
- 1:N com `sessions`
- 1:1 com `athlete_profile`
- 1:1 com `jiu_jitsu_profile`
- 1:N com `competitions`
- 1:N com `training_camps`
- 1:1 com `nutrition_targets`
- 1:N com `meal_logs`
- 1:N com `hydration_logs`
- 1:N com `body_progress_logs`
- 1:N com `daily_missions`
- 1:1 com `gamification_profile`
- 1:N com `xp_events`
- 1:N com `user_badges`
- 1:N com `readiness_logs`
- 1:N com `ai_conversations`
- 1:N with `ai_recommendations`
- 1:N with `user_video_favorites`
- 1:N with `training_sessions`

#### `accounts`
Contas de autenticação OAuth (Google, Facebook, etc).

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `type` (String): Tipo de conta (oauth, email)
- `provider` (String): Provedor (google, facebook, credentials)
- `providerAccountId` (String): ID do provedor
- `refresh_token` (Text, nullable): Token de refresh
- `access_token` (Text, nullable): Token de acesso
- `expires_at` (Int, nullable): Timestamp de expiração
- `token_type` (String, nullable): Tipo de token
- `scope` (String, nullable): Escopo do token
- `id_token` (Text, nullable): ID token JWT
- `session_state` (String, nullable): Estado da sessão

**Constraints:**
- Unique: `[provider, providerAccountId]`

**Relações:**
- N:1 com `users`

#### `sessions`
Sessões de autenticação ativas.

**Campos:**
- `id` (String, PK)
- `sessionToken` (String, unique): Token da sessão
- `userId` (String, FK): Referência para users
- `expires` (DateTime): Data de expiração

**Relações:**
- N:1 com `users`

#### `verification_tokens`
Tokens para verificação de email e reset de senha.

**Campos:**
- `identifier` (String): Email do usuário
- `token` (String): Token de verificação
- `expires` (DateTime): Data de expiração

**Constraints:**
- Unique: `[identifier, token]`

### 2. Perfis do Atleta

#### `athlete_profiles`
Perfil físico e metas do atleta.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK, unique): Referência para users
- `age` (Int, nullable): Idade
- `heightCm` (Int, nullable): Altura em centímetros
- `currentWeightKg` (Float, nullable): Peso atual em kg
- `targetWeightKg` (Float, nullable): Peso alvo em kg
- `city` (String, nullable): Cidade
- `sex` (String, nullable): Sexo (male, female)
- `mainGoal` (String, nullable): Objetivo principal (lose, maintain, gain, performance)
- `intensityLevel` (String, nullable): Nível de intensidade (light, moderate, heavy, competitor)
- `isCompetitor` (Boolean): Se é competidor
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- 1:1 com `users`

#### `jiu_jitsu_profiles`
Perfil específico de Jiu-Jitsu.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK, unique): Referência para users
- `belt` (String, nullable): Faixa (white, blue, purple, brown, black)
- `teamName` (String, nullable): Nome da equipe
- `academyName` (String, nullable): Nome da academia
- `coachName` (String, nullable): Nome do professor
- `yearsTraining` (Int, nullable): Anos de treino
- `trainsGi` (Boolean): Treina com kimono
- `trainsNogi` (Boolean): Treina sem kimono
- `weeklySessions` (Int, nullable): Sessões semanais
- `preferredTrainingTime` (String, nullable): Horário preferido
- `weightCategory` (String, nullable): Categoria de peso
- `fightingStyleNotes` (Text, nullable): Notas sobre estilo de luta
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- 1:1 com `users`

### 3. Competições e Camps

#### `competitions`
Competições que o usuário está participando.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `name` (String): Nome da competição
- `organization` (String, nullable): Organizadora
- `eventDate` (DateTime): Data do evento
- `modality` (String[]): Modalidades (Gi, No-Gi)
- `currentWeightKg` (Float, nullable): Peso atual
- `targetWeightKg` (Float, nullable): Peso alvo
- `weightLimitKg` (Float, nullable): Limite de peso
- `daysRemaining` (Int, nullable): Dias restantes (calculado automaticamente)
- `status` (String): Status (upcoming, active, completed, cancelled)
- `priority` (String): Prioridade (low, medium, high)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Índices:**
- `idx_competitions_user_id`
- `idx_competitions_event_date`
- `idx_competitions_status`

**Relações:**
- N:1 com `users`
- 1:N com `training_camps`

#### `training_camps`
Camps de preparação para competições.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `competitionId` (String, FK, nullable): Referência para competitions
- `name` (String): Nome do camp
- `startDate` (DateTime): Data de início
- `endDate` (DateTime): Data de término
- `currentPhase` (String, nullable): Fase atual (base, build, peak, taper)
- `totalWeeks` (Int): Total de semanas
- `currentWeek` (Int): Semana atual
- `status` (String): Status (planned, active, completed, cancelled)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Índices:**
- `idx_training_camps_user_id`
- `idx_training_camps_competition_id`
- `idx_training_camps_status`
- `idx_training_camps_start_date`

**Relações:**
- N:1 com `users`
- N:1 com `competitions`
- 1:N com `camp_weeks`
- 1:N com `training_sessions`

#### `camp_weeks`
Semanas do camp de treinamento.

**Campos:**
- `id` (String, PK)
- `campId` (String, FK): Referência para training_camps
- `weekNumber` (Int): Número da semana
- `phaseName` (String, nullable): Nome da fase
- `goal` (Text, nullable): Objetivo da semana
- `volumeLevel` (String, nullable): Nível de volume (low, medium, high)
- `intensityLevel` (String, nullable): Nível de intensidade
- `notes` (Text, nullable): Notas
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Constraints:**
- Unique: `[campId, weekNumber]`

**Relações:**
- N:1 com `training_camps`

#### `training_sessions`
Sessões de treino individuais.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `campId` (String, FK, nullable): Referência para training_camps
- `title` (String): Título da sessão
- `type` (String): Tipo (drilling, sparring, conditioning, technique)
- `modality` (String, nullable): Modalidade (gi, nogi)
- `scheduledDate` (DateTime): Data agendada
- `scheduledTime` (String, nullable): Horário agendado
- `durationMinutes` (Int, nullable): Duração em minutos
- `intensity` (String, nullable): Intensidade (low, medium, high)
- `status` (String): Status (scheduled, completed, skipped, cancelled)
- `caloriesEstimate` (Int, nullable): Estimativa de calorias
- `notes` (Text, nullable): Notas
- `completedAt` (DateTime, nullable): Data de conclusão
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Índices:**
- `idx_training_sessions_user_id`
- `idx_training_sessions_camp_id`
- `idx_training_sessions_scheduled_date`
- `idx_training_sessions_status`

**Relações:**
- N:1 com `users`
- N:1 com `training_camps`
- 1:N com `training_exercises`

#### `training_exercises`
Exercícios dentro de uma sessão de treino.

**Campos:**
- `id` (String, PK)
- `trainingSessionId` (String, FK): Referência para training_sessions
- `name` (String): Nome do exercício
- `sets` (Int, nullable): Número de séries
- `reps` (Int, nullable): Número de repetições
- `durationSeconds` (Int, nullable): Duração em segundos
- `restSeconds` (Int, nullable): Descanso em segundos
- `loadKg` (Float, nullable): Carga em kg
- `instructions` (Text, nullable): Instruções
- `orderIndex` (Int): Ordem do exercício
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- N:1 com `training_sessions`

### 4. Nutrição e Hidratação

#### `nutrition_targets`
Metas nutricionais do usuário.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK, unique): Referência para users
- `caloriesTarget` (Int, nullable): Meta de calorias
- `proteinTargetG` (Float, nullable): Meta de proteína em gramas
- `carbsTargetG` (Float, nullable): Meta de carboidratos em gramas
- `fatTargetG` (Float, nullable): Meta de gordura em gramas
- `waterTargetMl` (Int, nullable): Meta de água em ml
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- 1:1 com `users`

#### `meal_logs`
Registros de refeições diárias.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `date` (Date): Data da refeição
- `mealType` (String): Tipo (breakfast, lunch, snack, dinner)
- `totalCalories` (Int): Total de calorias
- `totalProteinG` (Float): Total de proteína em gramas
- `totalCarbsG` (Float): Total de carboidratos em gramas
- `totalFatG` (Float): Total de gordura em gramas
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Constraints:**
- Unique: `[userId, date, mealType]`

**Índices:**
- `idx_meal_logs_user_id`
- `idx_meal_logs_date`

**Relações:**
- N:1 com `users`
- 1:N com `meal_items`

#### `meal_items`
Itens individuais de uma refeição.

**Campos:**
- `id` (String, PK)
- `mealLogId` (String, FK): Referência para meal_logs
- `name` (String): Nome do alimento
- `quantity` (Float, nullable): Quantidade
- `unit` (String, nullable): Unidade (g, ml, cup, etc)
- `calories` (Int): Calorias
- `proteinG` (Float): Proteína em gramas
- `carbsG` (Float): Carboidratos em gramas
- `fatG` (Float): Gordura em gramas
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- N:1 com `meal_logs`

#### `hydration_logs`
Registros de hidratação diária.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `date` (Date): Data
- `amountMl` (Int): Quantidade em ml
- `createdAt` (DateTime)

**Constraints:**
- Unique: `[userId, date]`

**Índices:**
- `idx_hydration_logs_user_id`
- `idx_hydration_logs_date`

**Relações:**
- N:1 com `users`

### 5. Progresso e Prontidão

#### `body_progress_logs`
Registros de progresso físico.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `date` (Date): Data do registro
- `weightKg` (Float, nullable): Peso em kg
- `waistCm` (Float, nullable): Circunferência da cintura
- `chestCm` (Float, nullable): Circunferência do peito
- `armCm` (Float, nullable): Circunferência do braço
- `legCm` (Float, nullable): Circunferência da perna
- `cardioScore` (Int, nullable): Score cardiovascular (1-10)
- `strengthScore` (Int, nullable): Score de força (1-10)
- `mobilityScore` (Int, nullable): Score de mobilidade (1-10)
- `recoveryScore` (Int, nullable): Score de recuperação (1-10)
- `fatigueLevel` (Int, nullable): Nível de fadiga (1-10)
- `sleepHours` (Float, nullable): Horas de sono
- `notes` (Text, nullable): Notas
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Constraints:**
- Unique: `[userId, date]`

**Índices:**
- `idx_body_progress_logs_user_id`
- `idx_body_progress_logs_date`

**Relações:**
- N:1 com `users`
- 1:N com `progress_photos`

#### `progress_photos`
Fotos de progresso físico.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `progressLogId` (String, FK): Referência para body_progress_logs
- `photoType` (String): Tipo (front, side, back)
- `imageUrl` (String): URL da imagem
- `storageKey` (String): Chave de armazenamento
- `createdAt` (DateTime)

**Relações:**
- N:1 com `body_progress_logs`

#### `readiness_logs`
Registros de prontidão para treino.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `date` (Date): Data do registro
- `gasScore` (Int, nullable): Score de energia (1-10)
- `strengthScore` (Int, nullable): Score de força (1-10)
- `mobilityScore` (Int, nullable): Score de mobilidade (1-10)
- `recoveryScore` (Int, nullable): Score de recuperação (1-10)
- `weightScore` (Int, nullable): Score de peso (1-10)
- `overallScore` (Int, nullable): Score geral (calculado automaticamente)
- `notes` (Text, nullable): Notas
- `createdAt` (DateTime)

**Constraints:**
- Unique: `[userId, date]`

**Índices:**
- `idx_readiness_logs_user_id`
- `idx_readiness_logs_date`

**Relações:**
- N:1 com `users`

### 6. Gamificação

#### `daily_missions`
Missões diárias para o usuário.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `date` (Date): Data da missão
- `title` (String): Título da missão
- `description` (Text, nullable): Descrição
- `category` (String): Categoria (water, food, exercise, recovery)
- `xpReward` (Int): Recompensa em XP
- `status` (String): Status (pending, completed, skipped)
- `completedAt` (DateTime, nullable): Data de conclusão
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Constraints:**
- Unique: `[userId, date, title]`

**Índices:**
- `idx_daily_missions_user_id`
- `idx_daily_missions_date`
- `idx_daily_missions_status`

**Relações:**
- N:1 com `users`

#### `gamification_profiles`
Perfil de gamificação do usuário.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK, unique): Referência para users
- `level` (Int): Nível atual
- `totalXp` (Int): Total de XP acumulado
- `currentStreak` (Int): Streak atual de dias
- `longestStreak` (Int): Maior streak alcançado
- `lastActivityDate` (DateTime, nullable): Data da última atividade
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- 1:1 com `users`
- 1:N com `xp_events`
- 1:N com `user_badges`

#### `xp_events`
Eventos de ganho de XP.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `gamificationProfileId` (String, FK, nullable): Referência para gamification_profiles
- `sourceType` (String): Tipo de fonte (training, nutrition, hydration, mission, camp, checkin, badge)
- `sourceId` (String, nullable): ID da fonte
- `xpAmount` (Int): Quantidade de XP
- `description` (String, nullable): Descrição
- `createdAt` (DateTime)

**Índices:**
- `idx_xp_events_user_id`
- `idx_xp_events_gamification_profile_id`
- `idx_xp_events_created_at`

**Relações:**
- N:1 com `users`
- N:1 com `gamification_profiles`

#### `badges`
Badges disponíveis no sistema.

**Campos:**
- `id` (String, PK)
- `name` (String, unique): Nome da badge
- `description` (Text): Descrição
- `icon` (String, nullable): Ícone (emoji)
- `requirementType` (String, nullable): Tipo de requisito (streak, xp, camps, missions)
- `requirementValue` (Int, nullable): Valor do requisito
- `createdAt` (DateTime)

**Relações:**
- 1:N com `user_badges`

#### `user_badges`
Badges conquistadas pelo usuário.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `gamificationProfileId` (String, FK, nullable): Referência para gamification_profiles
- `badgeId` (String, FK): Referência para badges
- `earnedAt` (DateTime): Data de conquista

**Constraints:**
- Unique: `[userId, badgeId]`

**Relações:**
- N:1 com `users`
- N:1 com `gamification_profiles`
- N:1 com `badges`

### 7. AI Coach

#### `ai_conversations`
Conversas com o Coach IA.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `title` (String, nullable): Título da conversa
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Índices:**
- `idx_ai_conversations_user_id`
- `idx_ai_conversations_created_at`

**Relações:**
- N:1 com `users`
- 1:N com `ai_messages`

#### `ai_messages`
Mensagens individuais em uma conversa.

**Campos:**
- `id` (String, PK)
- `conversationId` (String, FK): Referência para ai_conversations
- `role` (String): Papel (user, assistant, system)
- `content` (Text): Conteúdo da mensagem
- `tokensUsed` (Int, nullable): Tokens usados
- `createdAt` (DateTime)

**Relações:**
- N:1 com `ai_conversations`

#### `ai_recommendations`
Recomendações geradas pela IA.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `type` (String): Tipo (week_plan, nutrition, recovery, technique)
- `title` (String): Título
- `content` (Text): Conteúdo da recomendação
- `contextJson` (Json, nullable): Contexto adicional
- `modelUsed` (String, nullable): Modelo de IA usado
- `tokensUsed` (Int, nullable): Tokens usados
- `expiresAt` (DateTime, nullable): Data de expiração
- `createdAt` (DateTime)

**Relações:**
- N:1 com `users`

### 8. Vídeos do YouTube

#### `youtube_videos`
Vídeos do YouTube recomendados.

**Campos:**
- `id` (String, PK)
- `title` (String): Título do vídeo
- `channelName` (String, nullable): Nome do canal
- `youtubeVideoId` (String, unique): ID do vídeo no YouTube
- `url` (String): URL do vídeo
- `thumbnailUrl` (String, nullable): URL da thumbnail
- `category` (String, nullable): Categoria (technique, drill, strength, mobility)
- `beltLevel` (String, nullable): Nível de faixa
- `modality` (String, nullable): Modalidade (gi, nogi)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relações:**
- 1:N com `user_video_favorites`

#### `user_video_favorites`
Vídeos favoritos do usuário.

**Campos:**
- `id` (String, PK)
- `userId` (String, FK): Referência para users
- `youtubeVideoId` (String, FK): Referência para youtube_videos
- `createdAt` (DateTime)

**Constraints:**
- Unique: `[userId, youtubeVideoId]`

**Relações:**
- N:1 com `users`
- N:1 com `youtube_videos`

## Functions (Funções)

### `calculate_user_total_xp(p_user_id TEXT)`
Calcula o total de XP acumulado por um usuário.

**Retorno:** INTEGER - Total de XP

**Uso:**
```sql
SELECT calculate_user_total_xp('user_id_here');
```

### `calculate_user_level(p_total_xp INTEGER)`
Calcula o nível do usuário baseado no total de XP.

**Fórmula:** `level = FLOOR(SQRT(xp / 100)) + 1`

**Retorno:** INTEGER - Nível do usuário

**Uso:**
```sql
SELECT calculate_user_level(1000);
```

### `user_has_activity_today(p_user_id TEXT)`
Verifica se o usuário tem atividade completada hoje.

**Retorno:** BOOLEAN

**Uso:**
```sql
SELECT user_has_activity_today('user_id_here');
```

### `calculate_current_streak(p_user_id TEXT)`
Calcula o streak atual de dias consecutivos com atividade.

**Retorno:** INTEGER - Número de dias do streak

**Uso:**
```sql
SELECT calculate_current_streak('user_id_here');
```

### `calculate_readiness_score(...)`
Calcula o score geral de prontidão baseado nos componentes individuais.

**Parâmetros:**
- `p_gas_score` (INTEGER): Score de energia
- `p_strength_score` (INTEGER): Score de força
- `p_mobility_score` (INTEGER): Score de mobilidade
- `p_recovery_score` (INTEGER): Score de recuperação
- `p_weight_score` (INTEGER): Score de peso

**Fórmula de pesos:**
- Gas: 30%
- Strength: 20%
- Mobility: 15%
- Recovery: 20%
- Weight: 15%

**Retorno:** INTEGER - Score geral (1-10)

**Uso:**
```sql
SELECT calculate_readiness_score(7, 8, 6, 7, 7);
```

### `user_qualifies_for_badge(p_user_id TEXT, p_badge_id TEXT)`
Verifica se o usuário atende aos requisitos para uma badge específica.

**Retorno:** BOOLEAN

**Uso:**
```sql
SELECT user_qualifies_for_badge('user_id_here', 'badge_id_here');
```

### `get_active_competition(p_user_id TEXT)`
Retorna a competição ativa do usuário.

**Retorno:** TEXT - ID da competição ou NULL

**Uso:**
```sql
SELECT get_active_competition('user_id_here');
```

**Nota:** Coluna `eventDate` usa aspas duplas pois é camelCase no PostgreSQL.

### `calculate_competition_days_remaining(p_event_date TIMESTAMP)`
Calcula os dias restantes até a competição.

**Parâmetros:**
- `p_event_date`: Timestamp da data do evento

**Retorno:** INTEGER - Dias restantes ou NULL

**Nota:** Recebe event_date diretamente para funcionar em BEFORE INSERT onde o ID ainda não existe.

**Uso:**
```sql
SELECT calculate_competition_days_remaining('2024-12-31'::timestamp);
```

## Triggers (Gatilhos)

### `trigger_update_gamification_on_xp`
Atualiza automaticamente o perfil de gamificação quando XP é adicionado.

**Tabela:** `xp_events`
**Evento:** AFTER INSERT
**Função:** `update_gamification_profile_on_xp()`

**Comportamento:**
- Calcula novo total de XP
- Atualiza nível do usuário
- Atualiza perfil de gamificação

### `trigger_update_streak_on_mission`
Atualiza automaticamente o streak quando uma missão é completada.

**Tabela:** `daily_missions`
**Evento:** AFTER UPDATE
**Função:** `update_streak_on_mission_complete()`

**Comportamento:**
- Verifica se missão foi completada
- Incrementa streak se atividade foi ontem ou hoje
- Reseta streak se houve gap
- Atualiza maior streak se necessário

### `trigger_auto_calculate_readiness`
Calcula automaticamente o score geral de prontidão.

**Tabela:** `readiness_logs`
**Evento:** BEFORE INSERT OR UPDATE
**Função:** `auto_calculate_readiness_score()`

**Comportamento:**
- Calcula média ponderada dos componentes
- Preenche `overallScore` automaticamente

### `trigger_update_competition_days`
Atualiza automaticamente os dias restantes da competição.

**Tabela:** `competitions`
**Evento:** BEFORE INSERT OR UPDATE
**Função:** `update_competition_days_remaining()`

**Comportamento:**
- Calcula dias restantes baseado na data do evento
- Atualiza campo `daysRemaining`

### `trigger_soft_delete_user`
Implementa soft delete para usuários.

**Tabela:** `users`
**Evento:** BEFORE UPDATE
**Função:** `soft_delete_user()`

**Comportamento:**
- Marca registros relacionados quando usuário é deletado
- Aplicação deve filtrar registros deletados

## Stored Procedures (Procedimentos)

### `check_and_award_badges(p_user_id TEXT)`
Verifica e concede badges automaticamente baseado nos requisitos.

**Comportamento:**
- Percorre todas as badges disponíveis
- Verifica se usuário já tem a badge
- Verifica se usuário atende requisitos
- Concede badge se qualificado
- Cria evento de XP pela conquista

**Uso:**
```sql
CALL check_and_award_badges('user_id_here');
```

### `cleanup_old_logs(p_days_to_keep INTEGER DEFAULT 90)`
Remove logs antigos para manter performance do banco.

**Parâmetros:**
- `p_days_to_keep`: Dias para manter (padrão: 90)

**Comportamento:**
- Deleta logs de hidratação antigos
- Deleta logs de refeições antigos
- Deleta logs de prontidão antigos
- **NÃO deleta body_progress_logs** - são dados críticos do atleta
- Deleta recomendações de IA expiradas

**Uso:**
```sql
CALL cleanup_old_logs(90);
```

### `recalculate_all_user_stats()`
Procedimento de manutenção para recalcular estatísticas de todos os usuários.

**Comportamento:**
- Percorre todos os usuários ativos
- Recalcula total de XP
- Recalcula nível
- Recalcula streak atual
- Atualiza maior streak se necessário

**Uso:**
```sql
CALL recalculate_all_user_stats();
```

### `generate_daily_missions(p_user_id TEXT, p_date DATE DEFAULT CURRENT_DATE)`
Gera missões diárias padrão para um usuário.

**Parâmetros:**
- `p_user_id`: ID do usuário
- `p_date`: Data (padrão: hoje)

**Comportamento:**
- Verifica se missões já existem
- Cria missão de água (10 XP)
- Cria missão de nutrição (15 XP)
- Cria missão de exercício (25 XP)
- Cria missão de recuperação (10 XP)

**Uso:**
```sql
CALL generate_daily_missions('user_id_here', CURRENT_DATE);
```

## Views (Visões)

### `user_dashboard_summary`
Visão consolidada do dashboard do usuário.

**Campos:**
- user_id, name, email
- level, total_xp, current_streak, longest_streak
- total_camps, total_sessions, total_competitions, total_badges

**Uso:**
```sql
SELECT * FROM user_dashboard_summary WHERE user_id = 'user_id_here';
```

### `active_competitions_view`
Visão de competições ativas com informações do camp.

**Campos:**
- Informações da competição
- Informações do camp associado
- Status e progresso

**Uso:**
```sql
SELECT * FROM active_competitions_view WHERE user_id = 'user_id_here';
```

### `today_missions_summary`
Visão resumida das missões de hoje.

**Campos:**
- user_id
- total_missions, completed, pending
- xp_earned, total_xp_available

**Uso:**
```sql
SELECT * FROM today_missions_summary;
```

## Índices de Performance

### Índices Compostos
- `idx_xp_events_user_created`: (user_id, created_at DESC)
- `idx_daily_missions_user_date_status`: (user_id, date, status)
- `idx_training_sessions_user_date_status`: (user_id, scheduled_date, status)
- `idx_meal_logs_user_date`: (user_id, date DESC)
- `idx_competitions_user_status_date`: (user_id, status, event_date)
- `idx_ai_conversations_user_created`: (user_id, created_at DESC)
- `idx_training_camps_user_status`: (user_id, status)
- `idx_body_progress_logs_user_date`: (user_id, date DESC)

## Políticas de Retenção de Dados

- **Logs de hidratação:** 90 dias
- **Logs de refeições:** 90 dias
- **Logs de prontidão:** 90 dias
- **Logs de progresso corporal:** Mantidos indefinidamente (dados críticos do atleta)
- **Recomendações de IA:** Expiração definida por campo
- **Conversas de IA:** Mantidas indefinidamente
- **XP Events:** Mantidos indefinidamente (histórico de gamificação)

## Segurança

### Soft Delete
- Tabela `users` tem campo `deletedAt`
- Aplicação deve sempre filtrar `WHERE deletedAt IS NULL`
- Trigger `trigger_soft_delete_user` marca quando usuário é deletado
- Cascade delete lógico é responsabilidade da aplicação para evitar perda de dados

### Cascade Deletes
- Relações com `onDelete: Cascade` removem registros automaticamente
- Usado para dados dependentes (sessions, accounts, logs)

### Unique Constraints
- Email do usuário
- Session token
- Provider account ID
- User badge (um usuário não pode ter a mesma badge duas vezes)
- Meal log por usuário, data e tipo
- Hydration log por usuário e data
- Body progress log por usuário e data
- Readiness log por usuário e data
- Daily mission por usuário, data e título
- Camp week por camp e número da semana

### Seed em Produção
- O seed verifica `NODE_ENV === 'production'` e não executa em produção
- Usuário de teste `test@hbjj.com` nunca será criado em produção

## Como Executar as Migrations

### 1. Gerar Prisma Client
```bash
npx prisma generate
```

### 2. Executar Migration
```bash
npx prisma migrate dev
```

### 3. Executar Seed
```bash
npx prisma db seed
```

### 4. Reset (se necessário)
```bash
npx prisma migrate reset
```

## Manutenção Recomendada

### Diária
- Gerar missões diárias para usuários ativos
- Verificar e conceder badges

### Semanal
- Executar `cleanup_old_logs(90)` para remover logs antigos
- Recalcular estatísticas se houver inconsistências

### Mensal
- Revisar performance de queries
- Verificar tamanho do banco
- Backup do banco de dados

## Dados de Teste

Após executar o seed, você terá:

**Usuário de Teste:**
- Email: `test@hbjj.com`
- Senha: `test123`
- Perfil: Atleta azul, 25 anos, 77.5kg
- Competição: Campeonato Paulista (60 dias)
- Camp: Camp de 8 semanas
- Sessões de treino: 2 sessões
- Logs de nutrição: 3 dias
- Logs de hidratação: 5 dias
- Missões diárias: 4 missões

**Badges Disponíveis:**
- Primeiro Treino
- Consistente (7 dias)
- Atleta Dedicado (30 dias)
- Foco no Peso
- Camp Completo
- Nutrição em Dia
- Hidratado
- Competidor
- Nível 5
- Nível 10
- XP Master (1000 XP)
- Missões Diárias (100 missões)

**Vídeos do YouTube:**
- 4 vídeos de técnica para diferentes faixas
