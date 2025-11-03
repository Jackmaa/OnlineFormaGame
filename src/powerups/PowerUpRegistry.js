// src/powerups/PowerUpRegistry.js
import { RarePowerUp, rollRarity } from "./RaritySystem.js";
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
    if (!player.damageBonus) player.damageBonus = 1;
    player.damageBonus += 0.2;
    player.damageMultiplier = player.damageBonus;
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
    if (!player.cooldownBonus) player.cooldownBonus = 0;
    player.cooldownBonus += 0.15;
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
    if (!player.areaBonus) player.areaBonus = 1;
    player.areaBonus += 0.15;
    player.areaMultiplier = player.areaBonus;
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
    if (!player.projectileBonus) player.projectileBonus = 0;
    player.projectileBonus += 1;
  }
}

class CriticalPowerUp extends PowerUp {
  constructor() {
    super({
      id: "critical",
      name: "Coups critiques",
      description: "Augmente les critiques de 10%",
      icon: "💢",
      maxLevel: 5,
    });
  }

  apply(player) {
    player.critChance = (player.critChance || 0) + 0.1;
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
    if (player.setHp) {
      player.setHp(player.hp + 20);
    } else {
      player.hp += 20;
    }
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
    if (player.setHp) {
      player.setHp(player.hp + healAmount);
    } else {
      player.hp = Math.min(player.hp + healAmount, player.maxHp);
    }
  }
}

class RegenPowerUp extends PowerUp {
  constructor() {
    super({
      id: "regen",
      name: "Régénération",
      description: "Régénère 1 HP/5s",
      icon: "💖",
      maxLevel: 5,
    });
  }

  apply(player) {
    if (!player.hasRegen) {
      player.hasRegen = true;
      player.regenTimer = 0;
      player.regenRate = 5.0;
      player.regenAmount = 1;
    } else {
      player.regenRate = Math.max(1.0, player.regenRate - 0.5);
      player.regenAmount++;
    }
  }
}

class ArmorPowerUp extends PowerUp {
  constructor() {
    super({
      id: "armor",
      name: "Armure",
      description: "Réduit les dégâts de 10%",
      icon: "🛡️",
      maxLevel: 5,
    });
  }

  apply(player) {
    player.damageReduction = (player.damageReduction || 0) + 0.1;
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
    if (!player.speedBonus) player.speedBonus = 1;
    player.speedBonus += 0.1;
    const baseSpeed = player.characterStats?.speed || 150;
    player.speed = baseSpeed * player.speedBonus;
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
    if (!player.xpBonus) player.xpBonus = 1;
    player.xpBonus += 0.25;
    player.xpMultiplier = player.xpBonus;
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
    if (!player.magnetRange) player.magnetRange = 50;
    player.magnetRange += 50;
  }
}

/**
 * POWER-UPS LÉGENDAIRES
 */
class VampirismPowerUp extends PowerUp {
  constructor() {
    super({
      id: "vampirism",
      name: "Vampirisme",
      description: "Vol de vie : 5% des dégâts",
      icon: "🩸",
      maxLevel: 3,
    });
  }

  apply(player) {
    player.lifesteal = (player.lifesteal || 0) + 0.05;
  }
}

class BerserkPowerUp extends PowerUp {
  constructor() {
    super({
      id: "berserk",
      name: "Rage du Berserker",
      description: "+50% dégâts, -20% HP max",
      icon: "😈",
      maxLevel: 2,
    });
  }

  apply(player) {
    player.damageMultiplier *= 1.5;
    player.maxHp = Math.floor(player.maxHp * 0.8);
    player.hp = Math.min(player.hp, player.maxHp);
  }
}

class TimeWarpPowerUp extends PowerUp {
  constructor() {
    super({
      id: "timewarp",
      name: "Distorsion temporelle",
      description: "Tout va 30% plus vite",
      icon: "⏰",
      maxLevel: 2,
    });
  }

  apply(player) {
    player.cooldownMultiplier *= 0.7;
    player.speed *= 1.3;
  }
}

class LuckPowerUp extends PowerUp {
  constructor() {
    super({
      id: "luck",
      name: "Chance",
      description: "Augmente la chance de drop de +20%",
      icon: "🍀",
      maxLevel: 5,
    });
  }

  apply(player) {
    if (!player.luckBonus) player.luckBonus = 1;
    player.luckBonus += 0.2;
    player.luckMultiplier = player.luckBonus;
  }
}

class RicochetPowerUp extends PowerUp {
  constructor() {
    super({
      id: "ricochet",
      name: "Ricochet",
      description: "Les projectiles rebondissent +1 fois",
      icon: "🔄",
      maxLevel: 3,
    });
  }

  apply(player) {
    if (!player.ricochetCount) player.ricochetCount = 0;
    player.ricochetCount += 1;

    // Activer le système de ricochet
    if (!player.hasRicochet) {
      player.hasRicochet = true;
    }
  }
}

class PiercePowerUp extends PowerUp {
  constructor() {
    super({
      id: "pierce",
      name: "Pénétration",
      description: "Les projectiles traversent +1 ennemi",
      icon: "🎯",
      maxLevel: 5,
    });
  }

  apply(player) {
    if (!player.pierceCount) player.pierceCount = 0;
    player.pierceCount += 1;

    // Activer le système de pierce
    if (!player.hasPierce) {
      player.hasPierce = true;
    }
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
    this.register(new CriticalPowerUp());

    // Défensifs
    this.register(new MaxHpPowerUp());
    this.register(new HealPowerUp());
    this.register(new RegenPowerUp());
    this.register(new ArmorPowerUp());

    // Utilitaires
    this.register(new SpeedPowerUp());
    this.register(new XpBoostPowerUp());
    this.register(new MagnetPowerUp());

    // Légendaires
    this.register(new VampirismPowerUp());
    this.register(new BerserkPowerUp());
    this.register(new TimeWarpPowerUp());
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

  getRandomPowerUps(count = 3, excludeIds = [], luckMultiplier = 1.0) {
    const available = this.getAll().filter(
      (pu) => !excludeIds.includes(pu.id) && pu.canLevelUp()
    );

    if (available.length <= count) {
      // Wrapper tous les power-ups disponibles avec rareté
      return available.map((pu) => {
        const rarity = rollRarity(luckMultiplier);
        return new RarePowerUp(pu, rarity);
      });
    }

    const result = [];
    const pool = [...available];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * pool.length);
      const basePowerUp = pool[index];
      const rarity = rollRarity(luckMultiplier);
      result.push(new RarePowerUp(basePowerUp, rarity));
      pool.splice(index, 1);
    }

    return result;
  }

  getByCategory(category) {
    const categories = {
      offensive: [
        "damage",
        "cooldown",
        "area",
        "projectile",
        "luck",
        "ricochet",
        "pierce",
        "critical",
        "berserk",
      ],
      defensive: ["maxhp", "heal", "regen", "armor", "vampirism"],
      utility: ["speed", "xpboost", "magnet", "timewarp"],
    };

    const ids = categories[category] || [];
    return ids.map((id) => this.get(id)).filter(Boolean);
  }

  reset() {
    this.powerUps.clear();
    this._initPowerUps();
  }
}
