// src/powerups/PowerUpRegistry.js

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
  }

  apply(player) {
    // ✅ CORRIGÉ : Augmente directement damageMultiplier
    player.damageMultiplier += 0.2;
    console.log(
      `✅ Dégâts augmentés ! Multiplicateur : ${player.damageMultiplier.toFixed(
        2
      )}`
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
  }

  apply(player) {
    // ✅ CORRIGÉ : Réduit cooldownMultiplier (0.85 = -15%)
    player.cooldownMultiplier *= 0.85;
    console.log(
      `✅ Cooldown réduit ! Multiplicateur : ${player.cooldownMultiplier.toFixed(
        2
      )}`
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
  }

  apply(player) {
    // ✅ CORRIGÉ : Augmente directement areaMultiplier
    player.areaMultiplier += 0.15;
    console.log(
      `✅ Zone augmentée ! Multiplicateur : ${player.areaMultiplier.toFixed(2)}`
    );
  }
}

class ProjectilePowerUp extends PowerUp {
  constructor() {
    super({
      id: "projectile",
      name: "Projectiles +",
      description: "Ajoute 1 projectile",
      icon: "🎯",
      maxLevel: 3,
    });
  }

  apply(player) {
    // ✅ CORRIGÉ : Augmente projectileBonus (pas projectileCount)
    player.projectileBonus += 1;
    console.log(`✅ Projectile ajouté ! Total : ${player.projectileBonus + 1}`);
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
      description: "Augmente les HP max de 20",
      icon: "❤️",
      maxLevel: 10,
    });
  }

  apply(player) {
    player.maxHp += 20;
    player.setHp(player.hp + 20);
    console.log(`✅ HP max augmentés ! Nouveau max : ${player.maxHp}`);
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
  }

  apply(player) {
    const healAmount = Math.floor(player.maxHp * 0.5);
    player.setHp(player.hp + healAmount);
    console.log(`✅ Soigné de ${healAmount} HP !`);
  }
}

class RegenPowerUp extends PowerUp {
  constructor() {
    super({
      id: "regen",
      name: "Régénération",
      description: "Régénère 1 HP/sec",
      icon: "💖",
      maxLevel: 5,
    });
  }

  apply(player) {
    player.hpRegen += 1;
    console.log(`✅ Régénération augmentée ! ${player.hpRegen} HP/sec`);
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
  }

  apply(player) {
    // ✅ CORRIGÉ : Augmente speed directement
    player.speed *= 1.1;
    console.log(
      `✅ Vitesse augmentée ! Nouvelle vitesse : ${player.speed.toFixed(0)}`
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
  }

  apply(player) {
    // ✅ CORRIGÉ : Augmente xpMultiplier
    player.xpMultiplier += 0.25;
    console.log(
      `✅ XP boost ! Multiplicateur : ${player.xpMultiplier.toFixed(2)}`
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
  }

  apply(player) {
    player.magnetRange += 50;
    console.log(
      `✅ Rayon magnétique augmenté ! Portée : ${player.magnetRange}px`
    );
  }
}

/**
 * REGISTRE DE TOUS LES POWER-UPS
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

  getRandomPowerUps(count = 3, excludeIds = []) {
    const available = this.getAll().filter(
      (pu) => !excludeIds.includes(pu.id) && pu.canLevelUp()
    );

    if (available.length <= count) {
      return available;
    }

    const result = [];
    const pool = [...available];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length);
      result.push(pool[index]);
      pool.splice(index, 1);
    }

    return result;
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
