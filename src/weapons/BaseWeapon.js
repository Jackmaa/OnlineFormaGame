// src/weapons/BaseWeapon.js
export default class BaseWeapon {
  constructor(player, sprite) {
    this.player = player;
    this.sprite = sprite;
    this.damage = 10;
    this.level = 1;
    this.active = true;

    // ✅ NOUVEAU : Type de dégâts
    this.isDPS = false; // false = Burst (dégâts par hit), true = DPS (dégâts par seconde)

    // ✅ NOUVEAU : Tracking des hits pour éviter les hits multiples
    this.lastResetTime = 0;
    this.resetInterval = 0.3; // Reset toutes les 0.3 secondes
  }

  update(dt) {
    // À implémenter dans les classes enfants

    // ✅ NOUVEAU : Reset timer pour les armes burst
    if (!this.isDPS) {
      this.lastResetTime += dt;
    }
  }

  render(ctx) {
    // À implémenter dans les classes enfants
  }

  getHitboxes() {
    // À implémenter dans les classes enfants
    return [];
  }

  upgrade() {
    this.level++;
    // À implémenter dans les classes enfants
  }

  /**
   * ✅ NOUVEAU : Indique si les hits doivent être reset
   * @returns {boolean}
   */
  shouldResetHits() {
    if (this.lastResetTime >= this.resetInterval) {
      this.lastResetTime = 0;
      return true;
    }
    return false;
  }
}
