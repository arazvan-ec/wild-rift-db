/**
 * Servicio de Agregación de Datos
 * Combina datos de múltiples fuentes
 */
class DataAggregatorService {
  constructor(ddragonAdapter, comboAdapter, analyzerService) {
    this.ddragonAdapter = ddragonAdapter;
    this.comboAdapter = comboAdapter;
    this.analyzerService = analyzerService;
  }

  /**
   * Agregar todos los datos de un campeón
   */
  async aggregateChampionData(championId) {
    console.log(`\n📊 Agregando datos para ${championId}...`);

    try {
      // 1. Obtener datos base de DDragon
      const champion = await this.ddragonAdapter.getChampion(championId);
      console.log(`✓ Datos base obtenidos: ${champion.name}`);

      // 2. Obtener combos
      const combos = await this.comboAdapter.getCombosByChampion(championId);
      console.log(`✓ ${combos.length} combos obtenidos`);

      // 3. Analizar cada combo
      for (const combo of combos) {
        this.analyzerService.analyzeCombo(combo, champion);
      }

      // 4. Deduplicar combos
      const dedupedCombos = this.analyzerService.deduplicateCombos(combos);
      console.log(`✓ Combos deduplicados: ${dedupedCombos.length}`);

      // 5. Ordenar por score
      dedupedCombos.sort((a, b) => b.getScore() - a.getScore());

      champion.combos = dedupedCombos;

      return champion;

    } catch (error) {
      console.error(`✗ Error agregando datos para ${championId}:`, error.message);
      throw error;
    }
  }

  /**
   * Agregar todos los campeones con sus combos
   */
  async aggregateAllChampions() {
    console.log('\n🌟 INICIANDO AGREGACIÓN DE DATOS COMPLETA\n');

    try {
      // 1. Obtener lista de campeones
      const champions = await this.ddragonAdapter.getChampionsList();
      console.log(`\n📋 Total de campeones: ${champions.length}\n`);

      // 2. Obtener todos los combos
      const allCombos = await this.comboAdapter.getAllCombos();

      // 3. Agrupar combos por campeón
      const combosByChampion = new Map();
      for (const combo of allCombos) {
        if (!combosByChampion.has(combo.championId)) {
          combosByChampion.set(combo.championId, []);
        }
        combosByChampion.get(combo.championId).push(combo);
      }

      // 4. Procesar cada campeón
      for (const champion of champions) {
        const combos = combosByChampion.get(champion.name) || [];
        
        // Analizar combos
        for (const combo of combos) {
          this.analyzerService.analyzeCombo(combo, champion);
        }

        // Deduplicar
        const dedupedCombos = this.analyzerService.deduplicateCombos(combos);
        dedupedCombos.sort((a, b) => b.getScore() - a.getScore());

        champion.combos = dedupedCombos;
      }

      console.log(`\n✓ Agregación completada`);
      return champions;

    } catch (error) {
      console.error('✗ Error en agregación completa:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  getStatistics(champions) {
    const stats = {
      totalChampions: champions.length,
      totalCombos: 0,
      averageCombosPerChampion: 0,
      championsWithCombos: 0,
      averageComboScore: 0,
      combosByDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0,
        extreme: 0
      },
      combosByTag: {},
      topCombos: []
    };

    let totalScore = 0;
    const allCombos = [];

    for (const champion of champions) {
      if (champion.combos && champion.combos.length > 0) {
        stats.championsWithCombos++;
        stats.totalCombos += champion.combos.length;

        for (const combo of champion.combos) {
          allCombos.push(combo);
          totalScore += combo.getScore();

          // Contar por dificultad
          const difficulty = combo.effectiveness.difficulty;
          if (stats.combosByDifficulty[difficulty]) {
            stats.combosByDifficulty[difficulty]++;
          }

          // Contar por tags
          for (const tag of combo.tags) {
            stats.combosByTag[tag] = (stats.combosByTag[tag] || 0) + 1;
          }
        }
      }
    }

    stats.averageCombosPerChampion = stats.championsWithCombos > 0 
      ? (stats.totalCombos / stats.championsWithCombos).toFixed(2)
      : 0;

    stats.averageComboScore = stats.totalCombos > 0 
      ? (totalScore / stats.totalCombos).toFixed(3)
      : 0;

    // Top 10 combos
    stats.topCombos = allCombos
      .sort((a, b) => b.getScore() - a.getScore())
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        champion: c.championId,
        score: c.getScore().toFixed(3),
        difficulty: c.effectiveness.difficulty
      }));

    return stats;
  }
}

module.exports = DataAggregatorService;
