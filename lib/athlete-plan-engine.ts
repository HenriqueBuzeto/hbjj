/**
 * HBJJ Intelligent Athlete Plan Engine
 * 
 * Motor determinístico para gerar planos personalizados de atletas
 * baseados em perfil, objetivos e competição.
 * 
 * Este sistema não depende de IA para funcionar - usa lógica determinística
 * e a IA é usada apenas para refinar e melhorar as recomendações.
 */

import { prisma } from './prisma';

// ============================================
// TYPES
// ============================================

export interface AthleteProfile {
  userId: string;
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  desiredWeight?: number;
  gender?: 'male' | 'female';
  activity?: string;
  goal?: 'lose' | 'maintain' | 'gain';
  level?: number;
  xp?: number;
  streak?: number;
  caloriesGoal?: number;
}

export interface JiuJitsuProfile {
  belt?: 'white' | 'blue' | 'purple' | 'brown' | 'black';
  trainingTime?: string;
  trainsGi?: boolean;
  trainsNoGi?: boolean;
  weeklyFrequency?: number;
  trainingHours?: string;
  team?: string;
  professor?: string;
  weightCategory?: string;
  isCompetitor?: boolean;
  athleteGoal?: string[];
  intensityLevel?: 'light' | 'moderate' | 'strong' | 'competitor' | 'camp';
  city?: string;
}

export interface Competition {
  id?: string;
  name: string;
  eventDate: Date;
  modalities: ('Gi' | 'No-Gi')[];
  weightLimit?: number;
  priority?: 'low' | 'medium' | 'high';
  weeksRemaining?: number;
}

export interface PlanInput {
  athleteProfile: AthleteProfile;
  jiuJitsuProfile: JiuJitsuProfile;
  competition?: Competition;
  readiness?: {
    gasScore?: number;
    strengthScore?: number;
    mobilityScore?: number;
    recoveryScore?: number;
    weightScore?: number;
  };
}

export interface GeneratedPlan {
  planType: string;
  primaryGoal: string;
  intensityLevel: string;
  riskLevel: string;
  summary: string;
  targets: PlanTarget[];
  recommendations: PlanRecommendation[];
  weeklyPlans: WeeklyPlan[];
}

export interface PlanTarget {
  targetType: string;
  currentValue?: number;
  targetValue: number;
  weeklyTarget?: number;
  unit: string;
  deadline?: Date;
}

export interface PlanRecommendation {
  category: string;
  title: string;
  content: string;
  priority: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  phase: string;
  focus: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  dailyItems: DailyPlanItem[];
}

export interface DailyPlanItem {
  date: Date;
  type: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  intensity?: string;
}

// ============================================
// PLAN TYPES
// ============================================

enum PlanType {
  COMPETITOR_WITH_WEIGHT_CUT = 'competitor_with_weight_cut',
  COMPETITOR_NO_WEIGHT_CUT = 'competitor_no_weight_cut',
  WEIGHT_LOSS = 'weight_loss',
  HOBBY = 'hobby',
  RETURN_TO_TRAINING = 'return_to_training',
  MAINTENANCE = 'maintenance',
}

enum PrimaryGoal {
  COMPETITION = 'competition',
  WEIGHT_LOSS = 'weight_loss',
  IMPROVE_GAS = 'improve_gas',
  GAIN_STRENGTH = 'gain_strength',
  MOBILITY = 'mobility',
  GENERAL_HEALTH = 'general_health',
}

enum IntensityLevel {
  LIGHT = 'light',
  MODERATE = 'moderate',
  STRONG = 'strong',
  COMPETITOR = 'competitor',
  CAMP_INTENSIVE = 'camp_intensive',
}

enum RiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

enum Phase {
  BASE = 'base',
  BUILD = 'build',
  PEAK = 'peak',
  TAPER = 'taper',
  DELOAD = 'deload',
}

// ============================================
// CALCULATIONS
// ============================================

export class AthletePlanCalculator {
  /**
   * Calculate weight to lose
   */
  static calculateWeightToCut(currentWeight: number, targetWeight: number): number {
    return currentWeight - targetWeight;
  }

  /**
   * Calculate weekly weight target
   */
  static calculateWeeklyWeightTarget(weightToCut: number, weeksUntilCompetition: number): number {
    if (weeksUntilCompetition <= 0) return 0;
    return weightToCut / weeksUntilCompetition;
  }

  /**
   * Classify weight loss rate
   */
  static classifyWeightLossRate(weeklyTarget: number): RiskLevel {
    if (weeklyTarget <= 0.5) return RiskLevel.LOW;
    if (weeklyTarget <= 1.0) return RiskLevel.MODERATE;
    return RiskLevel.HIGH;
  }

  /**
   * Estimate daily calories
   * Formula simplificada baseada em peso, altura, idade, objetivo e intensidade
   */
  static estimateDailyCalories(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female' = 'male',
    goal: 'lose' | 'maintain' | 'gain' = 'maintain',
    intensity: IntensityLevel = IntensityLevel.MODERATE
  ): number {
    // BMR simplificado (Mifflin-St Jeor)
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Fator de atividade baseado na intensidade
    const activityFactors: Record<IntensityLevel, number> = {
      [IntensityLevel.LIGHT]: 1.375,
      [IntensityLevel.MODERATE]: 1.55,
      [IntensityLevel.STRONG]: 1.725,
      [IntensityLevel.COMPETITOR]: 1.9,
      [IntensityLevel.CAMP_INTENSIVE]: 2.0,
    };

    const tdee = bmr * activityFactors[intensity];

    // Ajuste baseado no objetivo
    const goalAdjustments: Record<string, number> = {
      lose: -500,
      maintain: 0,
      gain: 300,
    };

    return Math.round(tdee + goalAdjustments[goal]);
  }

  /**
   * Calculate protein target
   * 1.6g a 2.2g por kg
   */
  static calculateProteinTarget(weight: number, intensity: IntensityLevel): number {
    const proteinPerKg = intensity === IntensityLevel.COMPETITOR ? 2.0 : 1.8;
    return Math.round(weight * proteinPerKg);
  }

  /**
   * Calculate water target
   * 35ml a 45ml por kg + extra para treino forte
   */
  static calculateWaterTarget(weight: number, intensity: IntensityLevel): number {
    const baseMlPerKg = intensity === IntensityLevel.COMPETITOR || intensity === IntensityLevel.CAMP_INTENSIVE ? 45 : 35;
    let waterLiters = (weight * baseMlPerKg) / 1000;

    // Extra para treino forte
    if (intensity === IntensityLevel.STRONG || intensity === IntensityLevel.COMPETITOR || intensity === IntensityLevel.CAMP_INTENSIVE) {
      waterLiters += 0.5;
    }

    return Math.round(waterLiters * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate readiness score
   */
  static calculateReadinessScore(
    gasScore: number,
    strengthScore: number,
    mobilityScore: number,
    recoveryScore: number,
    weightScore: number
  ): number {
    return Math.round(
      (gasScore * 0.30) +
      (strengthScore * 0.20) +
      (mobilityScore * 0.15) +
      (recoveryScore * 0.20) +
      (weightScore * 0.15)
    );
  }

  /**
   * Calculate weeks until competition
   */
  static calculateWeeksUntilCompetition(eventDate: Date): number {
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }
}

// ============================================
// PLAN GENERATOR
// ============================================

export class AthletePlanEngine {
  /**
   * Determine intensity level
   */
  private static determineIntensityLevel(jiuJitsuProfile: JiuJitsuProfile): IntensityLevel {
    const intensityLevel = jiuJitsuProfile.intensityLevel || 'moderate';
    
    const intensityMap: Record<string, IntensityLevel> = {
      'light': IntensityLevel.LIGHT,
      'moderate': IntensityLevel.MODERATE,
      'strong': IntensityLevel.STRONG,
      'competitor': IntensityLevel.COMPETITOR,
      'camp': IntensityLevel.CAMP_INTENSIVE,
    };
    
    return intensityMap[intensityLevel] || IntensityLevel.MODERATE;
  }

  /**
   * Generate personalized plan based on athlete profile
   */
  static async generatePlan(input: PlanInput): Promise<GeneratedPlan> {
    const { athleteProfile, jiuJitsuProfile, competition, readiness } = input;

    // Determine plan type
    const planType = this.determinePlanType(athleteProfile, jiuJitsuProfile, competition);

    // Determine primary goal
    const primaryGoal = this.determinePrimaryGoal(athleteProfile, jiuJitsuProfile, competition);

    // Determine intensity level
    const intensityLevel = this.determineIntensityLevel(jiuJitsuProfile);

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(athleteProfile, jiuJitsuProfile, competition, readiness);

    // Generate summary
    const summary = this.generateSummary(planType, primaryGoal, intensityLevel, riskLevel, competition);

    // Generate targets
    const targets = this.generateTargets(athleteProfile, jiuJitsuProfile, competition, intensityLevel);

    // Generate recommendations
    const recommendations = this.generateRecommendations(planType, primaryGoal, intensityLevel, riskLevel, competition);

    // Generate weekly plans
    const weeklyPlans = this.generateWeeklyPlans(planType, primaryGoal, intensityLevel, competition, jiuJitsuProfile);

    return {
      planType,
      primaryGoal,
      intensityLevel,
      riskLevel,
      summary,
      targets,
      recommendations,
      weeklyPlans,
    };
  }

  /**
   * Determine plan type based on profile
   */
  private static determinePlanType(
    athleteProfile: AthleteProfile,
    jiuJitsuProfile: JiuJitsuProfile,
    competition?: Competition,
    readinessInput?: any
  ): PlanType {
    if (competition && jiuJitsuProfile.isCompetitor) {
      const weightToCut = AthletePlanCalculator.calculateWeightToCut(
        athleteProfile.weight || 0,
        competition.weightLimit || athleteProfile.weight || 0
      );

      if (weightToCut > 2) {
        return PlanType.COMPETITOR_WITH_WEIGHT_CUT;
      }
      return PlanType.COMPETITOR_NO_WEIGHT_CUT;
    }

    if (athleteProfile.goal === 'lose') {
      return PlanType.WEIGHT_LOSS;
    }

    const intensityLevel = this.determineIntensityLevel(jiuJitsuProfile);
    if (intensityLevel === IntensityLevel.LIGHT) {
      return PlanType.HOBBY;
    }

    if (readinessInput?.gasScore && readinessInput.gasScore < 5) {
      return PlanType.RETURN_TO_TRAINING;
    }

    return PlanType.MAINTENANCE;
  }

  /**
   * Determine primary goal
   */
  private static determinePrimaryGoal(
    athleteProfile: AthleteProfile,
    jiuJitsuProfile: JiuJitsuProfile,
    competition?: Competition
  ): PrimaryGoal {
    if (competition) {
      return PrimaryGoal.COMPETITION;
    }

    if (athleteProfile.goal === 'lose') {
      return PrimaryGoal.WEIGHT_LOSS;
    }

    const goals = jiuJitsuProfile.athleteGoal || [];
    if (goals.includes('improve_gas')) {
      return PrimaryGoal.IMPROVE_GAS;
    }
    if (goals.includes('gain_strength')) {
      return PrimaryGoal.GAIN_STRENGTH;
    }
    if (goals.includes('mobility')) {
      return PrimaryGoal.MOBILITY;
    }

    return PrimaryGoal.GENERAL_HEALTH;
  }

  /**
   * Calculate risk level
   */
  private static calculateRiskLevel(
    athleteProfile: AthleteProfile,
    jiuJitsuProfile: JiuJitsuProfile,
    competition?: Competition,
    readinessInput?: any
  ): RiskLevel {
    // Check for aggressive weight cut
    if (competition) {
      const weightToCut = AthletePlanCalculator.calculateWeightToCut(
        athleteProfile.weight || 0,
        competition.weightLimit || athleteProfile.weight || 0
      );
      const weeksUntilCompetition = AthletePlanCalculator.calculateWeeksUntilCompetition(competition.eventDate);
      const weeklyTarget = AthletePlanCalculator.calculateWeeklyWeightTarget(weightToCut, weeksUntilCompetition);
      const weightLossRisk = AthletePlanCalculator.classifyWeightLossRate(weeklyTarget);

      if (weightLossRisk === RiskLevel.HIGH) {
        return RiskLevel.HIGH;
      }
    }

    // Check readiness indicators
    if (readinessInput) {
      const readinessScore = AthletePlanCalculator.calculateReadinessScore(
        readinessInput.gasScore || 5,
        readinessInput.strengthScore || 5,
        readinessInput.mobilityScore || 5,
        readinessInput.recoveryScore || 5,
        readinessInput.weightScore || 5
      );

      if (readinessScore < 4) {
        return RiskLevel.HIGH;
      }
      if (readinessScore < 6) {
        return RiskLevel.MODERATE;
      }
    }

    return RiskLevel.LOW;
  }

  /**
   * Generate plan summary
   */
  private static generateSummary(
    planType: PlanType,
    primaryGoal: PrimaryGoal,
    intensityLevel: IntensityLevel,
    riskLevel: RiskLevel,
    competition?: Competition
  ): string {
    const summaries: Record<PlanType, string> = {
      [PlanType.COMPETITOR_WITH_WEIGHT_CUT]: `Plano competitivo com corte de peso. Foco em performance while managing weight cut safely. Intensidade ${intensityLevel}.`,
      [PlanType.COMPETITOR_NO_WEIGHT_CUT]: `Plano competitivo focado em performance máxima. Sem necessidade de corte de peso. Intensidade ${intensityLevel}.`,
      [PlanType.WEIGHT_LOSS]: `Plano de emagrecimento sustentável. Déficit calórico moderado com treinos progressivos. Intensidade ${intensityLevel}.`,
      [PlanType.HOBBY]: `Plano recreativo focado em saúde e consistência. Treinos leves com mobilidade e recuperação. Intensidade ${intensityLevel}.`,
      [PlanType.RETURN_TO_TRAINING]: `Plano de retorno ao treino após pausa. Volume baixo com foco em adaptação e prevenção de lesões. Intensidade ${intensityLevel}.`,
      [PlanType.MAINTENANCE]: `Plano de manutenção com foco em consistência e melhoria gradual. Intensidade ${intensityLevel}.`,
    };

    let summary = summaries[planType];

    if (riskLevel === RiskLevel.HIGH) {
      summary += ' Risco elevado detectado. Ajuste intensidade e priorize recuperação.';
    }

    if (competition) {
      const weeksRemaining = AthletePlanCalculator.calculateWeeksUntilCompetition(competition.eventDate);
      summary += ` Competição em ${weeksRemaining} semanas.`;
    }

    return summary;
  }

  /**
   * Generate targets
   */
  private static generateTargets(
    athleteProfile: AthleteProfile,
    jiuJitsuProfile: JiuJitsuProfile,
    competition?: Competition,
    intensityLevel: IntensityLevel = IntensityLevel.MODERATE
  ): PlanTarget[] {
    const targets: PlanTarget[] = [];
    const weight = athleteProfile.weight || 0;
    const height = athleteProfile.height || 0;
    const age = athleteProfile.age || 30;
    const gender = athleteProfile.gender || 'male';
    const goal = athleteProfile.goal || 'maintain';

    // Weight target
    if (competition && competition.weightLimit) {
      targets.push({
        targetType: 'weight',
        currentValue: weight,
        targetValue: competition.weightLimit,
        weeklyTarget: AthletePlanCalculator.calculateWeeklyWeightTarget(
          weight - competition.weightLimit,
          AthletePlanCalculator.calculateWeeksUntilCompetition(competition.eventDate)
        ),
        unit: 'kg',
        deadline: competition.eventDate,
      });
    } else if (athleteProfile.desiredWeight) {
      targets.push({
        targetType: 'weight',
        currentValue: weight,
        targetValue: athleteProfile.desiredWeight,
        weeklyTarget: 0.5,
        unit: 'kg',
      });
    }

    // Calories target
    const calories = AthletePlanCalculator.estimateDailyCalories(weight, height, age, gender, goal, intensityLevel);
    targets.push({
      targetType: 'calories',
      targetValue: calories,
      unit: 'kcal',
    });

    // Protein target
    const protein = AthletePlanCalculator.calculateProteinTarget(weight, intensityLevel);
    targets.push({
      targetType: 'protein',
      targetValue: protein,
      unit: 'g',
    });

    // Water target
    const water = AthletePlanCalculator.calculateWaterTarget(weight, intensityLevel);
    targets.push({
      targetType: 'water',
      targetValue: water,
      unit: 'L',
    });

    // Sleep target
    targets.push({
      targetType: 'sleep_hours',
      targetValue: 7,
      unit: 'hours',
    });

    // Training hours target
    const weeklyFrequency = jiuJitsuProfile.weeklyFrequency || 3;
    targets.push({
      targetType: 'training_hours',
      targetValue: weeklyFrequency * 1.5,
      unit: 'hours',
    });

    return targets;
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    planType: PlanType,
    primaryGoal: PrimaryGoal,
    intensityLevel: IntensityLevel,
    riskLevel: RiskLevel,
    competition?: Competition
  ): PlanRecommendation[] {
    const recommendations: PlanRecommendation[] = [];

    // Training recommendations
    if (planType === PlanType.COMPETITOR_WITH_WEIGHT_CUT) {
      recommendations.push({
        category: 'training',
        title: 'Foco em técnica e gás',
        content: 'Priorize drills técnicos e rolas cronometradas. Evite treinos extremamente desgastantes durante corte de peso.',
        priority: 'high',
      });
      recommendations.push({
        category: 'training',
        title: 'Cardio moderado',
        content: 'Adicione 2-3 sessões de cardio leve por semana para ajudar no corte de peso sem comprometer performance.',
        priority: 'medium',
      });
    } else if (planType === PlanType.COMPETITOR_NO_WEIGHT_CUT) {
      recommendations.push({
        category: 'training',
        title: 'Foco em explosão e força',
        content: 'Priorize explosão, força e estratégia. Sparring controlado e simulação de luta.',
        priority: 'high',
      });
    } else if (planType === PlanType.HOBBY) {
      recommendations.push({
        category: 'training',
        title: 'Consistência sobre intensidade',
        content: 'Mantenha consistência nos treinos. Foque em mobilidade e recuperação.',
        priority: 'medium',
      });
    }

    // Nutrition recommendations
    if (planType === PlanType.COMPETITOR_WITH_WEIGHT_CUT) {
      recommendations.push({
        category: 'nutrition',
        title: 'Proteína alta',
        content: 'Mantenha ingestão alta de proteína (2g/kg) para preservar massa muscular durante corte.',
        priority: 'high',
      });
      recommendations.push({
        category: 'nutrition',
        title: 'Hidratação',
        content: 'Mantenha-se bem hidratado. A desidratação pode comprometer performance e recuperação.',
        priority: 'high',
      });
    }

    // Recovery recommendations
    if (riskLevel === RiskLevel.HIGH) {
      recommendations.push({
        category: 'recovery',
        title: 'Priorize recuperação',
        content: 'Aumente dias de descanso. Foque em sono, mobilidade e gerenciamento de estresse.',
        priority: 'high',
      });
    }

    // Competition-specific recommendations
    if (competition) {
      recommendations.push({
        category: 'competition',
        title: 'Preparação mental',
        content: 'Prepare estratégia de competição. Visualize cenários e prepare checklists.',
        priority: 'high',
      });
    }

    return recommendations;
  }

  /**
   * Generate weekly plans
   */
  private static generateWeeklyPlans(
    planType: PlanType,
    primaryGoal: PrimaryGoal,
    intensityLevel: IntensityLevel,
    competition?: Competition,
    jiuJitsuProfile?: JiuJitsuProfile
  ): WeeklyPlan[] {
    const weeklyPlans: WeeklyPlan[] = [];

    if (competition) {
      const weeksRemaining = AthletePlanCalculator.calculateWeeksUntilCompetition(competition.eventDate);
      weeklyPlans.push(...this.generateCompetitionWeeklyPlans(weeksRemaining, intensityLevel, jiuJitsuProfile));
    } else {
      weeklyPlans.push(...this.generateStandardWeeklyPlans(planType, intensityLevel, jiuJitsuProfile));
    }

    return weeklyPlans;
  }

  /**
   * Generate competition weekly plans
   */
  private static generateCompetitionWeeklyPlans(
    weeksRemaining: number,
    intensityLevel: IntensityLevel,
    jiuJitsuProfile?: JiuJitsuProfile
  ): WeeklyPlan[] {
    const weeklyPlans: WeeklyPlan[] = [];
    const startDate = new Date();

    for (let week = 1; week <= weeksRemaining; week++) {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (week - 1) * 7);

      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      let phase: Phase;
      let focus: string;

      if (week <= weeksRemaining * 0.3) {
        phase = Phase.BASE;
        focus = 'Volume e técnica';
      } else if (week <= weeksRemaining * 0.6) {
        phase = Phase.BUILD;
        focus = 'Intensidade e força';
      } else if (week <= weeksRemaining * 0.8) {
        phase = Phase.PEAK;
        focus = 'Performance e sparring';
      } else {
        phase = Phase.TAPER;
        focus = 'Recuperação e manutenção';
      }

      const dailyItems = this.generateDailyItems(phase, intensityLevel, jiuJitsuProfile, weekStartDate);

      weeklyPlans.push({
        weekNumber: week,
        phase,
        focus,
        startDate: weekStartDate,
        endDate: weekEndDate,
        dailyItems,
      });
    }

    return weeklyPlans;
  }

  /**
   * Generate standard weekly plans
   */
  private static generateStandardWeeklyPlans(
    planType: PlanType,
    intensityLevel: IntensityLevel,
    jiuJitsuProfile?: JiuJitsuProfile
  ): WeeklyPlan[] {
    const weeklyPlans: WeeklyPlan[] = [];
    const startDate = new Date();

    // Generate 4 weeks of standard plan
    for (let week = 1; week <= 4; week++) {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (week - 1) * 7);

      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      const phase = Phase.BASE;
      const focus = planType === PlanType.HOBBY ? 'Consistência e mobilidade' : 'Progressão gradual';

      const dailyItems = this.generateDailyItems(phase, intensityLevel, jiuJitsuProfile, weekStartDate);

      weeklyPlans.push({
        weekNumber: week,
        phase,
        focus,
        startDate: weekStartDate,
        endDate: weekEndDate,
        dailyItems,
      });
    }

    return weeklyPlans;
  }

  /**
   * Generate daily items for a week
   */
  private static generateDailyItems(
    phase: Phase,
    intensityLevel: IntensityLevel,
    jiuJitsuProfile?: JiuJitsuProfile,
    weekStartDate?: Date
  ): DailyPlanItem[] {
    const dailyItems: DailyPlanItem[] = [];
    const weeklyFrequency = jiuJitsuProfile?.weeklyFrequency || 3;

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStartDate || new Date());
      date.setDate(date.getDate() + day);

      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Generate daily items based on day and frequency
      if (dayOfWeek < weeklyFrequency && dayOfWeek !== 0) {
        // Training day
        dailyItems.push({
          date,
          type: 'training',
          title: 'Treino de Jiu-Jitsu',
          description: 'Sessão técnica + rola',
          durationMinutes: 90,
          intensity: intensityLevel,
        });
      } else if (dayOfWeek === 0) {
        // Rest day
        dailyItems.push({
          date,
          type: 'recovery',
          title: 'Dia de descanso',
          description: 'Mobilidade leve e recuperação',
          durationMinutes: 30,
          intensity: 'low',
        });
      } else {
        // Active recovery or strength
        if (intensityLevel === IntensityLevel.STRONG || intensityLevel === IntensityLevel.COMPETITOR) {
          dailyItems.push({
            date,
            type: 'strength',
            title: 'Treino de força',
            description: 'Exercícios funcionais para Jiu-Jitsu',
            durationMinutes: 45,
            intensity: 'medium',
          });
        } else {
          dailyItems.push({
            date,
            type: 'mobility',
            title: 'Mobilidade',
            description: 'Alongamento e mobilidade específica para Jiu-Jitsu',
            durationMinutes: 30,
            intensity: 'low',
          });
        }
      }
    }

    return dailyItems;
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

export class AthletePlanRepository {
  /**
   * Save generated plan to database
   */
  static async savePlan(userId: string, plan: GeneratedPlan): Promise<void> {
    console.log('[AthletePlanRepository] Plan generation requested for user:', userId)
    console.log('[AthletePlanRepository] Plan type:', plan.planType)
    console.log('[AthletePlanRepository] Primary goal:', plan.primaryGoal)
    console.log('[AthletePlanRepository] Risk level:', plan.riskLevel)
    console.log('[AthletePlanRepository] Targets:', plan.targets.length)
    console.log('[AthletePlanRepository] Recommendations:', plan.recommendations.length)
    console.log('[AthletePlanRepository] Weekly plans:', plan.weeklyPlans.length)
    
    // Create or update plan profile
    const planProfile = await prisma.athletePlanProfile.upsert({
      where: { userId },
      create: {
        userId,
        planType: plan.planType,
        primaryGoal: plan.primaryGoal,
        intensityLevel: plan.intensityLevel,
        riskLevel: plan.riskLevel,
        summary: plan.summary,
        isActive: true,
      },
      update: {
        planType: plan.planType,
        primaryGoal: plan.primaryGoal,
        intensityLevel: plan.intensityLevel,
        riskLevel: plan.riskLevel,
        summary: plan.summary,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // Save targets
    for (const target of plan.targets) {
      await prisma.athletePlanTarget.upsert({
        where: { id: '' },
        create: {
          userId,
          planProfileId: planProfile.id,
          targetType: target.targetType,
          currentValue: target.currentValue,
          targetValue: target.targetValue,
          weeklyTarget: target.weeklyTarget,
          unit: target.unit,
          deadline: target.deadline,
        },
        update: {},
      });
    }

    // Save recommendations
    for (const recommendation of plan.recommendations) {
      await prisma.athletePlanRecommendation.create({
        data: {
          userId,
          planProfileId: planProfile.id,
          category: recommendation.category,
          title: recommendation.title,
          content: recommendation.content,
          priority: recommendation.priority,
          source: 'engine',
        },
      });
    }

    // Save weekly plans
    for (const weeklyPlan of plan.weeklyPlans) {
      const savedWeeklyPlan = await prisma.athleteWeeklyPlan.create({
        data: {
          userId,
          planProfileId: planProfile.id,
          weekNumber: weeklyPlan.weekNumber,
          phase: weeklyPlan.phase,
          focus: weeklyPlan.focus,
          startDate: weeklyPlan.startDate,
          endDate: weeklyPlan.endDate,
          notes: weeklyPlan.notes,
        },
      });

      // Save daily items
      for (const dailyItem of weeklyPlan.dailyItems) {
        await prisma.athleteDailyPlanItem.create({
          data: {
            userId,
            weeklyPlanId: savedWeeklyPlan.id,
            date: dailyItem.date,
            type: dailyItem.type,
            title: dailyItem.title,
            description: dailyItem.description,
            durationMinutes: dailyItem.durationMinutes,
            intensity: dailyItem.intensity,
          },
        });
      }
    }
  }

  /**
   * Get current plan for user
   */
  static async getCurrentPlan(userId: string) {
    console.log('[AthletePlanRepository] Get current plan requested for user:', userId)
    return await prisma.athletePlanProfile.findUnique({
      where: { userId, isActive: true },
      include: {
        targets: true,
        recommendations: true,
        weeklyPlans: {
          include: {
            dailyItems: true,
          },
          orderBy: {
            weekNumber: 'asc',
          },
        },
      },
    });
  }
}
