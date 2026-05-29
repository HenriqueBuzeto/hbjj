-- Migration: Add Functions, Triggers and Procedures
-- Author: Senior DBA
-- Date: 2026-05-29
-- Description: Add advanced database logic for gamification, performance and data integrity

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Calculate total XP for a user
CREATE OR REPLACE FUNCTION calculate_user_total_xp(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_total_xp INTEGER;
BEGIN
    SELECT COALESCE(SUM(xp_amount), 0)
    INTO v_total_xp
    FROM xp_events
    WHERE user_id = p_user_id;
    
    RETURN v_total_xp;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_level INTEGER;
BEGIN
    -- Level formula: level = FLOOR(SQRT(xp / 100)) + 1
    v_level := FLOOR(SQRT(p_total_xp::FLOAT / 100.0)) + 1;
    RETURN v_level;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user has activity today
CREATE OR REPLACE FUNCTION user_has_activity_today(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_activity BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM daily_missions 
        WHERE user_id = p_user_id 
        AND date = CURRENT_DATE 
        AND status = 'completed'
    ) INTO v_has_activity;
    
    RETURN v_has_activity;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate current streak
CREATE OR REPLACE FUNCTION calculate_current_streak(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_check_date DATE := CURRENT_DATE;
    v_has_activity BOOLEAN;
BEGIN
    -- Check backwards from today
    LOOP
        SELECT EXISTS(
            SELECT 1 
            FROM daily_missions 
            WHERE user_id = p_user_id 
            AND date = v_check_date 
            AND status = 'completed'
        ) INTO v_has_activity;
        
        IF v_has_activity THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
        
        -- Safety limit to prevent infinite loops
        IF v_streak > 365 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Function: Get readiness score (weighted average)
CREATE OR REPLACE FUNCTION calculate_readiness_score(
    p_gas_score INTEGER,
    p_strength_score INTEGER,
    p_mobility_score INTEGER,
    p_recovery_score INTEGER,
    p_weight_score INTEGER
)
RETURNS INTEGER AS $$
BEGIN
    -- Weighted average: Gas (30%), Strength (20%), Mobility (15%), Recovery (20%), Weight (15%)
    RETURN ROUND(
        (p_gas_score * 0.30) +
        (p_strength_score * 0.20) +
        (p_mobility_score * 0.15) +
        (p_recovery_score * 0.20) +
        (p_weight_score * 0.15)
    )::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user qualifies for a badge
CREATE OR REPLACE FUNCTION user_qualifies_for_badge(p_user_id TEXT, p_badge_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_badge RECORD;
    v_user_stats RECORD;
    v_qualified BOOLEAN := FALSE;
BEGIN
    -- Get badge requirements
    SELECT * INTO v_badge
    FROM badges
    WHERE id = p_badge_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get user stats based on badge type
    CASE v_badge.requirement_type
        WHEN 'streak' THEN
            SELECT current_streak INTO v_user_stats
            FROM gamification_profiles
            WHERE user_id = p_user_id;
            v_qualified := v_user_stats.current_streak >= v_badge.requirement_value;
            
        WHEN 'xp' THEN
            SELECT total_xp INTO v_user_stats
            FROM gamification_profiles
            WHERE user_id = p_user_id;
            v_qualified := v_user_stats.total_xp >= v_badge.requirement_value;
            
        WHEN 'camps' THEN
            SELECT COUNT(*) INTO v_user_stats
            FROM training_camps
            WHERE user_id = p_user_id
            AND status = 'completed';
            v_qualified := v_user_stats.count >= v_badge.requirement_value;
            
        WHEN 'missions' THEN
            SELECT COUNT(*) INTO v_user_stats
            FROM daily_missions
            WHERE user_id = p_user_id
            AND status = 'completed';
            v_qualified := v_user_stats.count >= v_badge.requirement_value;
            
        ELSE
            v_qualified := FALSE;
    END CASE;
    
    RETURN v_qualified;
END;
$$ LANGUAGE plpgsql;

-- Function: Get active competition for user
CREATE OR REPLACE FUNCTION get_active_competition(p_user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_competition_id TEXT;
BEGIN
    SELECT id INTO v_competition_id
    FROM competitions
    WHERE user_id = p_user_id
    AND status IN ('upcoming', 'active')
    ORDER BY eventDate ASC
    LIMIT 1;
    
    RETURN v_competition_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate competition days remaining
CREATE OR REPLACE FUNCTION calculate_competition_days_remaining(p_competition_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_days_remaining INTEGER;
    v_event_date DATE;
BEGIN
    SELECT event_date::DATE INTO v_event_date
    FROM competitions
    WHERE id = p_competition_id;
    
    IF v_event_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    v_days_remaining := v_event_date - CURRENT_DATE;
    RETURN v_days_remaining;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update gamification profile when XP is added
CREATE OR REPLACE FUNCTION update_gamification_profile_on_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_total_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Calculate new total XP
        v_total_xp := calculate_user_total_xp(NEW.user_id);
        
        -- Calculate new level
        v_new_level := calculate_user_level(v_total_xp);
        
        -- Update gamification profile
        UPDATE gamification_profiles
        SET 
            total_xp = v_total_xp,
            level = v_new_level,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gamification_on_xp
AFTER INSERT ON xp_events
FOR EACH ROW
EXECUTE FUNCTION update_gamification_profile_on_xp();

-- Trigger: Update streak when daily mission is completed
CREATE OR REPLACE FUNCTION update_streak_on_mission_complete()
RETURNS TRIGGER AS $$
DECLARE
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_last_activity_date DATE;
BEGIN
    IF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
        -- Get current gamification profile
        SELECT current_streak, longest_streak, last_activity_date
        INTO v_current_streak, v_longest_streak, v_last_activity_date
        FROM gamification_profiles
        WHERE user_id = NEW.user_id;
        
        -- Check if activity was yesterday or today
        IF v_last_activity_date IS NULL OR 
           v_last_activity_date = CURRENT_DATE - INTERVAL '1 day' OR
           v_last_activity_date = CURRENT_DATE THEN
            -- Increment streak
            IF v_last_activity_date != CURRENT_DATE THEN
                v_current_streak := v_current_streak + 1;
            END IF;
        ELSE
            -- Reset streak
            v_current_streak := 1;
        END IF;
        
        -- Update longest streak if needed
        IF v_current_streak > v_longest_streak THEN
            v_longest_streak := v_current_streak;
        END IF;
        
        -- Update profile
        UPDATE gamification_profiles
        SET 
            current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak_on_mission
AFTER UPDATE ON daily_missions
FOR EACH ROW
EXECUTE FUNCTION update_streak_on_mission_complete();

-- Trigger: Auto-calculate readiness score
CREATE OR REPLACE FUNCTION auto_calculate_readiness_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.gas_score IS NOT NULL AND 
       NEW.strength_score IS NOT NULL AND 
       NEW.mobility_score IS NOT NULL AND 
       NEW.recovery_score IS NOT NULL AND 
       NEW.weight_score IS NOT NULL THEN
        NEW.overall_score := calculate_readiness_score(
            NEW.gas_score,
            NEW.strength_score,
            NEW.mobility_score,
            NEW.recovery_score,
            NEW.weight_score
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_readiness
BEFORE INSERT OR UPDATE ON readiness_logs
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_readiness_score();

-- Trigger: Update competition days remaining
CREATE OR REPLACE FUNCTION update_competition_days_remaining()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.event_date != OLD.event_date) THEN
        NEW.days_remaining := calculate_competition_days_remaining(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_competition_days
BEFORE INSERT OR UPDATE ON competitions
FOR EACH ROW
EXECUTE FUNCTION update_competition_days_remaining();

-- Trigger: Soft delete cascade
CREATE OR REPLACE FUNCTION soft_delete_user()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        -- Mark related records as deleted (if they have deleted_at field)
        -- Note: This is a soft delete - records remain in DB but are marked as deleted
        -- Application logic should filter out deleted records
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_soft_delete_user
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION soft_delete_user();

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Check and award badges for a user
CREATE OR REPLACE PROCEDURE check_and_award_badges(p_user_id TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_badge RECORD;
    v_qualified BOOLEAN;
BEGIN
    -- Loop through all badges
    FOR v_badge IN SELECT * FROM badges LOOP
        -- Check if user already has this badge
        IF NOT EXISTS(
            SELECT 1 FROM user_badges 
            WHERE user_id = p_user_id AND badge_id = v_badge.id
        ) THEN
            -- Check if user qualifies
            v_qualified := user_qualifies_for_badge(p_user_id, v_badge.id);
            
            IF v_qualified THEN
                -- Award badge
                INSERT INTO user_badges (user_id, badge_id, gamification_profile_id)
                VALUES (
                    p_user_id, 
                    v_badge.id, 
                    (SELECT id FROM gamification_profiles WHERE user_id = p_user_id)
                );
                
                -- Log XP event for badge
                INSERT INTO xp_events (user_id, gamification_profile_id, source_type, source_id, xp_amount, description)
                VALUES (
                    p_user_id,
                    (SELECT id FROM gamification_profiles WHERE user_id = p_user_id),
                    'badge',
                    v_badge.id,
                    50, -- 50 XP for earning a badge
                    'Badge earned: ' || v_badge.name
                );
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Procedure: Cleanup old logs (older than 90 days)
CREATE OR REPLACE PROCEDURE cleanup_old_logs(p_days_to_keep INTEGER DEFAULT 90)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete old hydration logs
    DELETE FROM hydration_logs
    WHERE date < CURRENT_DATE - INTERVAL '1 day' * p_days_to_keep;
    
    -- Delete old meal logs
    DELETE FROM meal_logs
    WHERE date < CURRENT_DATE - INTERVAL '1 day' * p_days_to_keep;
    
    -- Delete old readiness logs
    DELETE FROM readiness_logs
    WHERE date < CURRENT_DATE - INTERVAL '1 day' * p_days_to_keep;
    
    -- Delete old body progress logs (keep these longer - 1 year)
    DELETE FROM body_progress_logs
    WHERE date < CURRENT_DATE - INTERVAL '1 day' * 365;
    
    -- Delete old AI recommendations that have expired
    DELETE FROM ai_recommendations
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- Log cleanup
    RAISE NOTICE 'Cleanup completed. Deleted logs older than % days.', p_days_to_keep;
END;
$$;

-- Procedure: Recalculate all user stats (maintenance)
CREATE OR REPLACE PROCEDURE recalculate_all_user_stats()
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
    v_total_xp INTEGER;
    v_new_level INTEGER;
    v_current_streak INTEGER;
BEGIN
    FOR v_user IN SELECT id FROM users WHERE deleted_at IS NULL LOOP
        -- Recalculate total XP
        v_total_xp := calculate_user_total_xp(v_user.id);
        
        -- Recalculate level
        v_new_level := calculate_user_level(v_total_xp);
        
        -- Recalculate streak
        v_current_streak := calculate_current_streak(v_user.id);
        
        -- Update gamification profile
        UPDATE gamification_profiles
        SET 
            total_xp = v_total_xp,
            level = v_new_level,
            current_streak = v_current_streak,
            longest_streak = GREATEST(longest_streak, v_current_streak),
            updated_at = NOW()
        WHERE user_id = v_user.id;
    END LOOP;
    
    RAISE NOTICE 'User stats recalculation completed.';
END;
$$;

-- Procedure: Generate daily missions for a user
CREATE OR REPLACE PROCEDURE generate_daily_missions(p_user_id TEXT, p_date DATE DEFAULT CURRENT_DATE)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if missions already exist for this date
    IF EXISTS(
        SELECT 1 FROM daily_missions 
        WHERE user_id = p_user_id AND date = p_date
    ) THEN
        RAISE NOTICE 'Missions already exist for user % on date %', p_user_id, p_date;
        RETURN;
    END IF;
    
    -- Water mission
    INSERT INTO daily_missions (user_id, date, title, description, category, xp_reward, status)
    VALUES (
        p_user_id, 
        p_date, 
        'Beber 3L de água',
        'Mantenha-se hidratado durante o dia',
        'water',
        10,
        'pending'
    );
    
    -- Food mission
    INSERT INTO daily_missions (user_id, date, title, description, category, xp_reward, status)
    VALUES (
        p_user_id, 
        p_date, 
        'Registrar todas as refeições',
        'Mantenha o controle da sua nutrição',
        'food',
        15,
        'pending'
    );
    
    -- Exercise mission
    INSERT INTO daily_missions (user_id, date, title, description, category, xp_reward, status)
    VALUES (
        p_user_id, 
        p_date, 
        'Treinar hoje',
        'Complete sua sessão de treino',
        'exercise',
        25,
        'pending'
    );
    
    -- Recovery mission
    INSERT INTO daily_missions (user_id, date, title, description, category, xp_reward, status)
    VALUES (
        p_user_id, 
        p_date, 
        'Registrar prontidão',
        'Avalie seu estado de recuperação',
        'recovery',
        10,
        'pending'
    );
    
    RAISE NOTICE 'Daily missions generated for user % on date %', p_user_id, p_date;
END;
$$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date_status ON daily_missions(user_id, date, status);
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date_status ON training_sessions(user_id, scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_competitions_user_status_date ON competitions(user_id, status, event_date);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_created ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_camps_user_status ON training_camps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_body_progress_logs_user_date ON body_progress_logs(user_id, date DESC);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: User dashboard summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    gp.level,
    gp.total_xp,
    gp.current_streak,
    gp.longest_streak,
    COUNT(DISTINCT tc.id) AS total_camps,
    COUNT(DISTINCT ts.id) AS total_sessions,
    COUNT(DISTINCT c.id) AS total_competitions,
    COUNT(DISTINCT ub.id) AS total_badges
FROM users u
LEFT JOIN gamification_profiles gp ON u.id = gp.user_id
LEFT JOIN training_camps tc ON u.id = tc.user_id
LEFT JOIN training_sessions ts ON u.id = ts.user_id
LEFT JOIN competitions c ON u.id = c.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.email, gp.level, gp.total_xp, gp.current_streak, gp.longest_streak;

-- View: Active competitions with camp info
CREATE OR REPLACE VIEW active_competitions_view AS
SELECT 
    c.id,
    c.user_id,
    c.name,
    c.organization,
    c.event_date,
    c.days_remaining,
    c.status,
    tc.id AS camp_id,
    tc.name AS camp_name,
    tc.current_week,
    tc.total_weeks,
    tc.status AS camp_status
FROM competitions c
LEFT JOIN training_camps tc ON c.id = tc.competition_id
WHERE c.status IN ('upcoming', 'active')
ORDER BY c.event_date ASC;

-- View: Today's missions summary
CREATE OR REPLACE VIEW today_missions_summary AS
SELECT 
    user_id,
    COUNT(*) AS total_missions,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending,
    SUM(xp_reward) FILTER (WHERE status = 'completed') AS xp_earned,
    SUM(xp_reward) AS total_xp_available
FROM daily_missions
WHERE date = CURRENT_DATE
GROUP BY user_id;

-- ============================================
-- COMMENTS ON OBJECTS
-- ============================================

COMMENT ON FUNCTION calculate_user_total_xp IS 'Calculates total XP for a user from all XP events';
COMMENT ON FUNCTION calculate_user_level IS 'Calculates user level based on total XP using square root formula';
COMMENT ON FUNCTION calculate_current_streak IS 'Calculates current activity streak by checking consecutive days with completed missions';
COMMENT ON FUNCTION calculate_readiness_score IS 'Calculates weighted average readiness score from individual components';
COMMENT ON FUNCTION user_qualifies_for_badge IS 'Checks if user meets requirements for a specific badge';
COMMENT ON PROCEDURE check_and_award_badges IS 'Checks all badges and awards them to user if requirements are met';
COMMENT ON PROCEDURE cleanup_old_logs IS 'Deletes log entries older than specified days to maintain database performance';
COMMENT ON PROCEDURE recalculate_all_user_stats IS 'Maintenance procedure to recalculate all user statistics';
COMMENT ON PROCEDURE generate_daily_missions IS 'Generates default daily missions for a user on a specific date';

-- ============================================
-- END OF MIGRATION
-- ============================================
