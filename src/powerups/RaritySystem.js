// src/powerups/RaritySystem.js
// Système de rareté pour les power-ups

/**
 * Définition des rangs de rareté
 */
export const RARITY = {
  COMMON: {
    id: "common",
    name: "Commun",
    color: "#9CA3AF", // Gris
    multiplier: 1.0, // Valeur de base
    dropChance: 0.7, // 70%
    glowColor: "#D1D5DB",
    icon: "⚪",
  },
  UNCOMMON: {
    id: "uncommon",
    name: "Peu commun",
    color: "#10B981", // Vert
    multiplier: 1.5, // +50%
    dropChance: 0.2, // 20%
    glowColor: "#34D399",
    icon: "🟢",
  },
  RARE: {
    id: "rare",
    name: "Rare",
    color: "#3B82F6", // Bleu
    multiplier: 2.0, // +100%
    dropChance: 0.07, // 7%
    glowColor: "#60A5FA",
    icon: "🔵",
  },
  EPIC: {
    id: "epic",
    name: "Épique",
    color: "#A855F7", // Violet
    multiplier: 3.0, // +200%
    dropChance: 0.02, // 2%
    glowColor: "#C084FC",
    icon: "🟣",
  },
  LEGENDARY: {
    id: "legendary",
    name: "Légendaire",
    color: "#F59E0B", // Orange
    multiplier: 5.0, // +400%
    dropChance: 0.009, // 0.9%
    glowColor: "#FBBF24",
    icon: "🟠",
  },
  MYTHIC: {
    id: "mythic",
    name: "Mythique",
    color: "#EF4444", // Rouge
    multiplier: 10.0, // +900%
    dropChance: 0.001, // 0.1%
    glowColor: "#F87171",
    icon: "🔴",
  },
};

/**
 * Obtenir tous les rangs dans l'ordre
 */
export function getAllRarities() {
  return [
    RARITY.COMMON,
    RARITY.UNCOMMON,
    RARITY.RARE,
    RARITY.EPIC,
    RARITY.LEGENDARY,
    RARITY.MYTHIC,
  ];
}

/**
 * Calculer les probabilités ajustées avec la chance
 * @param {number} luckMultiplier - Multiplicateur de chance du joueur (1.0 = base, 1.2 = +20%)
 * @returns {Object} Probabilités ajustées pour chaque rang
 */
export function calculateDropRates(luckMultiplier = 1.0) {
  const rarities = getAllRarities();

  // La chance augmente les probabilités des rangs supérieurs
  // Formule : Plus on est chanceux, plus les rangs élevés sont probables
  const luckBonus = (luckMultiplier - 1.0) * 0.5; // 20% luck = +10% bonus aux rangs supérieurs

  const adjustedRates = {};
  let totalRate = 0;

  // Calculer les taux ajustés (les rangs élevés bénéficient plus de la chance)
  rarities.forEach((rarity, index) => {
    // Les rangs supérieurs (index plus élevé) profitent plus du bonus de chance
    const rarityBonus = (index / rarities.length) * luckBonus;
    const adjustedRate = rarity.dropChance * (1 + rarityBonus * 3);
    adjustedRates[rarity.id] = adjustedRate;
    totalRate += adjustedRate;
  });

  // Normaliser pour que le total fasse 1.0 (100%)
  Object.keys(adjustedRates).forEach((key) => {
    adjustedRates[key] /= totalRate;
  });

  return adjustedRates;
}

/**
 * Sélectionner un rang aléatoire basé sur la chance
 * @param {number} luckMultiplier - Multiplicateur de chance du joueur
 * @returns {Object} Rarity object
 */
export function rollRarity(luckMultiplier = 1.0) {
  const rates = calculateDropRates(luckMultiplier);
  const rarities = getAllRarities();

  const roll = Math.random();
  let cumulative = 0;

  for (const rarity of rarities) {
    cumulative += rates[rarity.id];
    if (roll < cumulative) {
      return rarity;
    }
  }

  // Fallback (ne devrait jamais arriver)
  return RARITY.COMMON;
}

/**
 * Obtenir le rang par ID
 * @param {string} id - ID du rang
 * @returns {Object} Rarity object
 */
export function getRarityById(id) {
  return getAllRarities().find((r) => r.id === id) || RARITY.COMMON;
}

/**
 * Afficher les probabilités pour le debug
 * @param {number} luckMultiplier - Multiplicateur de chance
 */
export function debugDropRates(luckMultiplier = 1.0) {
  const rates = calculateDropRates(luckMultiplier);
  const rarities = getAllRarities();

  console.log(`\n=== DROP RATES (Chance: ${luckMultiplier.toFixed(2)}x) ===`);
  rarities.forEach((rarity) => {
    const percentage = (rates[rarity.id] * 100).toFixed(2);
    console.log(`${rarity.icon} ${rarity.name}: ${percentage}%`);
  });
  console.log("==========================================\n");
}

/**
 * Classe pour un power-up avec rareté
 */
export class RarePowerUp {
  constructor(basePowerUp, rarity) {
    this.basePowerUp = basePowerUp;
    this.rarity = rarity;

    // Propriétés héritées avec rareté
    this.id = basePowerUp.id;
    this.name = basePowerUp.name;
    this.description = this.generateDescription();
    this.icon = basePowerUp.icon;
    this.currentLevel = basePowerUp.currentLevel;
    this.maxLevel = basePowerUp.maxLevel;
  }

  /**
   * Générer une description qui inclut la rareté
   */
  generateDescription() {
    const baseDesc = this.basePowerUp.description;
    const mult = this.rarity.multiplier;

    if (mult === 1.0) {
      return baseDesc;
    } else {
      return `${baseDesc} (×${mult})`;
    }
  }

  /**
   * Appliquer l'effet avec le multiplicateur de rareté
   */
  apply(player) {
    // Sauvegarder le multiplicateur actuel du power-up
    const originalMult = this.basePowerUp.multiplier || 1.0;

    // Appliquer temporairement le multiplicateur de rareté
    this.basePowerUp.multiplier = originalMult * this.rarity.multiplier;

    // Appliquer l'effet
    this.basePowerUp.apply(player);

    // Restaurer le multiplicateur original
    this.basePowerUp.multiplier = originalMult;
  }

  /**
   * Vérifier si peut être amélioré
   */
  canLevelUp() {
    return this.basePowerUp.canLevelUp();
  }

  /**
   * Améliorer le power-up
   */
  levelUp(player) {
    if (!this.canLevelUp()) return false;

    this.currentLevel++;
    this.basePowerUp.currentLevel = this.currentLevel;
    this.apply(player);

    return true;
  }
}

/**
 * Test unitaire du système
 */
export function testRaritySystem() {
  console.log("\n🎲 TEST DU SYSTÈME DE RARETÉ\n");

  // Test 1: Probabilités de base
  console.log("📊 Test 1: Probabilités de base (luck = 1.0)");
  debugDropRates(1.0);

  // Test 2: Avec 20% de chance
  console.log("📊 Test 2: Avec bonus de chance (luck = 1.2)");
  debugDropRates(1.2);

  // Test 3: Avec 50% de chance
  console.log("📊 Test 3: Avec beaucoup de chance (luck = 1.5)");
  debugDropRates(1.5);

  // Test 4: Simulation de 1000 rolls
  console.log("📊 Test 4: Simulation de 1000 rolls (luck = 1.2)");
  const counts = {};
  getAllRarities().forEach((r) => (counts[r.id] = 0));

  for (let i = 0; i < 1000; i++) {
    const rarity = rollRarity(1.2);
    counts[rarity.id]++;
  }

  console.log("Résultats:");
  getAllRarities().forEach((rarity) => {
    const count = counts[rarity.id];
    const percentage = ((count / 1000) * 100).toFixed(1);
    console.log(
      `${rarity.icon} ${rarity.name}: ${count}/1000 (${percentage}%)`
    );
  });

  console.log("\n✅ Tests terminés!\n");
}
