// src/entities/Computer.js
export default class Computer {
  /**
   * @param {number} x
   * @param {number} y
   * @param {HTMLImageElement} sprite
   * @param {number} width
   */
  constructor(x, y, sprite, width = 64) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.isPurified = false;
  }

  render(ctx) {
    if (this.isPurified) {
      ctx.globalAlpha = 0.6;
    }
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    ctx.globalAlpha = 1;
  }
}
