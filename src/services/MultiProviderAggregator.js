/**
 * SERVICIO DE AGREGACIÓN MULTI-PROVEEDOR
 * Combina datos de múltiples proveedores (Manus, WildRiftFire, BestBuildWR)
 */

const fs = require('fs');
const path = require('path');

class MultiProviderAggregator {
    constructor() {
        this.providers = {};
        this.mergedData = {};
    }

    /**
     * Registrar un proveedor de datos
     */
    registerProvider(name, provider) {
        this.providers[name] = provider;
        console.log(`✓ Proveedor registrado: ${name}`);
    }

    /**
     * Obtener datos de un campeón desde todos los proveedores
     */
    async getChampionFromAllProviders(championId) {
        const results = {};

        for (const [providerName, provider] of Object.entries(this.providers)) {
            try {
                if (provider.getChampion) {
                    const data = provider.getChampion(championId);
                    if (data) {
                        results[providerName] = data;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error obteniendo datos de ${providerName}:`, error.message);
            }
        }

        return results;
    }

    /**
     * Fusionar datos de múltiples proveedores
     * Estrategia: Prioridad a Manus, luego WildRiftFire, luego BestBuildWR
     */
    mergeChampionData(dataFromProviders) {
        const priority = ['Manus', 'WildRiftFire', 'BestBuildWR'];
        const merged = {};

        // Copiar datos base del proveedor de mayor prioridad
        for (const providerName of priority) {
            if (dataFromProviders[providerName]) {
                Object.assign(merged, dataFromProviders[providerName]);
                merged.primarySource = providerName;
                break;
            }
        }

        // Enriquecer con datos de otros proveedores
        merged.sources = Object.keys(dataFromProviders);
        merged.dataFromProviders = dataFromProviders;

        // Fusionar builds
        merged.builds = this.mergeBuilds(dataFromProviders);

        // Fusionar matchups
        merged.matchups = this.mergeMatchups(dataFromProviders);

        // Fusionar combos
        merged.combos = this.mergeCombos(dataFromProviders);

        // Agregar estadísticas meta
        merged.metaStats = this.aggregateMetaStats(dataFromProviders);

        return merged;
    }

    /**
     * Fusionar builds de múltiples proveedores
     */
    mergeBuilds(dataFromProviders) {
        const builds = {};

        for (const [providerName, data] of Object.entries(dataFromProviders)) {
            if (data.builds) {
                for (const build of Object.values(data.builds)) {
                    const key = build.name || 'standard';
                    if (!builds[key]) {
                        builds[key] = {
                            name: build.name,
                            items: [],
                            sources: []
                        };
                    }
                    builds[key].sources.push(providerName);
                    if (build.items) {
                        builds[key].items = [...new Set([...builds[key].items, ...build.items])];
                    }
                }
            }
        }

        return builds;
    }

    /**
     * Fusionar matchups
     */
    mergeMatchups(dataFromProviders) {
        const matchups = {
            favorable: [],
            unfavorable: []
        };

        for (const data of Object.values(dataFromProviders)) {
            if (data.matchups) {
                if (data.matchups.favorable) {
                    matchups.favorable = [...new Set([...matchups.favorable, ...data.matchups.favorable])];
                }
                if (data.matchups.unfavorable) {
                    matchups.unfavorable = [...new Set([...matchups.unfavorable, ...data.matchups.unfavorable])];
                }
            }
        }

        return matchups;
    }

    /**
     * Fusionar combos
     */
    mergeCombos(dataFromProviders) {
        const combosMap = new Map();

        for (const data of Object.values(dataFromProviders)) {
            if (data.combos && Array.isArray(data.combos)) {
                for (const combo of data.combos) {
                    const key = combo.name || combo.id;
                    if (!combosMap.has(key)) {
                        combosMap.set(key, combo);
                    }
                }
            }
        }

        return Array.from(combosMap.values());
    }

    /**
     * Agregar estadísticas meta
     */
    aggregateMetaStats(dataFromProviders) {
        const stats = {
            sources: Object.keys(dataFromProviders),
            aggregatedAt: new Date().toISOString()
        };

        // Calcular promedio de win rate si está disponible
        let winRates = [];
        for (const data of Object.values(dataFromProviders)) {
            if (data.stats?.winRate) {
                winRates.push(data.stats.winRate);
            }
        }

        if (winRates.length > 0) {
            stats.averageWinRate = (winRates.reduce((a, b) => a + b) / winRates.length).toFixed(2);
        }

        return stats;
    }

    /**
     * Obtener todos los campeones agregados
     */
    getAllChampionsAggregated() {
        const allChampions = [];
        const seen = new Set();

        // Obtener campeones de Manus (proveedor principal)
        if (this.providers.Manus) {
            const champions = this.providers.Manus.loadAllChampions?.() || [];
            for (const champion of champions) {
                if (!seen.has(champion.id)) {
                    seen.add(champion.id);
                    const dataFromProviders = {};
                    dataFromProviders.Manus = champion;
                    
                    // Enriquecer con datos de otros proveedores
                    for (const [providerName, provider] of Object.entries(this.providers)) {
                        if (providerName !== 'Manus' && provider.getChampion) {
                            try {
                                const data = provider.getChampion(champion.id);
                                if (data) {
                                    dataFromProviders[providerName] = data;
                                }
                            } catch (e) {
                                // Ignorar errores
                            }
                        }
                    }

                    allChampions.push(this.mergeChampionData(dataFromProviders));
                }
            }
        }

        return allChampions;
    }

    /**
     * Guardar datos agregados
     */
    saveAggregatedData(outputDir = 'data/aggregated') {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const champions = this.getAllChampionsAggregated();

        // Guardar cada campeón
        for (const champion of champions) {
            const filePath = path.join(outputDir, `${champion.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(champion, null, 2));
        }

        // Guardar índice
        const index = {
            totalChampions: champions.length,
            providers: Object.keys(this.providers),
            champions: champions.map(c => ({
                id: c.id,
                name: c.name,
                title: c.title,
                roles: c.roles,
                sources: c.sources
            })),
            aggregatedAt: new Date().toISOString()
        };

        const indexPath = path.join(outputDir, 'index.json');
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

        console.log(`✓ Datos agregados guardados en: ${outputDir}`);
        console.log(`  - ${champions.length} campeones`);
        console.log(`  - ${Object.keys(this.providers).length} proveedores`);

        return champions;
    }

    /**
     * Obtener estadísticas de agregación
     */
    getAggregationStats() {
        return {
            providers: Object.keys(this.providers),
            totalProviders: Object.keys(this.providers).length,
            aggregatedAt: new Date().toISOString()
        };
    }
}

module.exports = MultiProviderAggregator;
