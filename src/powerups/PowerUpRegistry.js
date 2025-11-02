// src/powerups/PowerUpRegistry.js

import { rollRarity, RarePowerUp, debugDropRates } from "./RaritySystem.js";

/**
 * Classe de base pour tous les power-ups
 */
class PowerUp {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.icon = config.icon || "⭐";
    this.maxLevel = config.maxLevel || 5;
    this.currentLevel = 0;
    this.multiplier = 1.0; // Multiplicateur interne pour la rareté
  }

  apply(player) {
    throw new Error("apply() doit être implémenté");
  }

  levelUp(player) {
    if (this.currentLevel >= this.maxLevel) {
      return false;
    }
    this.currentLevel++;
    this.apply(player);
    return true;
  }

  canLevelUp() {
    return this.currentLevel < this.maxLevel;
  }
}

/**
 * POWER-UPS OFFENSIFS
 */
class DamagePowerUp extends PowerUp {
  constructor() {
    super({
      id: "damage",
      name: "Dégâts +",
      description: "Augmente les dégâts de 20%",
      icon: "⚔️",
      maxLevel: 5,
    });
    this.baseValue = 0.2; // Valeur de base
  }

  apply(player) {
    const value = this.baseValue * this.multiplier;
    player.damageMultiplier += value;
    console.log(
      `✅ Dégâts augmentés de +${(value * 100).toFixed(
        0
      )}% ! Total: ${player.damageMultiplier.toFixed(2)}x`
    );
  }
}

class CooldownPowerUp extends PowerUp {
  constructor() {
    super({
      id: "cooldown",
      name: "Attaque rapide",
      description: "Réduit le cooldown de 15%",
      icon: "⚡",
      maxLevel: 5,
    });
    this.baseValue = 0.15; // Valeur de base
  }

  apply(player) {
    const value = this.baseValue * this.multiplier;
    // Pour le cooldown, on réduit : multiplier par (1 - value)
    const reductionFactor = 1 - Math.min(value, 0.9); // Max 90% de réduction
    player.cooldownMultiplier *= reductionFactor;
    console.log(
      `✅ Cooldown réduit de ${(value * 100).toFixed(
        0
      )}% ! Total: ${player.cooldownMultiplier.toFixed(2)}x`
    );
  }
}

class AreaPowerUp extends PowerUp {
  constructor() {
    super({
      id: "area",
      name: "Zone élargie",
      description: "Augmente la zone de 15%",
      icon: "💥",
      maxLevel: 5,
    });
    this.baseValue = 0.15;
  }

  apply(player) {
    const value = this.baseValue * this.multiplier;
    player.areaMultiplier += value;
    console.log(
      `✅ Zone augmentée de +${(value * 100).toFixed(
        0
      )}% ! Total: ${player.areaMultiplier.toFixed(2)}x`
    );
  }
}

class ProjectilePowerUp extends PowerUp {
  constructor() {
    super({
      id: "projectile",
      name: "Projectiles +",
      description: "Ajoute des projectiles",
      icon: "🎯",
      maxLevel: 3,
    });
    this.baseValue = 1; // 1 projectile de base
  }

  apply(player) {
    const value = Math.floor(this.baseValue * this.multiplier);
    player.projectileBonus += value;
    console.log(
      `✅ ${value} projectile(s) ajouté(s) ! Total: ${
        player.projectileBonus + 1
      }`
    );
  }
}

/**
 * POWER-UPS DÉFENSIFS
 */
class MaxHpPowerUp extends PowerUp {
  constructor() {
    super({
      id: "maxhp",
      name: "Vitalité +",
      description: "Augmente les HP max",
      icon: "❤️",
      maxLevel: 10,
    });
    this.baseValue = 20;
  }

  apply(player) {
    const value = Math.floor(this.baseValue * this.multiplier);
    player.maxHp += value;
    player.setHp(player.hp + value);
    console.log(`✅ +${value} HP max ! Nouveau max: ${player.maxHp}`);
  }
}

class HealPowerUp extends PowerUp {
  constructor() {
    super({
      id: "heal",
      name: "Soin",
      description: "Restaure 50% des HP",
      icon: "💚",
      maxLevel: 1,
    });
    this.baseValue = 0.5;
  }

  apply(player) {
    const healPercent = this.baseValue * this.multiplier;
    const healAmount = Math.floor(player.maxHp * healPercent);
    player.setHp(player.hp + healAmount);
    console.log(
      `✅ Soigné de ${healAmount} HP (${(healPercent * 100).toFixed(0)}%) !`
    );
  }
}

class RegenPowerUp extends PowerUp {
  constructor() {
    super({
      id: "regen",
      name: "Régénération",
      description: "Régénère des HP/sec",
      icon: "💖",
      maxLevel: 5,
    });
    this.baseValue = 1;
  }

  apply(player) {
    const value = Math.floor(this.baseValue * this.multiplier);
    player.hpRegen += value;
    console.log(
      `✅ Régénération +${value} HP/sec ! Total: ${player.hpRegen} HP/sec`
    );
  }
}

/**
 * POWER-UPS UTILITAIRES
 */
class SpeedPowerUp extends PowerUp {
  constructor() {
    super({
      id: "speed",
      name: "Vitesse +",
      description: "Augmente la vitesse de 10%",
      icon: "💨",
      maxLevel: 5,
    });
    this.baseValue = 0.1;
  }

  apply(player) {
    const value = this.baseValue * this.multiplier;
    player.speed *= 1 + value;
    console.log(
      `✅ Vitesse +${(value * 100).toFixed(
        0
      )}% ! Nouvelle vitesse: ${player.speed.toFixed(0)}`
    );
  }
}

class XpBoostPowerUp extends PowerUp {
  constructor() {
    super({
      id: "xpboost",
      name: "Boost XP",
      description: "Augmente l'XP de 25%",
      icon: "⭐",
      maxLevel: 4,
    });
    this.baseValue = 0.25;
  }

  apply(player) {
    const value = this.baseValue * this.multiplier;
    player.xpMultiplier += value;
    console.log(
      `✅ XP boost +${(value * 100).toFixed(
        0
      )}% ! Total: ${player.xpMultiplier.toFixed(2)}x`
    );
  }
}

class MagnetPowerUp extends PowerUp {
  constructor() {
    super({
      id: "magnet",
      name: "Aimant XP",
      description: "Augmente le rayon de collecte",
      icon: "🧲",
      maxLevel: 3,
    });
    this.baseValue = 50;
  }

  apply(player) {
    const value = Math.floor(this.baseValue * this.multiplier);
    player.magnetRange += value;
    console.log(
      `✅ Rayon magnétique +${value}px ! Total: ${player.magnetRange}px`
    );
  }
}

/**
 * REGISTRE DE TOUS LES POWER-UPS AVEC RARETÉ
 */
export default class PowerUpRegistry {
  constructor() {
    this.powerUps = new Map();
    this._initPowerUps();
  }

  _initPowerUps() {
    // Offensifs
    this.register(new DamagePowerUp());
    this.register(new CooldownPowerUp());
    this.register(new AreaPowerUp());
    this.register(new ProjectilePowerUp());

    // Défensifs
    this.register(new MaxHpPowerUp());
    this.register(new HealPowerUp());
    this.register(new RegenPowerUp());

    // Utilitaires
    this.register(new SpeedPowerUp());
    this.register(new XpBoostPowerUp());
    this.register(new MagnetPowerUp());
  }

  register(powerUp) {
    this.powerUps.set(powerUp.id, powerUp);
  }

  get(id) {
    return this.powerUps.get(id) || null;
  }

  getAll() {
    return Array.from(this.powerUps.values());
  }

  /**
   * ✨ NOUVEAU : Obtenir des power-ups aléatoires AVEC RARETÉ
   * @param {number} count - Nombre de power-ups à générer
   * @param {Array} excludeIds - IDs à exclure
   * @param {number} luckMultiplier - Multiplicateur de chance du joueur
   * @returns {Array<RarePowerUp>} Power-ups avec rareté
   */
  getRandomPowerUps(count = 3, excludeIds = [], luckMultiplier = 1.0) {
    const available = this.getAll().filter(
      (pu) => !excludeIds.includes(pu.id) && pu.canLevelUp()
    );

    if (available.length <= count) {
      // Appliquer la rareté même s'il y a peu de choix
      return available.map((pu) => {
        const rarity = rollRarity(luckMultiplier);
        return new RarePowerUp(pu, rarity);
      });
    }

    const result = [];
    const pool = [...available];

    for (let i = 0; i < count; i++) {
      // Sélectionner un power-up aléatoire
      const index = Math.floor(Math.random() * pool.length);
      const basePowerUp = pool[index];
      pool.splice(index, 1);

      // Déterminer la rareté selon la chance du joueur
      const rarity = rollRarity(luckMultiplier);

      // Créer le power-up avec sa rareté
      const rarePowerUp = new RarePowerUp(basePowerUp, rarity);
      result.push(rarePowerUp);

      // Log pour debug
      console.log(
        `🎲 ${rarity.icon} ${rarePowerUp.name} (${rarity.name}) - ×${rarity.multiplier}`
      );
    }

    return result;
  }

  /**
   * Debug : Afficher les probabilités actuelles
   * @param {number} luckMultiplier - Chance du joueur
   */
  debugRates(luckMultiplier = 1.0) {
    debugDropRates(luckMultiplier);
  }

  getByCategory(category) {
    const categories = {
      offensive: ["damage", "cooldown", "area", "projectile"],
      defensive: ["maxhp", "heal", "regen"],
      utility: ["speed", "xpboost", "magnet"],
    };

    const ids = categories[category] || [];
    return ids.map((id) => this.get(id)).filter(Boolean);
  }

  reset() {
    this.powerUps.clear();
    this._initPowerUps();
  }
}
