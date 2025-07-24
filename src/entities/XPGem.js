// src/entities/XPGem.js
export default class XPGem {
  /**
   * @param {number} x
   * @param {number} y
   * @param {HTMLImageElement} sprite
   * @param {number} width
   * @param {number} value — quantité d'XP donnée
   */
  constructor(x, y, sprite, width = 32, value = 5) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.value = value;
    this.collected = false;
  }

  update(dt, player) {
    // Collision simple
    if (
      !this.collected &&
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      player.gainXp(this.value);
      this.collected = true;
    }
  }

  render(ctx) {
    if (this.collected) return;
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }
}
