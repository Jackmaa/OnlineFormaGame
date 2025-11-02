// src/Characters.js

/**
 * Configuration de tous les personnages jouables
 * Chaque personnage a des stats uniques et une arme de départ
 */

export const CHARACTERS = {
  vincent: {
    name: "Vincent",
    sprite: "vincent.png",
    description: "Équilibré - Le développeur polyvalent",
    startWeapon: "sword",
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
    },
  },

  ahlem: {
    name: "Ahlem",
    sprite: "ahlem.png",
    description: "Vitesse - Rapide et agile",
    startWeapon: "boomerang", // 🪃 Boomerang rapide
    stats: {
      maxHp: 80,
      speed: 180,
      damageMultiplier: 0.9,
      cooldownMultiplier: 0.9,
      xpMultiplier: 1.0,
    },
  },

  cedric: {
    name: "Cédric",
    sprite: "cedric.png",
    description: "Tank - Résistant aux dégâts",
    startWeapon: "orbital", // 🛡️ Protection orbitale
    stats: {
      maxHp: 150,
      speed: 120,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.1,
      xpMultiplier: 1.0,
    },
  },

  christelle: {
    name: "Christelle",
    sprite: "christelle.png",
    description: "Attaque rapide - Cooldowns réduits",
    startWeapon: "projectile", // 🎯 Tirs rapides
    stats: {
      maxHp: 90,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 0.7,
      xpMultiplier: 1.0,
    },
  },

  fabien: {
    name: "Fabien",
    sprite: "fabien.png",
    description: "XP Boost - +30% XP gagnée",
    startWeapon: "orbital", // 📚 Orbes de savoir
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.3,
    },
  },

  illias: {
    name: "Illias",
    sprite: "illias.png",
    description: "Portée - +40% taille des armes",
    startWeapon: "sword", // 🗡️ Lance longue portée
    stats: {
      maxHp: 90,
      speed: 145,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      areaMultiplier: 1.4,
    },
  },

  leV: {
    name: "LeV",
    sprite: "leV.png",
    description: "Critique - +25% dégâts critiques",
    startWeapon: "sword", // ⚔️ Katana critique
    stats: {
      maxHp: 85,
      speed: 150,
      damageMultiplier: 1.25,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      critChance: 0.25,
    },
  },

  lionel: {
    name: "Lionel",
    sprite: "lionel.png",
    description: "Régénération - +1 HP par seconde",
    startWeapon: "orbital", // 🌟 Aura de guérison
    stats: {
      maxHp: 120,
      speed: 135,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      hpRegen: 1.0,
    },
  },

  lucile: {
    name: "Lucile",
    sprite: "lucile.png",
    description: "Multi-projectiles - +1 projectile de base",
    startWeapon: "projectile", // 🎨 Orbes multiples
    stats: {
      maxHp: 95,
      speed: 155,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      projectileBonus: 1,
    },
  },

  marc: {
    name: "Marc",
    sprite: "marc.png",
    description: "Zone d'effet - +30% zone",
    startWeapon: "sword", // 🪓 Hache zone
    stats: {
      maxHp: 100,
      speed: 145,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      areaMultiplier: 1.3,
    },
  },

  mathieu: {
    name: "Mathieu",
    sprite: "mathieu.png",
    description: "Dégâts - +25% dégâts",
    startWeapon: "sword", // ⚔️ Grande épée
    stats: {
      maxHp: 90,
      speed: 150,
      damageMultiplier: 1.25,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
    },
  },

  sabah: {
    name: "Sabah",
    sprite: "sabah.png",
    description: "Magnétisme - +50% portée XP",
    startWeapon: "boomerang", // 🪃 Fouet magnétique
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      magnetRange: 100,
    },
  },

  samy: {
    name: "Samy",
    sprite: "samy.png",
    description: "Esquive - +10% vitesse et esquive",
    startWeapon: "boomerang", // 🪭 Éventail agile
    stats: {
      maxHp: 85,
      speed: 165,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      dodgeChance: 0.1,
    },
  },

  serge: {
    name: "Serge",
    sprite: "serge.png",
    description: "Boss Killer - +50% dégâts vs Boss",
    startWeapon: "projectile", // 🏹 Arbalète
    stats: {
      maxHp: 110,
      speed: 145,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      bossDamageMultiplier: 1.5,
    },
  },

  thomas: {
    name: "Thomas",
    sprite: "thomas.png",
    description: "Croissance - Stats +5% par niveau",
    startWeapon: "orbital", // 🪄 Baguette magique
    stats: {
      maxHp: 80,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      growthRate: 1.05,
    },
  },

  valentin: {
    name: "Valentin",
    sprite: "valentin.png",
    description: "Chance - +20% meilleurs drops",
    startWeapon: "projectile", // 🎲 Dés de chance
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      luckMultiplier: 1.2,
    },
  },
};

/**
 * Récupère un personnage par son ID
 */
export function getCharacter(id) {
  return CHARACTERS[id] || CHARACTERS.vincent;
}

/**
 * Liste tous les personnages disponibles
 */
export function getAllCharacters() {
  return Object.entries(CHARACTERS).map(([id, data]) => ({
    id,
    ...data,
  }));
}
