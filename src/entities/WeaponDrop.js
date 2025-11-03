// src/systems/WeaponDropSystem.js
// VERSION PRODUCTION - Chances de drop équilibrées

export default class WeaponDropSystem {
  constructor() {
    // ✅ Définition des armes avec chances de drop ÉQUILIBRÉES
    this.weapons = [
      // LÉGENDAIRES - Très rares (0.2% - 0.5%)
      {
        id: "laser",
        type: "laser",
        name: "Laser Infernal",
        icon: "🔴",
        rarity: "legendary",
        baseDropChance: 0.003, // 0.3% de base
        description: "Laser rotatif qui cible automatiquement",
        color: "#EF4444",
      },
      {
        id: "guidedMissile",
        type: "guidedMissile",
        name: "Missile Guidé",
        icon: "🚀",
        rarity: "legendary",
        baseDropChance: 0.003, // 0.3% de base
        description: "Missiles à tête chercheuse",
        color: "#F59E0B",
      },

      // ÉPIQUES - Rares (1% - 2%)
      {
        id: "flamethrower",
        type: "orbital",
        name: "Lance-flammes",
        icon: "🔥",
        rarity: "epic",
        baseDropChance: 0.012, // 1.2% de base
        description: "Cône de flammes dévastateur",
        color: "#A855F7",
      },
      {
        id: "lightning",
        type: "projectile",
        name: "Éclair Foudroyant",
        icon: "⚡",
        rarity: "epic",
        baseDropChance: 0.012, // 1.2% de base
        description: "Éclairs en chaîne",
        color: "#8B5CF6",
      },

      // RARES - Peu communs (3% - 5%)
      {
        id: "multiShot",
        type: "projectile",
        name: "Tir Multiple",
        icon: "🎯",
        rarity: "rare",
        baseDropChance: 0.035, // 3.5% de base
        description: "Tire plusieurs projectiles",
        color: "#3B82F6",
      },
      {
        id: "orbitalShield",
        type: "orbital",
        name: "Bouclier Orbital",
        icon: "🛡️",
        rarity: "rare",
        baseDropChance: 0.035, // 3.5% de base
        description: "Orbitales défensives",
        color: "#06B6D4",
      },
    ];

    // Statistiques de drops (pour debug)
    this.dropStats = {
      totalAttempts: 0,
      totalDrops: 0,
      dropsByWeapon: {},
    };

    // Initialiser les stats
    this.weapons.forEach((weapon) => {
      this.dropStats.dropsByWeapon[weapon.id] = 0;
    });
  }

  /**
   * ✅ Calcule la chance de drop ajustée par la luck et la rareté
   * @param {Object} weapon - Données de l'arme
   * @param {number} luckMultiplier - Multiplicateur de luck du joueur
   * @returns {number} Chance de drop finale (0.0 à 1.0)
   */
  calculateDropChance(weapon, luckMultiplier = 1.0) {
    let chance = weapon.baseDropChance;

    // ✅ Formule de luck basée sur la rareté
    switch (weapon.rarity) {
      case "legendary":
        // Effet quadratique pour les légendaires
        chance *= Math.pow(luckMultiplier, 2);
        break;
      case "epic":
        // Effet x1.5 pour les épiques
        chance *= Math.pow(luckMultiplier, 1.5);
        break;
      case "rare":
        // Effet linéaire pour les rares
        chance *= luckMultiplier;
        break;
    }

    // Cap à 20% maximum (pour éviter les drops trop fréquents même avec beaucoup de luck)
    return Math.min(chance, 0.2);
  }

  /**
   * ✅ Tente de dropper une arme aléatoire
   * @param {number} luckMultiplier - Multiplicateur de luck du joueur
   * @returns {Object|null} Données de l'arme droppée ou null
   */
  tryDrop(luckMultiplier = 1.0) {
    this.dropStats.totalAttempts++;

    // ✅ Calculer les chances pour toutes les armes
    const weaponChances = this.weapons.map((weapon) => ({
      weapon,
      chance: this.calculateDropChance(weapon, luckMultiplier),
    }));

    // ✅ Sélection pondérée (les armes rares ont moins de chance)
    const roll = Math.random();
    let cumulative = 0;

    for (const { weapon, chance } of weaponChances) {
      cumulative += chance;
      if (roll < cumulative) {
        this.dropStats.totalDrops++;
        this.dropStats.dropsByWeapon[weapon.id]++;

        console.log(
          `✨ ARME DROPPÉE: ${weapon.name} (${weapon.rarity}) - Chance: ${(
            chance * 100
          ).toFixed(3)}%`
        );

        return weapon;
      }
    }

    return null; // Pas de drop
  }

  /**
   * ✅ Obtenir les armes par rareté
   * @param {string} rarity - "legendary", "epic", "rare"
   * @returns {Array} Liste des armes de cette rareté
   */
  getWeaponsByRarity(rarity) {
    return this.weapons.filter((w) => w.rarity === rarity);
  }

  /**
   * ✅ Obtenir une arme par ID
   * @param {string} id - ID de l'arme
   * @returns {Object|null} Données de l'arme ou null
   */
  getWeaponById(id) {
    return this.weapons.find((w) => w.id === id) || null;
  }

  /**
   * ✅ Afficher les statistiques de drop (debug)
   * @param {number} luckMultiplier - Multiplicateur de luck
   */
  debugDropRates(luckMultiplier = 1.0) {
    console.log(
      `\n=== 🎁 DROP RATES (Luck: ${luckMultiplier.toFixed(2)}x) ===`
    );

    const rarityOrder = {
      legendary: 1,
      epic: 2,
      rare: 3,
    };

    const sortedWeapons = [...this.weapons].sort(
      (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]
    );

    sortedWeapons.forEach((weapon) => {
      const baseChance = (weapon.baseDropChance * 100).toFixed(3);
      const actualChance = (
        this.calculateDropChance(weapon, luckMultiplier) * 100
      ).toFixed(3);
      const rarityIcon = {
        legendary: "🟠",
        epic: "🟣",
        rare: "🔵",
      }[weapon.rarity];

      console.log(
        `${rarityIcon} ${weapon.name} (${weapon.rarity}): ${baseChance}% → ${actualChance}%`
      );
    });

    console.log("=========================================\n");
  }

  /**
   * ✅ Afficher les statistiques de drop actuelles
   */
  debugDropStats() {
    console.log("\n=== 📊 DROP STATISTICS ===");
    console.log(`Total attempts: ${this.dropStats.totalAttempts}`);
    console.log(`Total drops: ${this.dropStats.totalDrops}`);

    if (this.dropStats.totalAttempts > 0) {
      const dropRate =
        (this.dropStats.totalDrops / this.dropStats.totalAttempts) * 100;
      console.log(`Drop rate: ${dropRate.toFixed(2)}%`);
    }

    console.log("\nDrops by weapon:");

    Object.entries(this.dropStats.dropsByWeapon).forEach(([id, count]) => {
      const weapon = this.getWeaponById(id);
      if (weapon && count > 0) {
        console.log(`  ${weapon.icon} ${weapon.name}: ${count}`);
      }
    });

    console.log("==========================\n");
  }

  /**
   * ✅ Réinitialiser les statistiques
   */
  resetStats() {
    this.dropStats.totalAttempts = 0;
    this.dropStats.totalDrops = 0;
    Object.keys(this.dropStats.dropsByWeapon).forEach((key) => {
      this.dropStats.dropsByWeapon[key] = 0;
    });
  }

  /**
   * ✅ Ajouter une nouvelle arme au système
   * @param {Object} weaponData - Données de l'arme
   */
  addWeapon(weaponData) {
    // Vérifier que l'arme n'existe pas déjà
    if (this.weapons.find((w) => w.id === weaponData.id)) {
      console.warn(`⚠️ L'arme ${weaponData.id} existe déjà`);
      return false;
    }

    this.weapons.push(weaponData);
    this.dropStats.dropsByWeapon[weaponData.id] = 0;
    console.log(`✅ Arme ajoutée: ${weaponData.name}`);
    return true;
  }

  /**
   * ✅ Obtenir le nombre total d'armes
   * @returns {number} Nombre d'armes
   */
  getWeaponCount() {
    return this.weapons.length;
  }

  /**
   * ✅ Obtenir toutes les armes
   * @returns {Array} Liste de toutes les armes
   */
  getAllWeapons() {
    return [...this.weapons];
  }

  /**
   * ✅ Calculer les chances attendues sur un nombre donné de tentatives
   * @param {number} attempts - Nombre de tentatives
   * @param {number} luckMultiplier - Multiplicateur de luck
   * @returns {Object} Statistiques attendues
   */
  getExpectedDrops(attempts, luckMultiplier = 1.0) {
    const expected = {};
    let totalExpected = 0;

    this.weapons.forEach((weapon) => {
      const chance = this.calculateDropChance(weapon, luckMultiplier);
      const expectedCount = attempts * chance;
      expected[weapon.id] = {
        name: weapon.name,
        rarity: weapon.rarity,
        expectedCount: expectedCount,
        percentage: (chance * 100).toFixed(3) + "%",
      };
      totalExpected += expectedCount;
    });

    return {
      totalAttempts: attempts,
      totalExpected: totalExpected,
      expectedDropRate: ((totalExpected / attempts) * 100).toFixed(2) + "%",
      byWeapon: expected,
    };
  }
}

/**
 * ✅ Test du système avec simulation
 */
export function testWeaponDropSystem() {
  console.log("\n🎮 TEST DU SYSTÈME DE DROP D'ARMES (VERSION PRODUCTION)\n");

  const system = new WeaponDropSystem();

  // Test 1: Afficher les drop rates
  console.log("📊 Test 1: Drop rates avec luck normale (1.0)");
  system.debugDropRates(1.0);

  console.log("📊 Test 2: Drop rates avec luck de Valentin (1.2)");
  system.debugDropRates(1.2);

  console.log("📊 Test 3: Drop rates avec beaucoup de luck (2.0)");
  system.debugDropRates(2.0);

  // Test 4: Calcul des drops attendus
  console.log("📊 Test 4: Drops attendus sur 1000 gemmes XP (luck 1.2)");
  const expected = system.getExpectedDrops(1000, 1.2);
  console.log(
    `Total attendu: ${expected.totalExpected.toFixed(2)} drops (${
      expected.expectedDropRate
    })`
  );
  console.log("\nPar arme:");
  Object.entries(expected.byWeapon).forEach(([id, data]) => {
    const weapon = system.getWeaponById(id);
    console.log(
      `  ${weapon.icon} ${data.name}: ${data.expectedCount.toFixed(2)} drops (${
        data.percentage
      })`
    );
  });

  // Test 5: Simulation de 10000 drops
  console.log("\n📊 Test 5: Simulation de 10000 tentatives de drop (luck 1.2)");
  system.resetStats();

  for (let i = 0; i < 10000; i++) {
    system.tryDrop(1.2);
  }

  system.debugDropStats();

  console.log("✅ Tests terminés!\n");
}
