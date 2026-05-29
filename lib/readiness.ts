export interface ReadinessInput {
  gasScore?: number
  strengthScore?: number
  mobilityScore?: number
  recoveryScore?: number
  weightScore?: number
  notes?: string
}

export function calculateReadinessScore(input: ReadinessInput): number {
  const weights = {
    gas: 0.25,
    strength: 0.20,
    mobility: 0.15,
    recovery: 0.20,
    weight: 0.20,
  }

  const scores = {
    gas: input.gasScore || 50,
    strength: input.strengthScore || 50,
    mobility: input.mobilityScore || 50,
    recovery: input.recoveryScore || 50,
    weight: input.weightScore || 50,
  }

  const overallScore =
    scores.gas * weights.gas +
    scores.strength * weights.strength +
    scores.mobility * weights.mobility +
    scores.recovery * weights.recovery +
    scores.weight * weights.weight

  return Math.round(overallScore)
}

export function getReadinessCategory(score: number): {
  category: string
  color: string
  recommendation: string
} {
  if (score >= 80) {
    return {
      category: 'Pronto',
      color: 'green',
      recommendation: 'Excelente condição para treino intenso',
    }
  } else if (score >= 60) {
    return {
      category: 'Bom',
      color: 'blue',
      recommendation: 'Condição boa, pode treinar normalmente',
    }
  } else if (score >= 40) {
    return {
      category: 'Moderado',
      color: 'yellow',
      recommendation: 'Considere reduzir intensidade do treino',
    }
  } else {
    return {
      category: 'Baixo',
      color: 'red',
      recommendation: 'Priorize recuperação, considere descanso',
    }
  }
}
