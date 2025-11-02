// src/weapons/Boomerang.js
import BaseWeapon from "./BaseWeapon.js";
export default class Boomerang extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);
    this.damage = 12;
    this.speed = 400;
    this.maxDistance = 300;
    this.boomerangs = [];
  }

  update(dt) {
    // Logique va-et-vient
  }

  getHitboxes() {
    return this.boomerangs.map((b) => ({
      x: b.x,
      y: b.y,
      width: 32,
      height: 32,
      damage: this.damage,
    }));
  }

  render(ctx) {
    this.boomerangs.forEach((b) => {
      // Rendu avec rotation
    });
  }
}
