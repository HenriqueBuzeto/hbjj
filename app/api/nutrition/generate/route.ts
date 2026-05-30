import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    // Get user profile and nutrition targets
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        nutritionTargets: true,
      },
    })

    if (!user || !user.athleteProfile || !user.nutritionTargets) {
      return NextResponse.json(
        { error: 'Perfil incompleto' },
        { status: 400 }
      )
    }

    const targets = user.nutritionTargets
    const weightKg = user.athleteProfile.currentWeightKg || 70
    const intensityLevel = user.athleteProfile.intensityLevel || 'moderate'

    // Generate meal plan based on targets
    const mealPlan = generateMealPlan(targets, weightKg, intensityLevel)

    // Save meal plan to database (create separate MealLog for each meal type)
    const mealLogs = []
    
    for (const meal of mealPlan.breakfast) {
      mealLogs.push({
        userId,
        date: new Date(),
        mealType: 'breakfast',
        totalCalories: meal.calories,
        totalProteinG: meal.protein,
        totalCarbsG: meal.carbs,
        totalFatG: meal.fat,
      })
    }
    
    for (const meal of mealPlan.lunch) {
      mealLogs.push({
        userId,
        date: new Date(),
        mealType: 'lunch',
        totalCalories: meal.calories,
        totalProteinG: meal.protein,
        totalCarbsG: meal.carbs,
        totalFatG: meal.fat,
      })
    }
    
    for (const meal of mealPlan.dinner) {
      mealLogs.push({
        userId,
        date: new Date(),
        mealType: 'dinner',
        totalCalories: meal.calories,
        totalProteinG: meal.protein,
        totalCarbsG: meal.carbs,
        totalFatG: meal.fat,
      })
    }
    
    for (const meal of mealPlan.snacks) {
      mealLogs.push({
        userId,
        date: new Date(),
        mealType: 'snack',
        totalCalories: meal.calories,
        totalProteinG: meal.protein,
        totalCarbsG: meal.carbs,
        totalFatG: meal.fat,
      })
    }

    const createdMealLogs = await prisma.mealLog.createMany({
      data: mealLogs,
      skipDuplicates: true,
    })

    console.log('[Nutrition] Generated meal plan for user:', userId)

    return NextResponse.json({ 
      success: true, 
      mealPlan,
      mealLogs: createdMealLogs 
    })
  } catch (error: any) {
    console.error('[Nutrition] Generate error:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar plano alimentar' },
      { status: 500 }
    )
  }
}

function generateMealPlan(targets: any, weightKg: number, intensityLevel: string) {
  const calories = targets.caloriesTarget || 2100
  const protein = targets.proteinTargetG || 140
  const carbs = targets.carbsTargetG || 200
  const fat = targets.fatTargetG || 70

  // Distribute macros across meals
  const breakfastCalories = Math.round(calories * 0.25)
  const lunchCalories = Math.round(calories * 0.35)
  const dinnerCalories = Math.round(calories * 0.30)
  const snackCalories = Math.round(calories * 0.10)

  return {
    breakfast: [
      {
        name: 'Ovos mexidos com vegetais',
        calories: Math.round(breakfastCalories * 0.4),
        protein: Math.round(protein * 0.25),
        carbs: Math.round(carbs * 0.15),
        fat: Math.round(fat * 0.3),
      },
      {
        name: 'Aveia com banana',
        calories: Math.round(breakfastCalories * 0.35),
        protein: Math.round(protein * 0.1),
        carbs: Math.round(carbs * 0.25),
        fat: Math.round(fat * 0.15),
      },
      {
        name: 'Café com leite',
        calories: Math.round(breakfastCalories * 0.25),
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.1),
        fat: Math.round(fat * 0.2),
      },
    ],
    lunch: [
      {
        name: 'Frango grelhado com arroz integral',
        calories: Math.round(lunchCalories * 0.4),
        protein: Math.round(protein * 0.35),
        carbs: Math.round(carbs * 0.3),
        fat: Math.round(fat * 0.15),
      },
      {
        name: 'Salada verde com azeite',
        calories: Math.round(lunchCalories * 0.15),
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.1),
        fat: Math.round(fat * 0.3),
      },
      {
        name: 'Feijão ou legumes',
        calories: Math.round(lunchCalories * 0.2),
        protein: Math.round(protein * 0.1),
        carbs: Math.round(carbs * 0.2),
        fat: Math.round(fat * 0.05),
      },
      {
        name: 'Fruta',
        calories: Math.round(lunchCalories * 0.25),
        protein: Math.round(protein * 0.02),
        carbs: Math.round(carbs * 0.25),
        fat: Math.round(fat * 0.02),
      },
    ],
    dinner: [
      {
        name: 'Peixe ou carne magra',
        calories: Math.round(dinnerCalories * 0.4),
        protein: Math.round(protein * 0.35),
        carbs: Math.round(carbs * 0.15),
        fat: Math.round(fat * 0.2),
      },
      {
        name: 'Batata doce ou arroz',
        calories: Math.round(dinnerCalories * 0.3),
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.35),
        fat: Math.round(fat * 0.05),
      },
      {
        name: 'Vegetais cozidos',
        calories: Math.round(dinnerCalories * 0.2),
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.15),
        fat: Math.round(fat * 0.1),
      },
      {
        name: 'Sopa ou salada',
        calories: Math.round(dinnerCalories * 0.1),
        protein: Math.round(protein * 0.02),
        carbs: Math.round(carbs * 0.1),
        fat: Math.round(fat * 0.1),
      },
    ],
    snacks: [
      {
        name: 'Iogurte com granola',
        calories: Math.round(snackCalories * 0.5),
        protein: Math.round(protein * 0.1),
        carbs: Math.round(carbs * 0.15),
        fat: Math.round(fat * 0.15),
      },
      {
        name: 'Castanhas ou frutas secas',
        calories: Math.round(snackCalories * 0.5),
        protein: Math.round(protein * 0.05),
        carbs: Math.round(carbs * 0.1),
        fat: Math.round(fat * 0.35),
      },
    ],
  }
}
