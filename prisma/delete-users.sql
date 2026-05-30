-- Script para deletar todos os usuários e dados relacionados
-- ATENÇÃO: Este script deletará TODOS os dados do banco de dados
-- Execute apenas em ambiente de desenvolvimento/teste

BEGIN;

-- Deletar dados em ordem de dependência (filhos primeiro)
DELETE FROM "daily_missions";
DELETE FROM "meal_items";
DELETE FROM "meal_logs";
DELETE FROM "hydration_logs";
DELETE FROM "body_progress_logs";
DELETE FROM "progress_photos";
DELETE FROM "readiness_logs";
DELETE FROM "training_exercises";
DELETE FROM "training_sessions";
DELETE FROM "nutrition_targets";
DELETE FROM "jiu_jitsu_profiles";
DELETE FROM "athlete_profiles";
DELETE FROM "gamification_profiles";
DELETE FROM "user_badges";
DELETE FROM "xp_events";
DELETE FROM "ai_messages";
DELETE FROM "ai_conversations";
DELETE FROM "ai_recommendations";
DELETE FROM "user_video_favorites";
DELETE FROM "youtube_videos";

-- Deletar sessões
DELETE FROM "sessions";

-- Deletar tokens de verificação
DELETE FROM "verification_tokens";

-- Deletar usuários
DELETE FROM "users";

-- Resetar sequências
ALTER SEQUENCE "users_id_seq" RESTART WITH 1;
ALTER SEQUENCE "athlete_profiles_id_seq" RESTART WITH 1;
ALTER SEQUENCE "jiu_jitsu_profiles_id_seq" RESTART WITH 1;
ALTER SEQUENCE "gamification_profiles_id_seq" RESTART WITH 1;
ALTER SEQUENCE "nutrition_targets_id_seq" RESTART WITH 1;
ALTER SEQUENCE "meal_logs_id_seq" RESTART WITH 1;
ALTER SEQUENCE "hydration_logs_id_seq" RESTART WITH 1;
ALTER SEQUENCE "body_progress_logs_id_seq" RESTART WITH 1;
ALTER SEQUENCE "progress_photos_id_seq" RESTART WITH 1;
ALTER SEQUENCE "readiness_logs_id_seq" RESTART WITH 1;
ALTER SEQUENCE "training_sessions_id_seq" RESTART WITH 1;
ALTER SEQUENCE "daily_missions_id_seq" RESTART WITH 1;

COMMIT;

-- Verificar se todos os dados foram deletados
SELECT 'users' as table_name, COUNT(*) as count FROM "users"
UNION ALL
SELECT 'athlete_profiles', COUNT(*) FROM "athlete_profiles"
UNION ALL
SELECT 'jiu_jitsu_profiles', COUNT(*) FROM "jiu_jitsu_profiles"
UNION ALL
SELECT 'nutrition_targets', COUNT(*) FROM "nutrition_targets"
UNION ALL
SELECT 'daily_missions', COUNT(*) FROM "daily_missions"
UNION ALL
SELECT 'meal_logs', COUNT(*) FROM "meal_logs";
