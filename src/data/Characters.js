// src/data/Characters.js
export const CHARACTERS = {
  vincent: {
    name: "Vincent",
    sprite: "vincent.png",
    description: "Équilibré - Le développeur polyvalent",
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0
    }
  },
  
  ahlem: {
    name: "Ahlem",
    sprite: "ahlem.png",
    description: "Vitesse - Rapide et agile",
    stats: {
      maxHp: 80,
      speed: 180,
      damageMultiplier: 0.9,
      cooldownMultiplier: 0.9,
      xpMultiplier: 1.0
    }
  },
  
  cedric: {
    name: "Cédric",
    sprite: "cedric.png",
    description: "Tank - Résistant aux dégâts",
    stats: {
      maxHp: 150,
      speed: 120,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.1,
      xpMultiplier: 1.0
    }
  },
  
  christelle: {
    name: "Christelle",
    sprite: "christelle.png",
    description: "Attaque rapide - Cooldowns réduits",
    stats: {
      maxHp: 90,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 0.7,
      xpMultiplier: 1.0
    }
  },
  
  fabien: {
    name: "Fabien",
    sprite: "fabien.png",
    description: "XP Boost - +30% XP gagnée",
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.3
    }
  },
  
  illias: {
    name: "Illias",
    sprite: "illias.png",
    description: "Portée - +40% taille des armes",
    stats: {
      maxHp: 90,
      speed: 145,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      areaMultiplier: 1.4
    }
  },
  
  leV: {
    name: "LeV",
    sprite: "leV.png",
    description: "Critique - +25% dégâts critiques",
    stats: {
      maxHp: 85,
      speed: 150,
      damageMultiplier: 1.25,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      critChance: 0.25
    }
  },
  
  lionel: {
    name: "Lionel",
    sprite: "lionel.png",
    description: "Régénération - +1 HP par seconde",
    stats: {
      maxHp: 120,
      speed: 135,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      hpRegen: 1.0
    }
  },
  
  lucile: {
    name: "Lucile",
    sprite: "lucile.png",
    description: "Multi-projectiles - +1 projectile de base",
    stats: {
      maxHp: 95,
      speed: 155,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      projectileBonus: 1
    }
  },
  
  marc: {
    name: "Marc",
    sprite: "marc.png",
    description: "Zone d'effet - +30% zone",
    stats: {
      maxHp: 100,
      speed: 145,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      areaMultiplier: 1.3
    }
  },
  
  mathieu: {
    name: "Mathieu",
    sprite: "mathieu.png",
    description: "Dégâts - +25% dégâts",
    stats: {
      maxHp: 90,
      speed: 150,
      damageMultiplier: 1.25,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0
    }
  },
  
  sabah: {
    name: "Sabah",
    sprite: "sabah.png",
    description: "Magnétisme - +50% portée XP",
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      magnetRange: 100
    }
  },
  
  samy: {
    name: "Samy",
    sprite: "samy.png",
    description: "Esquive - +10% vitesse et esquive",
    stats: {
      maxHp: 85,
      speed: 165,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      dodgeChance: 0.1
    }
  },
  
  serge: {
    name: "Serge",
    sprite: "serge.png",
    description: "Boss Killer - +50% dégâts vs Boss",
    stats: {
      maxHp: 110,
      speed: 145,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      bossDamageMultiplier: 1.5
    }
  },
  
  thomas: {
    name: "Thomas",
    sprite: "thomas.png",
    description: "Croissance - Stats +5% par niveau",
    stats: {
      maxHp: 80,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      growthRate: 1.05
    }
  },
  
  valentin: {
    name: "Valentin",
    sprite: "valentin.png",
    description: "Chance - +20% meilleurs drops",
    stats: {
      maxHp: 100,
      speed: 150,
      damageMultiplier: 1.0,
      cooldownMultiplier: 1.0,
      xpMultiplier: 1.0,
      luckMultiplier: 1.2
    }
  }
};

export function getCharacterList() {
  return Object.keys(CHARACTERS).map(id => ({
    id,
    ...CHARACTERS[id]
  }));
}

export function getCharacter(id) {
  return CHARACTERS[id] || CHARACTERS.vincent;
}