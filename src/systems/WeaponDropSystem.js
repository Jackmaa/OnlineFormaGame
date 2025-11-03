// src/systems/WeaponDropSystem.js
// Système de drop d'armes légendaires amélioré

export default class WeaponDropSystem {
  constructor() {
    // ✅ Définition des armes avec leurs raretés et chances de drop
    this.weapons = [
      // LÉGENDAIRES
      {
        id: "laser",
        type: "laser",
        name: "Laser Infernal",
        icon: "🔴",
        rarity: "legendary",
        baseDropChance: 0.02, // 2% de base
        description: "Laser rotatif qui cible automatiquement",
        color: "#EF4444",
      },
      {
        id: "guidedMissile",
        type: "guidedMissile",
        name: "Missile Guidé",
        icon: "🚀",
        rarity: "legendary",
        baseDropChance: 0.02, // 2% de base
        description: "Missiles à tête chercheuse",
        color: "#F59E0B",
      },

      // ÉPIQUES (Futures armes à ajouter)
      {
        id: "flamethrower",
        type: "orbital", // Utiliser orbital en attendant
        name: "Lance-flammes",
        icon: "🔥",
        rarity: "epic",
        baseDropChance: 0.05, // 5% de base
        description: "Cône de flammes dévastateur",
        color: "#A855F7",
      },
      {
        id: "lightning",
        type: "projectile", // Utiliser projectile en attendant
        name: "Éclair Foudroyant",
        icon: "⚡",
        rarity: "epic",
        baseDropChance: 0.05,
        description: "Éclairs en chaîne",
        color: "#8B5CF6",
      },

      // RARES
      {
        id: "multiShot",
        type: "projectile",
        name: "Tir Multiple",
        icon: "🎯",
        rarity: "rare",
        baseDropChance: 0.08, // 8% de base
        description: "Tire plusieurs projectiles",
        color: "#3B82F6",
      },
      {
        id: "orbitalShield",
        type: "orbital",
        name: "Bouclier Orbital",
        icon: "🛡️",
        rarity: "rare",
        baseDropChance: 0.08,
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

    // Cap à 50% maximum
    return Math.min(chance, 0.5);
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
          ).toFixed(2)}%`
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
      const baseChance = (weapon.baseDropChance * 100).toFixed(2);
      const actualChance = (
        this.calculateDropChance(weapon, luckMultiplier) * 100
      ).toFixed(2);
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
    console.log(
      `Drop rate: ${(
        (this.dropStats.totalDrops / this.dropStats.totalAttempts) *
        100
      ).toFixed(2)}%`
    );
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
}

/**
 * ✅ Test du système
 */
export function testWeaponDropSystem() {
  console.log("\n🎮 TEST DU SYSTÈME DE DROP D'ARMES\n");

  const system = new WeaponDropSystem();

  // Test 1: Afficher les drop rates
  console.log("📊 Test 1: Drop rates avec luck normale (1.0)");
  system.debugDropRates(1.0);

  console.log("📊 Test 2: Drop rates avec luck de Valentin (1.2)");
  system.debugDropRates(1.2);

  console.log("📊 Test 3: Drop rates avec beaucoup de luck (2.0)");
  system.debugDropRates(2.0);

  // Test 4: Simulation de 1000 drops
  console.log("📊 Test 4: Simulation de 1000 tentatives de drop (luck 1.2)");
  system.resetStats();

  for (let i = 0; i < 1000; i++) {
    system.tryDrop(1.2);
  }

  system.debugDropStats();

  console.log("✅ Tests terminés!\n");
}
