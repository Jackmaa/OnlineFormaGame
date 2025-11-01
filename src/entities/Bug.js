/* src/entities/Bug.js */
import XPGem from "./XPGem.js";
export default class Bug {
  constructor(x, y, sprite, width = 32) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.speed = 50;
    this.dir = { x: 0, y: 0 };
    this.timer = 0;
    this.hp = 5;
    this.contactDamage = 1;

    this.contactCooldown = 1.0; // 1 seconde entre deux contacts
    this.contactTimer = 0; // compte Ã  rebours initial
  }

  update(dt, player) {
    // dÃ©jÃ  existant : mouvement alÃ©atoire
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0.5 + Math.random();
      const a = Math.random() * Math.PI * 2;
      this.dir.x = Math.cos(a);
      this.dir.y = Math.sin(a);
    }
    this.x += this.dir.x * this.speed * dt;
    this.y += this.dir.y * this.speed * dt;

    // ** dÃ©crÃ©mente le timer de contact **
    if (this.contactTimer > 0) {
      this.contactTimer -= dt;
    }
  }
  render(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }

  /**
   * Ã€ appeler aprÃ¨s la mort (hp <= 0) pour crÃ©er une gemme d'XP.
   * @param {HTMLImageElement} xpSprite
   * @param {number} amount
   * @returns {XPGem}
   */
  dropXpGem(xpSprite, amount = 1) {
    return new XPGem(this.x, this.y, xpSprite, 32, amount);
  }
}
