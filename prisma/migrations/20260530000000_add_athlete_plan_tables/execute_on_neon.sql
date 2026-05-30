-- Tabelas do AthletePlanEngine
CREATE TABLE IF NOT EXISTS "athlete_plan_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "primaryGoal" TEXT NOT NULL,
    "intensityLevel" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "summary" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_plan_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "athlete_plan_targets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planProfileId" TEXT,
    "targetType" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "targetValue" DOUBLE PRECISION,
    "weeklyTarget" DOUBLE PRECISION,
    "unit" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_plan_targets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "athlete_plan_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planProfileId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "priority" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_plan_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "athlete_weekly_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planProfileId" TEXT,
    "weekNumber" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_weekly_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "athlete_daily_plan_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyPlanId" TEXT,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER,
    "intensity" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_daily_plan_items_pkey" PRIMARY KEY ("id")
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS "athlete_plan_profiles_userId_key" ON "athlete_plan_profiles"("userId");
CREATE INDEX IF NOT EXISTS "athlete_plan_targets_userId_idx" ON "athlete_plan_targets"("userId");
CREATE INDEX IF NOT EXISTS "athlete_plan_targets_planProfileId_idx" ON "athlete_plan_targets"("planProfileId");
CREATE INDEX IF NOT EXISTS "athlete_plan_recommendations_userId_idx" ON "athlete_plan_recommendations"("userId");
CREATE INDEX IF NOT EXISTS "athlete_plan_recommendations_planProfileId_idx" ON "athlete_plan_recommendations"("planProfileId");
CREATE INDEX IF NOT EXISTS "athlete_weekly_plans_userId_idx" ON "athlete_weekly_plans"("userId");
CREATE INDEX IF NOT EXISTS "athlete_weekly_plans_planProfileId_idx" ON "athlete_weekly_plans"("planProfileId");
CREATE INDEX IF NOT EXISTS "athlete_weekly_plans_weekNumber_idx" ON "athlete_weekly_plans"("weekNumber");
CREATE INDEX IF NOT EXISTS "athlete_daily_plan_items_userId_idx" ON "athlete_daily_plan_items"("userId");
CREATE INDEX IF NOT EXISTS "athlete_daily_plan_items_weeklyPlanId_idx" ON "athlete_daily_plan_items"("weeklyPlanId");
CREATE INDEX IF NOT EXISTS "athlete_daily_plan_items_date_idx" ON "athlete_daily_plan_items"("date");

-- Foreign Keys
ALTER TABLE "athlete_plan_profiles" ADD CONSTRAINT "athlete_plan_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_plan_targets" ADD CONSTRAINT "athlete_plan_targets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_plan_targets" ADD CONSTRAINT "athlete_plan_targets_planProfileId_fkey" FOREIGN KEY ("planProfileId") REFERENCES "athlete_plan_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_plan_recommendations" ADD CONSTRAINT "athlete_plan_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_plan_recommendations" ADD CONSTRAINT "athlete_plan_recommendations_planProfileId_fkey" FOREIGN KEY ("planProfileId") REFERENCES "athlete_plan_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_weekly_plans" ADD CONSTRAINT "athlete_weekly_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_weekly_plans" ADD CONSTRAINT "athlete_weekly_plans_planProfileId_fkey" FOREIGN KEY ("planProfileId") REFERENCES "athlete_plan_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_daily_plan_items" ADD CONSTRAINT "athlete_daily_plan_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "athlete_daily_plan_items" ADD CONSTRAINT "athlete_daily_plan_items_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "athlete_weekly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
