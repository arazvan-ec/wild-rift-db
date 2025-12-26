const fs = require('fs');
const path = require('path');

const DDragonAdapter = require('./adapters/DDragonAdapter');
const ComboDataAdapter = require('./adapters/ComboDataAdapter');
const ComboAnalyzerService = require('./services/ComboAnalyzerService');
const DataAggregatorService = require('./services/DataAggregatorService');

/**
 * Script principal: Extrae, analiza y agrega todos los datos
 */
async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   Wild Rift Champion Database - Data Pipeline     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Inicializar adaptadores y servicios
    const ddragonAdapter = new DDragonAdapter();
    const comboAdapter = new ComboDataAdapter();
    const analyzerService = new ComboAnalyzerService();
    const aggregatorService = new DataAggregatorService(
      ddragonAdapter,
      comboAdapter,
      analyzerService
    );

    // Ejecutar pipeline
    console.log('FASE 1: Extrayendo datos de DDragon...');
    console.log('─'.repeat(50));
    const champions = await ddragonAdapter.getChampionsList();
    console.log(`✓ ${champions.length} campeones extraídos\n`);

    console.log('FASE 2: Extrayendo combos...');
    console.log('─'.repeat(50));
    const allCombos = await comboAdapter.getAllCombos();
    console.log(`✓ ${allCombos.length} combos extraídos\n`);

    console.log('FASE 3: Analizando combos...');
    console.log('─'.repeat(50));
    
    // Agrupar combos por campeón
    const combosByChampion = new Map();
    for (const combo of allCombos) {
      if (!combosByChampion.has(combo.championId)) {
        combosByChampion.set(combo.championId, []);
      }
      combosByChampion.get(combo.championId).push(combo);
    }

    // Procesar cada campeón
    let processedCount = 0;
    for (const champion of champions) {
      const combos = combosByChampion.get(champion.name) || [];
      
      for (const combo of combos) {
        analyzerService.analyzeCombo(combo, champion);
      }

      const dedupedCombos = analyzerService.deduplicateCombos(combos);
      dedupedCombos.sort((a, b) => b.getScore() - a.getScore());
      champion.combos = dedupedCombos;

      if (dedupedCombos.length > 0) {
        processedCount++;
      }
    }

    console.log(`✓ ${processedCount} campeones con combos procesados\n`);

    console.log('FASE 4: Calculando estadísticas...');
    console.log('─'.repeat(50));
    const stats = aggregatorService.getStatistics(champions);
    
    console.log(`\n📊 ESTADÍSTICAS GENERALES:`);
    console.log(`   • Total de campeones: ${stats.totalChampions}`);
    console.log(`   • Campeones con combos: ${stats.championsWithCombos}`);
    console.log(`   • Total de combos: ${stats.totalCombos}`);
    console.log(`   • Promedio de combos/campeón: ${stats.averageCombosPerChampion}`);
    console.log(`   • Score promedio de combos: ${stats.averageComboScore}`);
    
    console.log(`\n📈 COMBOS POR DIFICULTAD:`);
    console.log(`   • Easy: ${stats.combosByDifficulty.easy}`);
    console.log(`   • Medium: ${stats.combosByDifficulty.medium}`);
    console.log(`   • Hard: ${stats.combosByDifficulty.hard}`);
    console.log(`   • Extreme: ${stats.combosByDifficulty.extreme}`);

    console.log(`\n🏆 TOP 10 COMBOS:`);
    stats.topCombos.forEach((combo, idx) => {
      console.log(`   ${idx + 1}. ${combo.champion} - ${combo.name} (${combo.difficulty}) [${combo.score}]`);
    });

    // Guardar datos en JSON
    console.log(`\n💾 Guardando datos...\n`);
    const dataDir = path.join(__dirname, '../data/processed');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Guardar campeones
    const championsData = champions.map(c => c.toJSON());
    fs.writeFileSync(
      path.join(dataDir, 'champions.json'),
      JSON.stringify(championsData, null, 2)
    );
    console.log('✓ champions.json guardado');

    // Guardar combos
    const combosData = allCombos.map(c => c.toJSON());
    fs.writeFileSync(
      path.join(dataDir, 'combos.json'),
      JSON.stringify(combosData, null, 2)
    );
    console.log('✓ combos.json guardado');

    // Guardar estadísticas
    fs.writeFileSync(
      path.join(dataDir, 'statistics.json'),
      JSON.stringify(stats, null, 2)
    );
    console.log('✓ statistics.json guardado');

    console.log('\n✅ Pipeline completado exitosamente\n');

    return { champions, allCombos, stats };

  } catch (error) {
    console.error('\n❌ Error en pipeline:', error);
    process.exit(1);
  }
}

// Ejecutar
main().then(() => {
  console.log('📁 Datos disponibles en: /data/processed/');
});
