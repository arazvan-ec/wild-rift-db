/**
 * Modelo de Campeón
 */
class Champion {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.title = data.title;
    this.description = data.description;
    this.resourceType = data.resourceType || 'Mana';
    this.attackRange = data.attackRange || 0;
    this.movementSpeed = data.movementSpeed || 330;
    this.abilities = data.abilities || {};
    this.baseStats = data.baseStats || {};
    this.roles = data.roles || [];
    this.combos = data.combos || [];
    this.builds = data.builds || [];
    this.imageUrl = data.imageUrl || '';
  }

  hasAbility(key) {
    return this.abilities[key.toLowerCase()] !== undefined;
  }

  getAbility(key) {
    return this.abilities[key.toLowerCase()];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      title: this.title,
      description: this.description,
      resourceType: this.resourceType,
      attackRange: this.attackRange,
      movementSpeed: this.movementSpeed,
      abilities: this.abilities,
      baseStats: this.baseStats,
      roles: this.roles,
      combos: this.combos,
      builds: this.builds,
      imageUrl: this.imageUrl
    };
  }
}

module.exports = Champion;
