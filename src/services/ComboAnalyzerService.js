/**
 * Servicio de Análisis de Combos
 * Valida, enriquece y calcula scores para combos
 */
class ComboAnalyzerService {
  constructor() {
    this.validationResults = new Map();
  }

  /**
   * Analizar un combo completo
   */
  analyzeCombo(combo, champion) {
    console.log(`🔍 Analizando combo: ${combo.name}`);

    const analysis = {
      isValid: true,
      issues: [],
      warnings: [],
      damageCalculation: this.calculateDamage(combo, champion),
      timingValidation: this.validateTiming(combo),
      viabilityScore: 0,
      context: this.analyzeContext(combo, champion)
    };

    // Validar lógica del combo
    if (!this.validateComboLogic(combo, champion)) {
      analysis.isValid = false;
      analysis.issues.push('Combo logic is invalid');
    }

    // Calcular score de viabilidad
    analysis.viabilityScore = this.calculateViabilityScore(combo, analysis);

    combo.analysis = analysis;
    return analysis;
  }

  /**
   * Calcular daño teórico del combo
   */
  calculateDamage(combo, champion) {
    const breakdown = [];
    let totalDamage = 0;

    // Asumir stats de mid-game
    const stats = {
      level: 9,
      abilityPower: 150,
      attackDamage: 80,
      enemyArmor: 80,
      enemySpellResist: 60
    };

    for (const abilitySeq of combo.abilities) {
      const ability = champion.getAbility(abilitySeq.key);
      if (!ability) continue;

      // Daño base simulado
      const baseDamage = this.getAbilityBaseDamage(ability, stats.level);
      
      // Scaling
      let scalingDamage = 0;
      if (ability.key === 'Q') scalingDamage = stats.abilityPower * 0.6;
      if (ability.key === 'W') scalingDamage = stats.abilityPower * 0.5;
      if (ability.key === 'E') scalingDamage = stats.abilityPower * 0.4;
      if (ability.key === 'R') scalingDamage = stats.abilityPower * 0.8;

      // Aplicar resistencias
      const finalDamage = this.applyResistances(
        baseDamage + scalingDamage,
        'magic',
        stats.enemyArmor,
        stats.enemySpellResist
      );

      breakdown.push({
        ability: ability.name,
        baseDamage,
        scalingDamage,
        finalDamage
      });

      totalDamage += finalDamage;
    }

    return {
      totalDamage: Math.round(totalDamage),
      breakdown,
      stats
    };
  }

  /**
   * Validar timing del combo
   */
  validateTiming(combo) {
    const issues = [];
    let totalTime = 0;

    for (let i = 0; i < combo.abilities.length; i++) {
      const ability = combo.abilities[i];
      totalTime += ability.timingMs || 0;

      if (ability.timingMs < 0) {
        issues.push(`Invalid timing for ${ability.name}: negative value`);
      }
      if (ability.timingMs > 5000) {
        issues.push(`Timing too long for ${ability.name}: ${ability.timingMs}ms`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      totalExecutionTime: totalTime
    };
  }

  /**
   * Validar lógica del combo
   */
  validateComboLogic(combo, champion) {
    // Verificar que todas las habilidades existan
    for (const ability of combo.abilities) {
      if (!champion.hasAbility(ability.key)) {
        return false;
      }
    }

    // Verificar que no haya duplicados inmediatos
    for (let i = 1; i < combo.abilities.length; i++) {
      if (combo.abilities[i].key === combo.abilities[i - 1].key) {
        return false;
      }
    }

    return true;
  }

  /**
   * Analizar contexto del combo
   */
  analyzeContext(combo, champion) {
    const context = {
      earlygameViable: false,
      midgameViable: false,
      lategameViable: false,
      teamfightViable: false,
      laningViable: false
    };

    const executionTime = combo.getTotalExecutionTime();
    const damage = combo.effectiveness.damageOutput;

    if (executionTime < 1000) context.earlygameViable = true;
    if (executionTime < 2000) context.midgameViable = true;
    if (damage > 500) context.lategameViable = true;
    if (combo.tags.includes('teamfight')) context.teamfightViable = true;
    if (combo.conditions.minLevel <= 3) context.laningViable = true;

    return context;
  }

  /**
   * Calcular score de viabilidad (0-1)
   */
  calculateViabilityScore(combo, analysis) {
    let score = 1.0;

    // Timing (40%)
    const timingScore = analysis.timingValidation.isValid ? 1.0 : 0.5;
    score *= timingScore * 0.4;

    // Daño (30%)
    const damageScore = Math.min(analysis.damageCalculation.totalDamage / 1000, 1.0);
    score += damageScore * 0.3;

    // Dificultad (20%)
    const difficultyScores = {
      'easy': 1.0,
      'medium': 0.8,
      'hard': 0.6,
      'extreme': 0.4
    };
    const difficultyScore = difficultyScores[combo.effectiveness.difficulty] || 0.5;
    score += difficultyScore * 0.2;

    // Confiabilidad (10%)
    score += combo.effectiveness.reliability * 0.1;

    return Math.max(0, Math.min(score, 1.0));
  }

  /**
   * Generar variaciones del combo
   */
  generateVariations(combo, champion) {
    const variations = [];

    // Variación sin ultimate
    if (combo.abilities.some(a => a.key === 'R')) {
      const earlyVariation = combo.abilities.filter(a => a.key !== 'R');
      if (earlyVariation.length > 0) {
        variations.push({
          name: `${combo.name} (Early Game)`,
          description: 'Sin ultimate para early laning',
          context: 'early_game',
          abilities: earlyVariation.map(a => a.key).join('-')
        });
      }
    }

    // Variación corta (primeras 2 habilidades)
    if (combo.abilities.length > 2) {
      variations.push({
        name: `${combo.name} (Quick)`,
        description: 'Versión rápida para burst inicial',
        context: 'laning',
        abilities: combo.abilities.slice(0, 2).map(a => a.key).join('-')
      });
    }

    return variations;
  }

  /**
   * Deduplicar combos similares
   */
  deduplicateCombos(combos) {
    const deduped = new Map();

    for (const combo of combos) {
      const key = this.generateComboKey(combo);

      if (!deduped.has(key)) {
        deduped.set(key, combo);
      } else {
        // Fusionar fuentes
        const existing = deduped.get(key);
        existing.sources.push(...combo.sources);

        // Mantener mayor confiabilidad
        if (combo.effectiveness.reliability > existing.effectiveness.reliability) {
          existing.effectiveness.reliability = combo.effectiveness.reliability;
        }
      }
    }

    return Array.from(deduped.values());
  }

  /**
   * Generar clave única para combo
   */
  generateComboKey(combo) {
    const sequence = combo.abilities.map(a => a.key).join('-');
    return `${combo.championId}_${sequence}`;
  }

  /**
   * Calcular similitud entre combos
   */
  calculateSimilarity(combo1, combo2) {
    const seq1 = combo1.abilities.map(a => a.key).join('');
    const seq2 = combo2.abilities.map(a => a.key).join('');
    const distance = this.levenshteinDistance(seq1, seq2);
    const maxLength = Math.max(seq1.length, seq2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Distancia de Levenshtein
   */
  levenshteinDistance(s1, s2) {
    const matrix = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[s2.length][s1.length];
  }

  // Helpers
  getAbilityBaseDamage(ability, level) {
    const baseDamages = {
      'Q': [50, 65, 80, 95, 110, 125, 140, 155, 170, 185, 200, 215, 230, 245, 260, 275, 290, 305],
      'W': [40, 55, 70, 85, 100, 115, 130, 145, 160, 175, 190, 205, 220, 235, 250, 265, 280, 295],
      'E': [30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285],
      'R': [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950]
    };

    return baseDamages[ability.key]?.[Math.min(level - 1, 17)] || 50;
  }

  applyResistances(damage, damageType, armor, spellResist) {
    if (damageType === 'true') return damage;

    const resistance = damageType === 'physical' ? armor : spellResist;
    const multiplier = 100 / (100 + resistance);

    return damage * multiplier;
  }
}

module.exports = ComboAnalyzerService;
