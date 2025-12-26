/**
 * PROVEEDOR MANUS - Generador de datos completos de campeones
 * Este proveedor genera datos detallados de todos los campeones de Wild Rift
 * y los guarda en disco para ser usado como fuente de datos confiable.
 */

const fs = require('fs');
const path = require('path');

// Base de datos de campeones con información detallada
const CHAMPIONS_DATA = {
    'Ahri': {
        id: 'ahri',
        name: 'Ahri',
        title: 'The Nine-Tailed Fox',
        description: 'A mage with powerful crowd control abilities and mobility',
        roles: ['Mage', 'Support'],
        difficulty: 'Medium',
        stats: {
            health: 526,
            mana: 418,
            armor: 18.72,
            spellResist: 30,
            attackDamage: 53.04,
            attackSpeed: 0.668,
            movementSpeed: 330,
            attackRange: 550
        },
        abilities: {
            p: {
                key: 'P',
                name: 'Essence Theft',
                description: 'Ahri gains a stack of Essence Theft whenever she hits an enemy with an ability. At 3 stacks, she consumes them to heal.',
                cooldown: 0,
                cost: 0
            },
            q: {
                key: 'Q',
                name: 'Orb of Deception',
                description: 'Ahri throws an orb that damages enemies on the way out and heals her on the way back.',
                cooldown: 7,
                cost: 50,
                range: 880,
                damage: 'Magic'
            },
            w: {
                key: 'W',
                name: 'Fox-Fire',
                description: 'Ahri releases fox-fire that damages nearby enemies.',
                cooldown: 7,
                cost: 50,
                range: 550,
                damage: 'Magic'
            },
            e: {
                key: 'E',
                name: 'Charm',
                description: 'Ahri blows a kiss that charms an enemy, slowing and making them vulnerable.',
                cooldown: 12,
                cost: 50,
                range: 975,
                damage: 'Magic'
            },
            r: {
                key: 'R',
                name: 'Spirit Rush',
                description: 'Ahri dashes forward and releases fox-fire at nearby enemies.',
                cooldown: 130,
                cost: 100,
                range: 550,
                damage: 'Magic'
            }
        },
        builds: {
            standard: {
                name: 'Standard Build',
                items: ['Ludens Echo', 'Rabadons Deathcap', 'Void Staff', 'Zhonyas Hourglass'],
                boots: 'Sorcerers Shoes',
                description: 'High damage output with defensive utility'
            },
            support: {
                name: 'Support Build',
                items: ['Hollow Radiance', 'Redemption', 'Locket of the Iron Solari'],
                boots: 'Plated Steelcaps',
                description: 'Focus on team utility and protection'
            }
        },
        combos: [
            {
                name: 'Kite and Burst',
                description: 'Combo para mantener distancia mientras se inflige daño',
                abilities: ['Q', 'W', 'R'],
                difficulty: 'Easy',
                damageOutput: 600
            },
            {
                name: 'Full Charm Combo',
                description: 'Combo de daño completo después de golpear Charm',
                abilities: ['E', 'Q', 'W', 'R'],
                difficulty: 'Medium',
                damageOutput: 850
            }
        ],
        matchups: {
            favorable: ['Annie', 'Lux', 'Lissandra'],
            unfavorable: ['Fizz', 'Kassadin', 'Katarina']
        },
        tips: [
            'Use your Q to farm from distance',
            'Charm is your main CC tool - use it wisely',
            'Your R can be used for both offense and escape',
            'Group with your team for maximum impact'
        ],
        source: 'Manus Provider',
        lastUpdated: new Date().toISOString()
    },
    'Lee Sin': {
        id: 'leesin',
        name: 'Lee Sin',
        title: 'The Blind Monk',
        description: 'A versatile jungler with high mobility and playmaking potential',
        roles: ['Fighter', 'Assassin', 'Jungle'],
        difficulty: 'Hard',
        stats: {
            health: 570,
            mana: 200,
            armor: 24,
            spellResist: 30,
            attackDamage: 68,
            attackSpeed: 0.681,
            movementSpeed: 335,
            attackRange: 125
        },
        abilities: {
            p: {
                key: 'P',
                name: 'Flurry',
                description: 'Lee Sin gains attack speed after casting an ability',
                cooldown: 0,
                cost: 0
            },
            q: {
                key: 'Q',
                name: 'Sonic Wave / Resonance',
                description: 'Lee Sin throws a sonic wave that damages enemies. He can follow up to dash to them.',
                cooldown: 8,
                cost: 50,
                range: 1100,
                damage: 'Physical'
            },
            w: {
                key: 'W',
                name: 'Safeguard / Iron Will',
                description: 'Lee Sin dashes to an ally or gains a shield',
                cooldown: 8,
                cost: 50,
                range: 685,
                damage: 'None'
            },
            e: {
                key: 'E',
                name: 'Tempest / Cripple',
                description: 'Lee Sin sends out a shockwave that damages and slows enemies',
                cooldown: 8,
                cost: 50,
                range: 325,
                damage: 'Physical'
            },
            r: {
                key: 'R',
                name: 'Dragons Rage',
                description: 'Lee Sin performs a powerful kick that damages and knocks back an enemy',
                cooldown: 120,
                cost: 0,
                range: 375,
                damage: 'Physical'
            }
        },
        builds: {
            standard: {
                name: 'Bruiser Build',
                items: ['Black Cleaver', 'Trinity Force', 'Steraks Gage'],
                boots: 'Plated Steelcaps',
                description: 'Balance between damage and tankiness'
            },
            assassin: {
                name: 'Assassin Build',
                items: ['Duskblade of Draktharr', 'Seryldas Grudge', 'Marakana'],
                boots: 'Ionian Boots of Lucidity',
                description: 'High burst damage for one-shot potential'
            }
        },
        combos: [
            {
                name: 'Insec Kick',
                description: 'Combo clásico: Q, seguir, R para patear al enemigo hacia atrás',
                abilities: ['Q', 'Q', 'R'],
                difficulty: 'Extreme',
                damageOutput: 500
            }
        ],
        matchups: {
            favorable: ['Amumu', 'Warwick', 'Gragas'],
            unfavorable: ['Nidalee', 'Graves', 'Kindred']
        },
        tips: [
            'Master the Insec kick for playmaking',
            'Use Q to scout and engage',
            'Your W can save teammates - use it wisely',
            'Early ganks are crucial for snowballing'
        ],
        source: 'Manus Provider',
        lastUpdated: new Date().toISOString()
    },
    'Nidalee': {
        id: 'nidalee',
        name: 'Nidalee',
        title: 'The Bestial Huntress',
        description: 'A jungler with powerful ganking potential and hunting mechanics',
        roles: ['Assassin', 'Mage', 'Jungle'],
        difficulty: 'Hard',
        stats: {
            health: 570,
            mana: 375,
            armor: 21,
            spellResist: 30,
            attackDamage: 54,
            attackSpeed: 0.625,
            movementSpeed: 335,
            attackRange: 525
        },
        abilities: {
            p: {
                key: 'P',
                name: 'Prowl',
                description: 'Nidalee gains movement speed when moving through brush',
                cooldown: 0,
                cost: 0
            },
            q: {
                key: 'Q',
                name: 'Javelin Toss / Takedown',
                description: 'Nidalee throws a javelin that damages enemies. In cougar form, she pounces for melee damage.',
                cooldown: 6,
                cost: 50,
                range: 1500,
                damage: 'Magic'
            },
            w: {
                key: 'W',
                name: 'Bushwhack / Pounce',
                description: 'Nidalee sets a trap that reveals enemies. In cougar form, she pounces to a location.',
                cooldown: 10,
                cost: 60,
                range: 900,
                damage: 'Magic'
            },
            e: {
                key: 'E',
                name: 'Pounce / Swipe',
                description: 'Nidalee hunts enemies. In cougar form, she swipes nearby enemies.',
                cooldown: 5,
                cost: 50,
                range: 750,
                damage: 'Magic'
            },
            r: {
                key: 'R',
                name: 'Aspect of the Cougar',
                description: 'Nidalee transforms into a cougar, gaining new abilities and movement speed.',
                cooldown: 3,
                cost: 0,
                range: 0,
                damage: 'None'
            }
        },
        builds: {
            standard: {
                name: 'AP Burst',
                items: ['Ludens Echo', 'Rabadons Deathcap', 'Void Staff'],
                boots: 'Sorcerers Shoes',
                description: 'Maximum damage output with spear hunting'
            }
        },
        combos: [
            {
                name: 'Spear Hunt Combo',
                description: 'Lanzar lanza desde lejos y perseguir con forma de gato',
                abilities: ['Q', 'R', 'Q', 'E'],
                difficulty: 'Hard',
                damageOutput: 950
            }
        ],
        matchups: {
            favorable: ['Amumu', 'Warwick', 'Rammus'],
            unfavorable: ['Lee Sin', 'Graves', 'KhaZix']
        },
        tips: [
            'Land your spears for maximum damage',
            'Use cougar form for mobility and chase',
            'Trap placement is crucial for vision control',
            'Hunt isolated enemies for easy kills'
        ],
        source: 'Manus Provider',
        lastUpdated: new Date().toISOString()
    }
};

class ManusChampsProvider {
    constructor(dataDir = 'data/providers/manus') {
        this.dataDir = dataDir;
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Generar y guardar datos de un campeón
     */
    saveChampion(championName, championData) {
        const filePath = path.join(this.dataDir, `${championData.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(championData, null, 2));
        console.log(`✓ Guardado: ${championName} (${filePath})`);
        return championData;
    }

    /**
     * Generar y guardar todos los campeones
     */
    generateAndSaveAllChampions() {
        console.log('🔄 Generando datos de campeones Manus...\n');
        
        const results = [];
        for (const [name, data] of Object.entries(CHAMPIONS_DATA)) {
            results.push(this.saveChampion(name, data));
        }

        // Guardar índice
        const indexPath = path.join(this.dataDir, 'index.json');
        const index = {
            provider: 'Manus',
            totalChampions: results.length,
            champions: results.map(c => ({
                id: c.id,
                name: c.name,
                title: c.title,
                roles: c.roles,
                difficulty: c.difficulty
            })),
            lastUpdated: new Date().toISOString()
        };
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
        console.log(`\n✓ Índice guardado: ${indexPath}`);

        return results;
    }

    /**
     * Cargar todos los campeones desde disco
     */
    loadAllChampions() {
        const indexPath = path.join(this.dataDir, 'index.json');
        if (!fs.existsSync(indexPath)) {
            console.error('❌ Índice no encontrado. Ejecuta generateAndSaveAllChampions() primero.');
            return [];
        }

        const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        const champions = [];

        for (const championMeta of index.champions) {
            const filePath = path.join(this.dataDir, `${championMeta.id}.json`);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                champions.push(data);
            }
        }

        return champions;
    }

    /**
     * Obtener un campeón específico
     */
    getChampion(championId) {
        const filePath = path.join(this.dataDir, `${championId}.json`);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    /**
     * Obtener estadísticas del proveedor
     */
    getStatistics() {
        const indexPath = path.join(this.dataDir, 'index.json');
        if (!fs.existsSync(indexPath)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }
}

module.exports = ManusChampsProvider;
