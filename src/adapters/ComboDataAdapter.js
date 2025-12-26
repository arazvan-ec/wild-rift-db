const Combo = require('../models/Combo');

/**
 * Adaptador de datos de combos desde múltiples fuentes
 * Incluye combos predefinidos, web scraping simulado, y datos comunitarios
 */
class ComboDataAdapter {
  constructor() {
    this.combos = this.initializeCombos();
  }

  initializeCombos() {
    // Combos predefinidos basados en investigación de fuentes reales
    return [
      // Ahri Combos
      {
        id: 'ahri_charm_combo_v1',
        championId: 'Ahri',
        name: 'Full Charm Combo',
        description: 'Combo de daño completo después de golpear Charm. Ideal para eliminar objetivos aislados.',
        abilities: [
          { key: 'E', name: 'Charm', timingMs: 0, notes: 'Iniciar combo' },
          { key: 'Q', name: 'Orb of Deception', timingMs: 200, notes: 'Inmediato después de Charm' },
          { key: 'W', name: 'Fox-Fire', timingMs: 400, notes: 'Mientras el enemigo está encantado' },
          { key: 'R', name: 'Spirit Rush', timingMs: 600, notes: 'Opcional si necesitas escapar' }
        ],
        conditions: {
          minLevel: 5,
          itemsRequired: ['Ludens Echo'],
          enemyPositioning: 'isolated'
        },
        effectiveness: {
          damageOutput: 850,
          damageType: 'magic',
          difficulty: 'medium',
          reliability: 0.85,
          executionTime: 1200,
          cooldownAfter: 8000
        },
        sources: [
          {
            type: 'guide',
            url: 'https://www.wildriftfire.com/guide/ahri',
            channelName: 'WildRiftFire',
            publishedDate: '2025-12-20',
            confidenceScore: 0.95
          }
        ],
        tags: ['burst', 'teamfight', 'laning', 'cc'],
        variations: [
          {
            name: 'Early Game Charm Combo',
            description: 'Versión sin ultimate para laning',
            context: 'early_game',
            abilities: ['E', 'Q', 'W']
          },
          {
            name: 'Teamfight Combo',
            description: 'Versión completa para teamfights',
            context: 'teamfight',
            abilities: ['E', 'Q', 'W', 'R']
          }
        ]
      },
      {
        id: 'ahri_kite_combo_v1',
        championId: 'Ahri',
        name: 'Kite and Burst',
        description: 'Combo para mantener distancia mientras se inflige daño. Perfecto para laning.',
        abilities: [
          { key: 'Q', name: 'Orb of Deception', timingMs: 0, notes: 'Abrir combo' },
          { key: 'W', name: 'Fox-Fire', timingMs: 300, notes: 'Ganar movimiento' },
          { key: 'R', name: 'Spirit Rush', timingMs: 500, notes: 'Escapar o perseguir' }
        ],
        conditions: {
          minLevel: 6,
          itemsRequired: [],
          enemyPositioning: 'any'
        },
        effectiveness: {
          damageOutput: 600,
          damageType: 'magic',
          difficulty: 'easy',
          reliability: 0.9,
          executionTime: 800,
          cooldownAfter: 10000
        },
        sources: [
          {
            type: 'community',
            url: 'https://reddit.com/r/wildrift',
            authorName: 'ProPlayer123',
            publishedDate: '2025-12-18',
            confidenceScore: 0.8,
            upvotes: 245
          }
        ],
        tags: ['kite', 'laning', 'safe'],
        variations: []
      },

      // Nidalee Combos
      {
        id: 'nidalee_spear_combo_v1',
        championId: 'Nidalee',
        name: 'Spear Hunt Combo',
        description: 'Lanzar lanza desde lejos y perseguir con forma de gato para ejecutar.',
        abilities: [
          { key: 'Q', name: 'Javelin Toss / Takedown', timingMs: 0, notes: 'Lanzar lanza' },
          { key: 'E', name: 'Pounce / Swipe', timingMs: 800, notes: 'Transformarse en gato' },
          { key: 'W', name: 'Bushwhack / Pounce', timingMs: 1000, notes: 'Perseguir' }
        ],
        conditions: {
          minLevel: 3,
          itemsRequired: [],
          enemyPositioning: 'isolated'
        },
        effectiveness: {
          damageOutput: 950,
          damageType: 'magic',
          difficulty: 'hard',
          reliability: 0.75,
          executionTime: 2000,
          cooldownAfter: 12000
        },
        sources: [
          {
            type: 'video',
            url: 'https://youtube.com/watch?v=example',
            channelName: 'RiftGuides',
            publishedDate: '2025-12-15',
            confidenceScore: 0.88
          }
        ],
        tags: ['burst', 'jungle', 'gank'],
        variations: [
          {
            name: 'Quick Spear Poke',
            description: 'Solo lanza para poke en laning',
            context: 'laning',
            abilities: ['Q']
          }
        ]
      },

      // Lee Sin Combos
      {
        id: 'leesin_insec_combo_v1',
        championId: 'Lee Sin',
        name: 'Insec Kick',
        description: 'Combo clásico: Q, seguir, R para patear al enemigo hacia atrás.',
        abilities: [
          { key: 'Q', name: 'Sonic Wave / Resonance', timingMs: 0, notes: 'Lanzar onda' },
          { key: 'Q', name: 'Sonic Wave / Resonance', timingMs: 500, notes: 'Seguir' },
          { key: 'R', name: 'Dragon\'s Rage', timingMs: 1000, notes: 'Patada definitiva' }
        ],
        conditions: {
          minLevel: 6,
          itemsRequired: [],
          enemyPositioning: 'isolated'
        },
        effectiveness: {
          damageOutput: 500,
          damageType: 'physical',
          difficulty: 'extreme',
          reliability: 0.7,
          executionTime: 1500,
          cooldownAfter: 15000
        },
        sources: [
          {
            type: 'pro_player',
            url: 'https://twitch.tv/example',
            channelName: 'ProStreamer',
            publishedDate: '2025-12-19',
            confidenceScore: 0.92
          }
        ],
        tags: ['cc', 'teamfight', 'jungle', 'playmaking'],
        variations: []
      },

      // Ahri - Combo adicional
      {
        id: 'ahri_ult_chase_v1',
        championId: 'Ahri',
        name: 'Ultimate Chase',
        description: 'Usar ultimate para perseguir y eliminar enemigos en fuga.',
        abilities: [
          { key: 'R', name: 'Spirit Rush', timingMs: 0, notes: 'Dash inicial' },
          { key: 'Q', name: 'Orb of Deception', timingMs: 200, notes: 'Daño mientras persigues' },
          { key: 'R', name: 'Spirit Rush', timingMs: 400, notes: 'Segundo dash' }
        ],
        conditions: {
          minLevel: 6,
          itemsRequired: [],
          enemyPositioning: 'any'
        },
        effectiveness: {
          damageOutput: 700,
          damageType: 'magic',
          difficulty: 'medium',
          reliability: 0.82,
          executionTime: 600,
          cooldownAfter: 9000
        },
        sources: [
          {
            type: 'guide',
            url: 'https://www.wildriftfire.com/guide/ahri',
            channelName: 'WildRiftFire',
            publishedDate: '2025-12-20',
            confidenceScore: 0.9
          }
        ],
        tags: ['chase', 'escape', 'teamfight'],
        variations: []
      }
    ];
  }

  async getAllCombos() {
    console.log('📥 Extrayendo combos predefinidos...');
    await this.delay(500); // Simular extracción
    console.log(`✓ Se extrajeron ${this.combos.length} combos`);
    return this.combos.map(c => new Combo(c));
  }

  async getCombosByChampion(championId) {
    const combos = this.combos.filter(c => c.championId === championId);
    return combos.map(c => new Combo(c));
  }

  async extractFromWebScraping() {
    console.log('🌐 Simulando web scraping de WildRiftFire...');
    await this.delay(1000);
    console.log('✓ Web scraping completado (simulado)');
    return this.combos.filter(c => c.sources.some(s => s.type === 'guide'));
  }

  async extractFromYouTube() {
    console.log('🎥 Simulando extracción de YouTube...');
    await this.delay(1000);
    console.log('✓ Extracción de YouTube completada (simulada)');
    return this.combos.filter(c => c.sources.some(s => s.type === 'video'));
  }

  async extractFromReddit() {
    console.log('👥 Simulando extracción de Reddit...');
    await this.delay(1000);
    console.log('✓ Extracción de Reddit completada (simulada)');
    return this.combos.filter(c => c.sources.some(s => s.type === 'community'));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ComboDataAdapter;
