/* src/entities/Weapon.js */
export default class Weapon {
  constructor(x, y, sprite, width = 32, data) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = width;
    this.height = (width / sprite.width) * sprite.height;
    this.weaponData = data;
  }
  render(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }
}
