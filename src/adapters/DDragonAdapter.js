const axios = require('axios');
const Champion = require('../models/Champion');

/**
 * Adaptador para la API oficial de Riot Games (Data Dragon)
 * Extrae información de campeones, habilidades y estadísticas
 */
class DDragonAdapter {
  constructor() {
    this.baseUrl = 'https://ddragon.leagueoflegends.com/api/lol/en_US/v1';
    this.cache = new Map();
    this.lastUpdate = null;
  }

  async getChampionsList() {
    if (this.cache.has('champions_list')) {
      console.log('✓ Usando caché de campeones');
      return this.cache.get('champions_list');
    }

    try {
      console.log('📥 Extrayendo lista de campeones desde DDragon...');
      const response = await axios.get(`${this.baseUrl}/champion.json`, {
        timeout: 5000
      });

      const championsData = response.data.data;
      const champions = [];

      for (const [key, data] of Object.entries(championsData)) {
        const champion = this.transformToChampion(data);
        champions.push(champion);
      }

      this.cache.set('champions_list', champions);
      this.lastUpdate = new Date();

      console.log(`✓ Se extrajeron ${champions.length} campeones`);
      return champions;

    } catch (error) {
      console.error('✗ Error al extraer campeones:', error.message);
      console.log('⚠ Usando datos simulados...');
      
      // Retornar datos simulados
      const simulatedChampions = this.getSimulatedChampions();
      this.cache.set('champions_list', simulatedChampions);
      return simulatedChampions;
    }
  }

  getSimulatedChampions() {
    // Datos simulados de campeones para demostración
    const simulated = [
      {
        id: 'Ahri',
        name: 'Ahri',
        title: 'the Nine-Tailed Fox',
        blurb: 'A mage with powerful crowd control abilities',
        partype: 'Mana',
        tags: ['Mage', 'Support'],
        stats: {
          hp: 526,
          mp: 418,
          armor: 18.72,
          spellblock: 30,
          attackdamage: 53.04,
          attackspeed: 0.668,
          movespeed: 330,
          attackrange: 550
        },
        passive: { name: 'Essence Theft', description: 'Ahri gains a stack...' },
        spells: [
          { name: 'Orb of Deception', description: 'Ahri throws an orb...', cooldown: [7, 6.5, 6, 5.5, 5], cost: [50, 60, 70, 80, 90], range: [880] },
          { name: 'Fox-Fire', description: 'Ahri releases fox-fire...', cooldown: [7, 6.5, 6, 5.5, 5], cost: [50, 60, 70, 80, 90], range: [550] },
          { name: 'Charm', description: 'Ahri blows a kiss...', cooldown: [12, 11, 10, 9, 8], cost: [50, 60, 70, 80, 90], range: [975] },
          { name: 'Spirit Rush', description: 'Ahri dashes forward...', cooldown: [130, 100, 70], cost: [100, 100, 100], range: [550] }
        ]
      },
      {
        id: 'Nidalee',
        name: 'Nidalee',
        title: 'the Bestial Huntress',
        blurb: 'A jungler with powerful ganking potential',
        partype: 'Mana',
        tags: ['Assassin', 'Mage'],
        stats: {
          hp: 570,
          mp: 375,
          armor: 21,
          spellblock: 30,
          attackdamage: 54,
          attackspeed: 0.625,
          movespeed: 335,
          attackrange: 525
        },
        passive: { name: 'Prowl', description: 'Nidalee gains movement speed...' },
        spells: [
          { name: 'Javelin Toss / Takedown', description: 'Nidalee throws a javelin...', cooldown: [6, 5.5, 5, 4.5, 4], cost: [50, 60, 70, 80, 90], range: [1500] },
          { name: 'Bushwhack / Pounce', description: 'Nidalee sets a trap...', cooldown: [10, 9, 8, 7, 6], cost: [60, 70, 80, 90, 100], range: [900] },
          { name: 'Pounce / Swipe', description: 'Nidalee pounces...', cooldown: [5, 4.5, 4, 3.5, 3], cost: [50, 60, 70, 80, 90], range: [750] },
          { name: 'Aspect of the Cougar', description: 'Nidalee transforms...', cooldown: [3, 3, 3], cost: [0, 0, 0], range: [0] }
        ]
      },
      {
        id: 'Lee Sin',
        name: 'Lee Sin',
        title: 'the Blind Monk',
        blurb: 'A versatile jungler with high mobility',
        partype: 'Energy',
        tags: ['Fighter', 'Assassin'],
        stats: {
          hp: 570,
          mp: 200,
          armor: 24,
          spellblock: 30,
          attackdamage: 68,
          attackspeed: 0.681,
          movespeed: 335,
          attackrange: 125
        },
        passive: { name: 'Flurry', description: 'Lee Sin gains attack speed...' },
        spells: [
          { name: 'Sonic Wave / Resonance', description: 'Lee Sin throws a sonic wave...', cooldown: [8, 7, 6, 5, 4], cost: [50, 50, 50, 50, 50], range: [1100] },
          { name: 'Safeguard / Iron Will', description: 'Lee Sin dashes to an ally...', cooldown: [8, 7, 6, 5, 4], cost: [50, 50, 50, 50, 50], range: [685] },
          { name: 'Tempest / Cripple', description: 'Lee Sin sends out a shockwave...', cooldown: [8, 7, 6, 5, 4], cost: [50, 50, 50, 50, 50], range: [325] },
          { name: 'Dragon\'s Rage', description: 'Lee Sin performs a powerful kick...', cooldown: [120, 90, 60], cost: [0, 0, 0], range: [375] }
        ]
      }
    ];

    return simulated.map(data => this.transformToChampion(data));
  }

  async getChampion(championId) {
    const cacheKey = `champion_${championId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/champion/${championId}.json`,
        { timeout: 5000 }
      );

      const championData = response.data.data[championId];
      const champion = this.transformToChampion(championData);
      this.cache.set(cacheKey, champion);

      return champion;

    } catch (error) {
      console.error(`✗ Error al extraer campeón ${championId}:`, error.message);
      throw error;
    }
  }

  transformToChampion(ddragonData) {
    const abilities = {
      p: {
        key: 'P',
        name: ddragonData.passive?.name || 'Passive',
        description: ddragonData.passive?.description || ''
      }
    };

    // Mapear habilidades Q, W, E, R
    const spellKeys = ['q', 'w', 'e', 'r'];
    ddragonData.spells?.forEach((spell, index) => {
      if (index < 4) {
        abilities[spellKeys[index]] = {
          key: spellKeys[index].toUpperCase(),
          name: spell.name,
          description: spell.description,
          cooldowns: spell.cooldown || [],
          costs: spell.cost || [],
          range: spell.range?.[0] || 0
        };
      }
    });

    const champion = new Champion({
      id: ddragonData.id,
      name: ddragonData.name,
      title: ddragonData.title,
      description: ddragonData.blurb,
      resourceType: ddragonData.partype,
      attackRange: ddragonData.stats?.attackrange || 0,
      movementSpeed: ddragonData.stats?.movespeed || 330,
      abilities: abilities,
      baseStats: {
        health: ddragonData.stats?.hp || 0,
        mana: ddragonData.stats?.mp || 0,
        armor: ddragonData.stats?.armor || 0,
        spellResist: ddragonData.stats?.spellblock || 0,
        attackDamage: ddragonData.stats?.attackdamage || 0,
        attackSpeed: ddragonData.stats?.attackspeed || 0
      },
      roles: ddragonData.tags || [],
      imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ddragonData.id}_0.jpg`
    });

    return champion;
  }

  clearCache() {
    this.cache.clear();
    this.lastUpdate = null;
  }

  getLastUpdate() {
    return this.lastUpdate;
  }
}

module.exports = DDragonAdapter;
