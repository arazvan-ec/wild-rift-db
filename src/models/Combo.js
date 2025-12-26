/**
 * Modelo de Combo
 */
class Combo {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.championId = data.championId;
    this.name = data.name;
    this.description = data.description || '';
    this.abilities = data.abilities || [];
    this.conditions = data.conditions || {};
    this.effectiveness = data.effectiveness || {};
    this.sources = data.sources || [];
    this.tags = data.tags || [];
    this.variations = data.variations || [];
    this.analysis = data.analysis || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return `combo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getAbilitySequence() {
    return this.abilities.map(a => a.key || a.ability).join('-');
  }

  getTotalExecutionTime() {
    return this.abilities.reduce((sum, a) => sum + (a.timingMs || 0), 0);
  }

  getScore() {
    const reliability = this.effectiveness.reliability || 0;
    const difficulty = this.getDifficultyScore();
    const damageScore = Math.min((this.effectiveness.damageOutput || 0) / 1000, 1);
    
    return (reliability * 0.4) + ((1 - difficulty) * 0.3) + (damageScore * 0.3);
  }

  getDifficultyScore() {
    const scores = {
      'easy': 0.1,
      'medium': 0.3,
      'hard': 0.6,
      'extreme': 0.9
    };
    return scores[this.effectiveness.difficulty] || 0.5;
  }

  toJSON() {
    return {
      id: this.id,
      championId: this.championId,
      name: this.name,
      description: this.description,
      abilities: this.abilities,
      conditions: this.conditions,
      effectiveness: this.effectiveness,
      sources: this.sources,
      tags: this.tags,
      variations: this.variations,
      analysis: this.analysis,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Combo;
